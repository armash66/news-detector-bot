"""
Credibility scoring engine.

Aggregates signals from:
  - Transformer model prediction
  - Source domain reputation
  - Evidence retrieval support
  - Clickbait analysis
  - Language pattern analysis

Produces a final 0-100 credibility score with a human-readable verdict.
"""

from dataclasses import dataclass, field
from typing import Optional
from urllib.parse import urlparse

from backend.utils.config import settings
from backend.utils.logger import get_logger

logger = get_logger("credibility")


@dataclass
class CredibilityReport:
    """Final credibility assessment."""
    credibility_score: float  # 0-100
    verdict: str
    reasons: list[str] = field(default_factory=list)
    component_scores: dict[str, float] = field(default_factory=dict)
    evidence_summary: Optional[str] = None

    @property
    def verdict_emoji(self) -> str:
        if self.credibility_score >= 75:
            return "Likely Credible"
        elif self.credibility_score >= 50:
            return "Mixed Credibility"
        elif self.credibility_score >= 25:
            return "Likely Misinformation"
        else:
            return "High Risk Misinformation"


class CredibilityScorer:
    """Multi-signal credibility scorer.

    Combines five independent signals into a weighted composite score
    to determine the credibility of a news article or claim.

    Weight distribution:
        - Model prediction:     35%
        - Source credibility:    20%
        - Evidence support:      25%
        - Clickbait detection:   10%
        - Language patterns:     10%
    """

    WEIGHTS = {
        "model_prediction": 0.35,
        "source_credibility": 0.20,
        "evidence_support": 0.25,
        "clickbait": 0.10,
        "language_patterns": 0.10,
    }

    def score(
        self,
        model_confidence_real: float,
        source_domain: str = "",
        evidence_found: int = 0,
        evidence_supporting: int = 0,
        clickbait_score: float = 0.0,
        text: str = "",
    ) -> CredibilityReport:
        """Compute composite credibility score.

        Args:
            model_confidence_real: Probability the model assigns to REAL (0-1).
            source_domain: Domain of the source article.
            evidence_found: Number of evidence articles retrieved.
            evidence_supporting: Number of evidence articles supporting claims.
            clickbait_score: Clickbait score from ClickbaitDetector (0-1).
            text: Article text for language pattern analysis.

        Returns:
            CredibilityReport with composite score, verdict, and reasons.
        """
        reasons: list[str] = []
        components: dict[str, float] = {}

        # --- 1. Model prediction (0-100) ---
        model_score = model_confidence_real * 100
        components["model_prediction"] = round(model_score, 1)
        if model_confidence_real < 0.4:
            reasons.append("AI model flagged content as likely fabricated")
        elif model_confidence_real > 0.75:
            reasons.append("AI model indicates content is likely authentic")

        # --- 2. Source credibility (0-100) ---
        source_score = self._score_source(source_domain)
        components["source_credibility"] = source_score
        if source_score < 30:
            reasons.append(f"Source domain '{source_domain}' has low credibility rating")
        elif source_score > 70:
            reasons.append(f"Source domain '{source_domain}' is a trusted publisher")

        # --- 3. Evidence support (0-100) ---
        evidence_score = self._score_evidence(evidence_found, evidence_supporting)
        components["evidence_support"] = evidence_score
        if evidence_found == 0:
            reasons.append("No corroborating evidence found from reliable sources")
        elif evidence_supporting > 0:
            reasons.append(
                f"{evidence_supporting}/{evidence_found} retrieved sources "
                "support the claims"
            )
        else:
            reasons.append("Retrieved sources do not corroborate the claims")

        # --- 4. Clickbait (0-100) ---
        clickbait_credibility = (1.0 - clickbait_score) * 100
        components["clickbait"] = round(clickbait_credibility, 1)
        if clickbait_score >= 0.5:
            reasons.append("Headline uses sensational or clickbait language")

        # --- 5. Language patterns (0-100) ---
        lang_score = self._score_language(text)
        components["language_patterns"] = lang_score
        if lang_score < 40:
            reasons.append("Text contains manipulative or emotionally charged language")

        # --- Composite ---
        composite = sum(
            components[k] * self.WEIGHTS[k] for k in self.WEIGHTS
        )
        composite = round(max(0, min(100, composite)), 1)

        verdict = self._verdict(composite)

        report = CredibilityReport(
            credibility_score=composite,
            verdict=verdict,
            reasons=reasons,
            component_scores=components,
        )
        logger.info("Credibility score: %.1f%% - %s", composite, verdict)
        return report

    # ------------------------------------------------------------------
    # Component scorers
    # ------------------------------------------------------------------

    def _score_source(self, domain: str) -> float:
        """Rate domain credibility (0-100)."""
        if not domain:
            return 50.0  # Unknown

        clean = domain.lower().replace("www.", "")

        if any(td in clean for td in settings.trusted_domains):
            return 90.0
        if any(ld in clean for ld in settings.low_credibility_domains):
            return 10.0

        # Heuristics for unknown domains
        if clean.endswith((".gov", ".edu", ".org")):
            return 70.0
        return 50.0

    @staticmethod
    def _score_evidence(found: int, supporting: int) -> float:
        """Rate evidence support (0-100)."""
        if found == 0:
            return 30.0  # No evidence is a mild negative signal
        support_ratio = supporting / found
        return round(30 + support_ratio * 70, 1)

    @staticmethod
    def _score_language(text: str) -> float:
        """Analyze language patterns for manipulation indicators (0-100)."""
        if not text:
            return 50.0

        text_lower = text.lower()
        word_count = len(text.split())

        manipulation_markers = [
            "they don't want you to know",
            "the mainstream media won't tell you",
            "exposed",
            "cover-up",
            "conspiracy",
            "wake up",
            "big pharma",
            "deep state",
        ]
        emotional_amplifiers = [
            "absolutely", "totally", "completely", "undeniably",
            "without a doubt", "100%", "guaranteed",
        ]

        marker_count = sum(1 for m in manipulation_markers if m in text_lower)
        amplifier_count = sum(1 for a in emotional_amplifiers if a in text_lower)

        # Deduct points for manipulation markers
        penalty = marker_count * 12 + amplifier_count * 5

        # Bonus for longer, well-structured text (citations, quotes)
        length_bonus = min(word_count / 50, 15)

        score = 80 - penalty + length_bonus
        return round(max(0, min(100, score)), 1)

    @staticmethod
    def _verdict(score: float) -> str:
        if score >= 75:
            return "Likely Credible"
        elif score >= 50:
            return "Mixed Credibility"
        elif score >= 25:
            return "Likely Misinformation"
        else:
            return "High Risk Misinformation"
