"""
Evidence retrieval module.

Searches trusted news sources for corroborating or contradicting
evidence related to extracted claims. Supports NewsAPI and SerpAPI.
"""

from dataclasses import dataclass, field
from typing import Optional

import requests

from backend.utils.config import settings
from backend.utils.logger import get_logger

logger = get_logger("evidence_retriever")


@dataclass
class EvidenceArticle:
    """A single piece of retrieved evidence."""
    title: str
    url: str
    source: str
    snippet: str = ""
    published_at: Optional[str] = None
    relevance_score: float = 0.0
    supports_claim: Optional[bool] = None  # None = inconclusive


@dataclass
class EvidenceResult:
    """Aggregated evidence for a claim or article."""
    query: str
    articles: list[EvidenceArticle] = field(default_factory=list)
    total_found: int = 0
    supporting: int = 0
    contradicting: int = 0

    @property
    def support_ratio(self) -> float:
        if not self.articles:
            return 0.0
        return self.supporting / len(self.articles)


class EvidenceRetriever:
    """Retrieves corroborating evidence from trusted news sources.

    Uses NewsAPI as primary source and SerpAPI as fallback for
    broader web search.
    """

    NEWSAPI_BASE = "https://newsapi.org/v2/everything"
    SERPAPI_BASE = "https://serpapi.com/search.json"

    def __init__(
        self,
        news_api_key: Optional[str] = None,
        serp_api_key: Optional[str] = None,
    ):
        self.news_api_key = news_api_key or settings.news_api_key
        self.serp_api_key = serp_api_key or settings.serp_api_key

    def search(
        self,
        query: str,
        max_results: int = 5,
    ) -> EvidenceResult:
        """Search for evidence related to a query.

        Tries NewsAPI first, then SerpAPI, then returns empty if neither
        API key is configured.

        Args:
            query: Search string (typically a claim or key phrases).
            max_results: Maximum number of articles to retrieve.

        Returns:
            EvidenceResult with retrieved articles.
        """
        result = EvidenceResult(query=query)

        if self.news_api_key:
            articles = self._search_newsapi(query, max_results)
            result.articles.extend(articles)

        if len(result.articles) < max_results and self.serp_api_key:
            remaining = max_results - len(result.articles)
            articles = self._search_serpapi(query, remaining)
            result.articles.extend(articles)

        if not result.articles:
            logger.warning(
                "No evidence retrieved for query: '%s'. "
                "Configure NEWS_API_KEY or SERP_API_KEY in .env",
                query[:80],
            )
            return result

        # Classify support
        result = self._classify_support(result, query)
        result.total_found = len(result.articles)
        logger.info(
            "Retrieved %d evidence articles for '%s' (%d supporting)",
            result.total_found,
            query[:50],
            result.supporting,
        )
        return result

    def search_for_claims(
        self,
        claims: list[str],
        max_per_claim: int = 3,
    ) -> list[EvidenceResult]:
        """Search evidence for multiple claims.

        Args:
            claims: List of claim texts.
            max_per_claim: Max articles per claim.

        Returns:
            List of EvidenceResult, one per claim.
        """
        results = []
        for claim in claims:
            result = self.search(claim, max_results=max_per_claim)
            results.append(result)
        return results

    # ------------------------------------------------------------------
    # API integrations
    # ------------------------------------------------------------------

    def _search_newsapi(self, query: str, max_results: int) -> list[EvidenceArticle]:
        """Search NewsAPI for relevant articles."""
        try:
            params = {
                "q": query,
                "pageSize": max_results,
                "sortBy": "relevancy",
                "language": "en",
                "apiKey": self.news_api_key,
            }
            response = requests.get(self.NEWSAPI_BASE, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            articles = []
            for item in data.get("articles", []):
                articles.append(EvidenceArticle(
                    title=item.get("title", ""),
                    url=item.get("url", ""),
                    source=item.get("source", {}).get("name", ""),
                    snippet=item.get("description", ""),
                    published_at=item.get("publishedAt"),
                ))
            return articles
        except Exception as exc:
            logger.error("NewsAPI search failed: %s", exc)
            return []

    def _search_serpapi(self, query: str, max_results: int) -> list[EvidenceArticle]:
        """Search SerpAPI (Google) for relevant articles."""
        try:
            params = {
                "q": query,
                "num": max_results,
                "engine": "google",
                "api_key": self.serp_api_key,
                "tbm": "nws",  # News search
            }
            response = requests.get(self.SERPAPI_BASE, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            articles = []
            for item in data.get("news_results", data.get("organic_results", [])):
                articles.append(EvidenceArticle(
                    title=item.get("title", ""),
                    url=item.get("link", ""),
                    source=item.get("source", {}).get("name", item.get("source", "")),
                    snippet=item.get("snippet", ""),
                    published_at=item.get("date"),
                ))
            return articles
        except Exception as exc:
            logger.error("SerpAPI search failed: %s", exc)
            return []

    # ------------------------------------------------------------------
    # Evidence classification
    # ------------------------------------------------------------------

    @staticmethod
    def _classify_support(result: EvidenceResult, query: str) -> EvidenceResult:
        """Heuristic classification of whether evidence supports the query.

        Uses keyword overlap as a lightweight proxy. For production, this
        should be replaced with an NLI (Natural Language Inference) model.
        """
        query_words = set(query.lower().split())
        supporting = 0
        contradicting = 0

        contradiction_signals = {
            "false", "fake", "hoax", "debunk", "misleading",
            "incorrect", "untrue", "fabricated", "disproven",
            "no evidence", "not true",
        }

        for article in result.articles:
            combined = f"{article.title} {article.snippet}".lower()
            combined_words = set(combined.split())

            # Check for contradiction signals
            if contradiction_signals & combined_words:
                article.supports_claim = False
                contradicting += 1
            else:
                overlap = len(query_words & combined_words)
                if overlap >= 3:
                    article.supports_claim = True
                    supporting += 1
                else:
                    article.supports_claim = None

            # Simple relevance score
            article.relevance_score = round(
                len(query_words & combined_words) / max(len(query_words), 1), 2
            )

        result.supporting = supporting
        result.contradicting = contradicting
        return result
