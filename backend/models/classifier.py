"""
Transformer-based misinformation classifier.

Supports BERT, RoBERTa, and DeBERTa architectures via HuggingFace Transformers.
Provides both training-time and inference-time interfaces with attention
weight extraction for explainability.
"""

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import torch
import torch.nn.functional as F
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    AutoConfig,
)

from backend.utils.config import settings
from backend.utils.logger import get_logger

logger = get_logger("classifier")

LABEL_MAP = {0: "REAL", 1: "FAKE"}
SUPPORTED_MODELS = {
    "bert": "bert-base-uncased",
    "roberta": "roberta-base",
    "deberta": "microsoft/deberta-v3-base",
}


@dataclass
class ClassificationResult:
    """Output from the misinformation classifier."""
    label: str
    confidence: float
    probabilities: dict[str, float]
    attention_weights: Optional[list[list[float]]] = None


class MisinformationClassifier:
    """Transformer-based binary classifier for fake/real news.

    Works with any HuggingFace model that supports
    AutoModelForSequenceClassification.

    Example:
        classifier = MisinformationClassifier()
        result = classifier.predict("Breaking: aliens found on Mars!")
        print(result.label, result.confidence)
    """

    def __init__(
        self,
        model_name: Optional[str] = None,
        checkpoint_path: Optional[str] = None,
        device: Optional[str] = None,
    ):
        """Initialize classifier.

        Args:
            model_name: HuggingFace model identifier or key from SUPPORTED_MODELS.
            checkpoint_path: Path to a fine-tuned checkpoint directory.
            device: 'cuda', 'cpu', or None for auto-detection.
        """
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        resolved_name = SUPPORTED_MODELS.get(
            (model_name or settings.model_name).lower(),
            model_name or settings.model_name,
        )

        if checkpoint_path and Path(checkpoint_path).exists():
            logger.info("Loading fine-tuned model from %s", checkpoint_path)
            self.tokenizer = AutoTokenizer.from_pretrained(checkpoint_path)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                checkpoint_path, output_attentions=True
            )
        else:
            logger.info("Loading pre-trained model: %s", resolved_name)
            config = AutoConfig.from_pretrained(
                resolved_name,
                num_labels=settings.num_labels,
                output_attentions=True,
            )
            self.tokenizer = AutoTokenizer.from_pretrained(resolved_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                resolved_name, config=config
            )

        self.model.to(self.device)
        self.model.eval()
        logger.info("Classifier ready on %s", self.device)

    def predict(
        self,
        text: str,
        return_attention: bool = False,
    ) -> ClassificationResult:
        """Classify a single text.

        Args:
            text: Article text or claim to classify.
            return_attention: Whether to extract last-layer attention weights.

        Returns:
            ClassificationResult with label, confidence, and optional attention.
        """
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=settings.max_seq_length,
            padding="max_length",
        ).to(self.device)

        with torch.no_grad():
            outputs = self.model(**inputs)

        logits = outputs.logits[0]
        probs = F.softmax(logits, dim=-1).cpu().tolist()

        predicted_idx = int(torch.argmax(logits))
        label = LABEL_MAP.get(predicted_idx, "UNKNOWN")
        confidence = probs[predicted_idx]

        attention = None
        if return_attention and outputs.attentions:
            # Average over heads of the last layer -> shape (seq_len, seq_len)
            last_layer = outputs.attentions[-1]
            avg_attention = last_layer.mean(dim=1)[0].cpu().tolist()
            attention = avg_attention

        return ClassificationResult(
            label=label,
            confidence=round(confidence, 4),
            probabilities={LABEL_MAP[i]: round(p, 4) for i, p in enumerate(probs)},
            attention_weights=attention,
        )

    def predict_batch(self, texts: list[str]) -> list[ClassificationResult]:
        """Classify a batch of texts.

        Args:
            texts: List of texts to classify.

        Returns:
            List of ClassificationResult objects.
        """
        inputs = self.tokenizer(
            texts,
            return_tensors="pt",
            truncation=True,
            max_length=settings.max_seq_length,
            padding=True,
        ).to(self.device)

        with torch.no_grad():
            outputs = self.model(**inputs)

        logits = outputs.logits
        probs = F.softmax(logits, dim=-1).cpu()

        results = []
        for i in range(len(texts)):
            p = probs[i].tolist()
            predicted_idx = int(torch.argmax(probs[i]))
            results.append(ClassificationResult(
                label=LABEL_MAP.get(predicted_idx, "UNKNOWN"),
                confidence=round(p[predicted_idx], 4),
                probabilities={LABEL_MAP[j]: round(v, 4) for j, v in enumerate(p)},
            ))
        return results

    def save(self, path: str) -> None:
        """Save model and tokenizer to disk."""
        Path(path).mkdir(parents=True, exist_ok=True)
        self.model.save_pretrained(path)
        self.tokenizer.save_pretrained(path)
        logger.info("Model saved to %s", path)

    @classmethod
    def load(cls, path: str, device: Optional[str] = None) -> "MisinformationClassifier":
        """Load a fine-tuned classifier from disk."""
        return cls(checkpoint_path=path, device=device)
