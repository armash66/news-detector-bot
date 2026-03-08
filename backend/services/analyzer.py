"""
Main analysis orchestrator.

Coordinates all modules into a single analysis pipeline:
  URL/Text -> Scraping -> Classification -> Claim Extraction
            -> Evidence Retrieval -> Credibility Scoring -> Explainability

Returns a comprehensive CredibilityReport.
"""

from dataclasses import dataclass, field, asdict
from typing import Optional

from backend.models.classifier import MisinformationClassifier, ClassificationResult
from backend.models.credibility import CredibilityScorer, CredibilityReport
from backend.models.clickbait import ClickbaitDetector, ClickbaitResult
from backend.scrapers.article_scraper import ArticleScraper, ScrapedArticle
from backend.services.claim_extractor import ClaimExtractor, ExtractedClaim
from backend.services.evidence_retriever import EvidenceRetriever, EvidenceResult
from backend.services.explainability import ExplainabilityEngine, ExplanationResult
from backend.utils.logger import get_logger

logger = get_logger("analyzer")


@dataclass
class AnalysisReport:
    """Complete analysis output for an article or claim."""
    # Input
    input_text: str = ""
    input_url: Optional[str] = None

    # Scraped content
    article: Optional[dict] = None

    # Classification
    classification: Optional[dict] = None

    # Claims
    claims: list[dict] = field(default_factory=list)

    # Evidence
    evidence: list[dict] = field(default_factory=list)

    # Clickbait
    clickbait: Optional[dict] = None

    # Credibility
    credibility: Optional[dict] = None

    # Explanations
    explanations: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return asdict(self)


class ArticleAnalyzer:
    """End-to-end misinformation analysis pipeline.

    Orchestrates scraping, classification, claim extraction,
    evidence retrieval, credibility scoring, and explainability
    into a unified analysis flow.

    Example:
        analyzer = ArticleAnalyzer()
        report = analyzer.analyze_url("https://example.com/suspicious-article")
        print(report.credibility)
    """

    def __init__(
        self,
        classifier: Optional[MisinformationClassifier] = None,
        model_name: Optional[str] = None,
        checkpoint_path: Optional[str] = None,
    ):
        logger.info("Initializing ArticleAnalyzer...")
        self.scraper = ArticleScraper()
        self.claim_extractor = ClaimExtractor()
        self.evidence_retriever = EvidenceRetriever()
        self.clickbait_detector = ClickbaitDetector()
        self.credibility_scorer = CredibilityScorer()

        if classifier:
            self.classifier = classifier
        else:
            self.classifier = MisinformationClassifier(
                model_name=model_name,
                checkpoint_path=checkpoint_path,
            )
        self.explainability = ExplainabilityEngine(classifier=self.classifier)
        logger.info("ArticleAnalyzer ready")

    def analyze_text(
        self,
        text: str,
        explain: bool = True,
        explanation_methods: Optional[list[str]] = None,
    ) -> AnalysisReport:
        """Analyze raw article text.

        Args:
            text: Article body text.
            explain: Whether to generate explanations.
            explanation_methods: Which explanation methods to use.

        Returns:
            Complete AnalysisReport.
        """
        report = AnalysisReport(input_text=text[:500])
        logger.info("Analyzing text (%d chars)", len(text))

        # 1. Classify
        classification = self.classifier.predict(text, return_attention=explain)
        report.classification = {
            "label": classification.label,
            "confidence": classification.confidence,
            "probabilities": classification.probabilities,
        }
        logger.info(
            "Classification: %s (%.1f%%)",
            classification.label,
            classification.confidence * 100,
        )

        # 2. Extract claims
        claims = self.claim_extractor.extract(text)
        report.claims = [
            {
                "text": c.text,
                "type": c.claim_type,
                "confidence": c.confidence,
                "entities": c.entities,
            }
            for c in claims
        ]

        # 3. Evidence retrieval
        if claims:
            claim_texts = [c.text for c in claims[:5]]
            evidence_results = self.evidence_retriever.search_for_claims(
                claim_texts, max_per_claim=3
            )
            total_evidence = 0
            total_supporting = 0
            for ev in evidence_results:
                total_evidence += ev.total_found
                total_supporting += ev.supporting
                report.evidence.append({
                    "query": ev.query[:100],
                    "total_found": ev.total_found,
                    "supporting": ev.supporting,
                    "contradicting": ev.contradicting,
                    "articles": [
                        {
                            "title": a.title,
                            "url": a.url,
                            "source": a.source,
                            "supports": a.supports_claim,
                        }
                        for a in ev.articles
                    ],
                })
        else:
            total_evidence = 0
            total_supporting = 0

        # 4. Clickbait analysis
        # Use first line as headline proxy
        lines = text.strip().split("\n")
        headline = lines[0] if lines else ""
        body = text
        clickbait = self.clickbait_detector.analyze(headline, body)
        report.clickbait = {
            "score": clickbait.score,
            "is_clickbait": clickbait.is_clickbait,
            "flags": clickbait.flags,
        }

        # 5. Credibility scoring
        model_conf_real = classification.probabilities.get("REAL", 0.5)
        credibility = self.credibility_scorer.score(
            model_confidence_real=model_conf_real,
            evidence_found=total_evidence,
            evidence_supporting=total_supporting,
            clickbait_score=clickbait.score,
            text=text,
        )
        report.credibility = {
            "score": credibility.credibility_score,
            "verdict": credibility.verdict,
            "reasons": credibility.reasons,
            "component_scores": credibility.component_scores,
        }

        # 6. Explainability
        if explain:
            methods = explanation_methods or ["attention"]
            explanations = self.explainability.explain(
                text, classifier=self.classifier, methods=methods
            )
            for method_name, exp in explanations.items():
                report.explanations[method_name] = {
                    "summary": exp.summary,
                    "top_suspicious_phrases": exp.top_suspicious_phrases,
                    "token_importances": [
                        {"token": t.token, "score": t.score, "suspicious": t.is_suspicious}
                        for t in exp.token_importances[:20]
                    ],
                }

        logger.info(
            "Analysis complete. Credibility: %.1f%% (%s)",
            credibility.credibility_score,
            credibility.verdict,
        )
        return report

    def analyze_url(
        self,
        url: str,
        explain: bool = True,
        explanation_methods: Optional[list[str]] = None,
    ) -> AnalysisReport:
        """Scrape and analyze an article from a URL.

        Args:
            url: Article URL.
            explain: Whether to generate explanations.
            explanation_methods: Which explanation methods to use.

        Returns:
            Complete AnalysisReport.
        """
        logger.info("Scraping URL: %s", url)
        scraped = self.scraper.scrape(url)

        if not scraped.success or not scraped.content:
            return AnalysisReport(
                input_url=url,
                article=scraped.to_dict(),
                credibility={
                    "score": 0,
                    "verdict": "Unable to analyze",
                    "reasons": [f"Failed to scrape content: {scraped.error}"],
                    "component_scores": {},
                },
            )

        report = self.analyze_text(
            scraped.content,
            explain=explain,
            explanation_methods=explanation_methods,
        )
        report.input_url = url
        report.article = {
            "title": scraped.title,
            "authors": scraped.authors,
            "publish_date": scraped.publish_date,
            "source_domain": scraped.source_domain,
            "word_count": scraped.word_count,
        }

        # Update credibility with source domain info
        if report.credibility:
            source_cred = self.credibility_scorer.score(
                model_confidence_real=report.classification.get(
                    "probabilities", {}
                ).get("REAL", 0.5)
                if report.classification else 0.5,
                source_domain=scraped.source_domain,
                evidence_found=sum(
                    e.get("total_found", 0) for e in report.evidence
                ),
                evidence_supporting=sum(
                    e.get("supporting", 0) for e in report.evidence
                ),
                clickbait_score=report.clickbait.get("score", 0)
                if report.clickbait else 0,
                text=scraped.content,
            )
            report.credibility = {
                "score": source_cred.credibility_score,
                "verdict": source_cred.verdict,
                "reasons": source_cred.reasons,
                "component_scores": source_cred.component_scores,
            }

        return report

    def verify_claim(
        self,
        claim: str,
        explain: bool = True,
    ) -> AnalysisReport:
        """Verify a single factual claim.

        Args:
            claim: The claim text to verify.
            explain: Whether to generate explanations.

        Returns:
            AnalysisReport focused on the single claim.
        """
        logger.info("Verifying claim: '%s'", claim[:80])

        report = AnalysisReport(input_text=claim)

        # Classify the claim directly
        classification = self.classifier.predict(claim, return_attention=explain)
        report.classification = {
            "label": classification.label,
            "confidence": classification.confidence,
            "probabilities": classification.probabilities,
        }

        # The claim itself is the claim
        report.claims = [
            {
                "text": claim,
                "type": "user_submitted",
                "confidence": 1.0,
                "entities": [],
            }
        ]

        # Evidence retrieval
        evidence = self.evidence_retriever.search(claim, max_results=5)
        report.evidence = [
            {
                "query": evidence.query,
                "total_found": evidence.total_found,
                "supporting": evidence.supporting,
                "contradicting": evidence.contradicting,
                "articles": [
                    {
                        "title": a.title,
                        "url": a.url,
                        "source": a.source,
                        "supports": a.supports_claim,
                    }
                    for a in evidence.articles
                ],
            }
        ]

        # Credibility
        model_conf_real = classification.probabilities.get("REAL", 0.5)
        credibility = self.credibility_scorer.score(
            model_confidence_real=model_conf_real,
            evidence_found=evidence.total_found,
            evidence_supporting=evidence.supporting,
            text=claim,
        )
        report.credibility = {
            "score": credibility.credibility_score,
            "verdict": credibility.verdict,
            "reasons": credibility.reasons,
            "component_scores": credibility.component_scores,
        }

        # Explanations
        if explain:
            explanations = self.explainability.explain(
                claim, classifier=self.classifier, methods=["attention"]
            )
            for method_name, exp in explanations.items():
                report.explanations[method_name] = {
                    "summary": exp.summary,
                    "top_suspicious_phrases": exp.top_suspicious_phrases,
                    "token_importances": [
                        {"token": t.token, "score": t.score, "suspicious": t.is_suspicious}
                        for t in exp.token_importances[:20]
                    ],
                }

        return report
