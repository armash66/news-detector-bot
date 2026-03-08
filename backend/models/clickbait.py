"""
Clickbait detection module.

Uses heuristic pattern matching combined with linguistic features
to score headlines for clickbait characteristics.
"""

import re
from dataclasses import dataclass

from backend.utils.logger import get_logger

logger = get_logger("clickbait")


@dataclass
class ClickbaitResult:
    """Clickbait analysis output."""
    score: float  # 0.0 (not clickbait) to 1.0 (definite clickbait)
    flags: list[str]
    is_clickbait: bool


# Weighted pattern categories
CLICKBAIT_PATTERNS: list[tuple[str, float, str]] = [
    # (regex_pattern, weight, description)
    (r"\byou won'?t believe\b", 0.25, "You won't believe pattern"),
    (r"\bshocking\b", 0.15, "Shocking language"),
    (r"\bbreaking\b", 0.05, "Breaking news flag"),
    (r"\b(?:this|these|here)\s+(?:is|are)\s+(?:the|why)\b", 0.15, "This is why / Here are the pattern"),
    (r"\b\d+\s+(?:reasons?|things?|ways?|facts?|secrets?|tricks?)\b", 0.20, "Listicle number pattern"),
    (r"[!]{2,}", 0.15, "Excessive exclamation marks"),
    (r"[?]{2,}", 0.10, "Excessive question marks"),
    (r"\bALL CAPS\b|^[A-Z\s]{10,}$", 0.10, "Excessive capitalization"),
    (r"\b(?:jaw.?dropping|mind.?blowing|unbelievable|insane)\b", 0.20, "Sensational adjectives"),
    (r"\b(?:secret|exposed|revealed|confess)\b", 0.10, "Secretive language"),
    (r"\b(?:doctors?|scientists?|experts?)\s+(?:hate|don'?t want)\b", 0.25, "Experts hate this pattern"),
    (r"\b(?:what happens next|wait (?:for|until)|the reason)\b", 0.20, "Curiosity gap"),
    (r"\b(?:gone wrong|gone viral|the truth about)\b", 0.15, "Viral bait pattern"),
]

SENSATIONAL_WORDS = {
    "shocking", "unbelievable", "incredible", "horrifying", "terrifying",
    "devastating", "insane", "outrageous", "bombshell", "explosive",
    "jaw-dropping", "mind-blowing", "stunning", "alarming", "disturbing",
}


class ClickbaitDetector:
    """Detects clickbait characteristics in headlines and article text.

    Uses a weighted pattern-matching approach where each detected pattern
    contributes to a cumulative clickbait score, capped at 1.0.
    """

    THRESHOLD = 0.35

    def analyze(self, headline: str, body: str = "") -> ClickbaitResult:
        """Analyze text for clickbait indicators.

        Args:
            headline: Article headline / title.
            body: Optional article body for additional analysis.

        Returns:
            ClickbaitResult with score and triggered flags.
        """
        combined = f"{headline} {body[:500]}" if body else headline
        combined_lower = combined.lower()

        score = 0.0
        flags: list[str] = []

        # Pattern matching
        for pattern, weight, description in CLICKBAIT_PATTERNS:
            if re.search(pattern, combined, re.IGNORECASE):
                score += weight
                flags.append(description)

        # Sensational word density
        words = set(combined_lower.split())
        sensational_count = len(words & SENSATIONAL_WORDS)
        if sensational_count >= 2:
            bonus = min(sensational_count * 0.08, 0.25)
            score += bonus
            flags.append(f"High sensational word density ({sensational_count} words)")

        # Excessive punctuation in headline
        punct_ratio = sum(1 for c in headline if c in "!?") / max(len(headline), 1)
        if punct_ratio > 0.05:
            score += 0.10
            flags.append("High punctuation ratio in headline")

        # All-caps ratio in headline
        alpha_chars = [c for c in headline if c.isalpha()]
        if alpha_chars:
            caps_ratio = sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars)
            if caps_ratio > 0.6:
                score += 0.15
                flags.append("Excessive capitalization")

        final_score = min(round(score, 3), 1.0)
        return ClickbaitResult(
            score=final_score,
            flags=flags,
            is_clickbait=final_score >= self.THRESHOLD,
        )
