# VeritasAI - Misinformation Detection Platform

A production-grade, AI-powered fact-checking and misinformation detection system. Analyzes news articles and claims using transformer models, evidence retrieval, and multi-signal credibility scoring with explainable AI.

---

## System Architecture

```
                                    VeritasAI Architecture
 +------------------+
 |   Client/User    |
 |  (Browser, CLI,  |
 |  Chrome Ext.)    |
 +--------+---------+
          |
          v
 +--------+---------+     +-------------------+
 |   FastAPI Server  |     |  Web Scraper      |
 |                   |<--->|  (newspaper3k +   |
 |  POST /analyze    |     |   BeautifulSoup)  |
 |  POST /verify     |     +-------------------+
 |  POST /analyze-url|
 +--------+---------+
          |
          v
 +--------+---------+
 |  Article Analyzer |  <-- Main Orchestrator
 |  (Pipeline)       |
 +--------+---------+
          |
     +----+----+----+----+----+
     |         |         |         |         |
     v         v         v         v         v
 +-------+ +-------+ +--------+ +-------+ +--------+
 |Transf. | |Claim  | |Evidence| |Click- | |Explain-|
 |Classi- | |Extrac-| |Retriev-| |bait   | |ability |
 |fier    | |tor    | |er      | |Detect.| |Engine  |
 |(BERT/  | |(spaCy)| |(News   | |       | |(SHAP/  |
 | RoBERTa| |       | | API)   | |       | | LIME)  |
 +---+----+ +---+---+ +---+----+ +---+---+ +---+----+
     |         |         |         |         |
     +----+----+----+----+----+----+----+----+
          |
          v
 +--------+---------+
 | Credibility       |
 | Scoring Engine    |
 | (0-100 composite) |
 +-------------------+
          |
          v
 +-------------------+
 |  Credibility      |
 |  Report           |
 |  - Score: 32%     |
 |  - Verdict        |
 |  - Reasons        |
 |  - Evidence       |
 |  - Explanations   |
 +-------------------+
```

---

## Features

- **Transformer-Based Classification** - BERT, RoBERTa, DeBERTa for fake/real news detection
- **Claim Extraction** - NLP-powered extraction of verifiable factual claims from articles
- **Evidence Retrieval** - Cross-references claims against trusted sources via NewsAPI and SerpAPI
- **Credibility Scoring** - Multi-signal 0-100 composite score with human-readable verdicts
- **Clickbait Detection** - Weighted pattern analysis for sensational language
- **Explainable AI** - SHAP, LIME, and attention visualization for model transparency
- **Web Scraping** - Robust article extraction from any URL (newspaper3k + BeautifulSoup)
- **RESTful API** - FastAPI backend with structured JSON responses
- **Training Pipeline** - End-to-end training with mixed precision, early stopping, and evaluation
- **Multi-Dataset Support** - LIAR, FakeNewsNet, PolitiFact, GossipCop, ISOT, custom datasets

---

## Project Structure

```
news-detector-bot/
|-- backend/
|   |-- api/                         # FastAPI application
|   |   |-- main.py                  # App factory + lifecycle
|   |   |-- routes/
|   |   |   |-- analyze.py           # POST /analyze, /analyze-url
|   |   |   |-- verify.py            # POST /verify-claim
|   |   |   |-- health.py            # GET /health
|   |-- models/                      # ML models
|   |   |-- classifier.py            # Transformer classifier
|   |   |-- credibility.py           # Credibility scoring engine
|   |   |-- clickbait.py             # Clickbait detector
|   |-- services/                    # Business logic
|   |   |-- analyzer.py              # Main orchestrator
|   |   |-- claim_extractor.py       # Claim extraction pipeline
|   |   |-- evidence_retriever.py    # Evidence search
|   |   |-- explainability.py        # SHAP/LIME/attention
|   |-- scrapers/                    # Web scraping
|   |   |-- article_scraper.py       # URL -> structured article
|   |-- training/                    # Model training
|   |   |-- dataset_loader.py        # Multi-dataset loader
|   |   |-- preprocessing.py         # Text cleaning
|   |   |-- train.py                 # Training script
|   |   |-- evaluate.py              # Evaluation script
|   |-- utils/                       # Shared utilities
|   |   |-- config.py                # Configuration management
|   |   |-- logger.py                # Structured logging
|   |-- tests/                       # Test suite
|       |-- test_api.py
|       |-- test_scraper.py
|       |-- test_claim_extractor.py
|       |-- test_models.py
|-- .env.example                     # Environment template
|-- .gitignore
|-- requirements.txt
|-- setup.py
|-- README.md
```

---

## Setup Instructions

### Prerequisites

- Python 3.10+
- pip
- (Optional) CUDA-capable GPU for faster inference/training

### 1. Clone the Repository

```bash
git clone https://github.com/armash66/news-detector-bot.git
cd news-detector-bot
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
# Core dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# (Optional) Install PyTorch with CUDA support
# Visit https://pytorch.org/get-started/locally/ for your specific setup
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 5. Start the API Server

```bash
uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000` with interactive docs at `/docs`.

---

## API Usage

### Analyze Article Text

```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "NASA announced today that alien life has been confirmed in Arizona desert. Scientists are shocked by the discovery.",
    "explain": true,
    "explanation_methods": ["attention"]
  }'
```

**Response:**
```json
{
  "classification": {
    "label": "FAKE",
    "confidence": 0.87,
    "probabilities": {"REAL": 0.13, "FAKE": 0.87}
  },
  "claims": [
    {
      "text": "NASA announced today that alien life has been confirmed in Arizona desert.",
      "type": "attribution",
      "confidence": 0.8,
      "entities": ["NASA", "Arizona"]
    }
  ],
  "evidence": [...],
  "clickbait": {
    "score": 0.45,
    "is_clickbait": true,
    "flags": ["Shocking language"]
  },
  "credibility": {
    "score": 28.5,
    "verdict": "Likely Misinformation",
    "reasons": [
      "AI model flagged content as likely fabricated",
      "No corroborating evidence found from reliable sources",
      "Headline uses sensational or clickbait language"
    ],
    "component_scores": {
      "model_prediction": 13.0,
      "source_credibility": 50.0,
      "evidence_support": 30.0,
      "clickbait": 55.0,
      "language_patterns": 68.0
    }
  },
  "explanations": {
    "attention": {
      "summary": "Attention analysis identified 3 suspicious tokens...",
      "top_suspicious_phrases": ["confirmed", "alien", "shocked"]
    }
  }
}
```

### Analyze Article from URL

```bash
curl -X POST http://localhost:8000/api/v1/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/suspicious-article"}'
```

### Verify a Single Claim

```bash
curl -X POST http://localhost:8000/api/v1/verify-claim \
  -H "Content-Type: application/json" \
  -d '{"claim": "The earth is flat according to NASA scientists"}'
```

---

## Model Training

### Download a Dataset

The platform supports multiple datasets. Example with LIAR:

```bash
mkdir -p data/liar
# Download from: https://www.cs.ucsb.edu/~william/data/liar_dataset.zip
# Extract train.tsv, valid.tsv, test.tsv into data/liar/
```

### Train a Model

```bash
python -m backend.training.train \
  --dataset liar \
  --model roberta-base \
  --epochs 3 \
  --batch-size 16 \
  --lr 2e-5 \
  --output-dir ./checkpoints
```

**Supported models:**
| Model | Identifier | Parameters |
|-------|-----------|------------|
| BERT | `bert-base-uncased` | 110M |
| RoBERTa | `roberta-base` | 125M |
| DeBERTa v3 | `microsoft/deberta-v3-base` | 184M |

### Evaluate a Model

```bash
python -m backend.training.evaluate \
  --checkpoint ./checkpoints/best_model \
  --dataset liar \
  --split test \
  --output ./checkpoints/eval_results.json
```

### Use a Fine-Tuned Model

Set the checkpoint path when starting the server:

```bash
# In .env
MODEL_CHECKPOINT_DIR=./checkpoints/best_model
```

Or pass it directly when initializing:

```python
from backend.services.analyzer import ArticleAnalyzer

analyzer = ArticleAnalyzer(checkpoint_path="./checkpoints/best_model")
report = analyzer.analyze_text("Some suspicious article text...")
print(report.credibility)
```

---

## Running Tests

```bash
# Run all tests
pytest backend/tests/ -v

# Run specific test file
pytest backend/tests/test_models.py -v

# Run with coverage
pytest backend/tests/ --cov=backend --cov-report=html
```

---

## Credibility Scoring Breakdown

The credibility score (0-100) is a weighted composite of five signals:

| Signal | Weight | Description |
|--------|--------|-------------|
| Model Prediction | 35% | Transformer classifier confidence |
| Source Credibility | 20% | Domain reputation rating |
| Evidence Support | 25% | Corroboration from trusted sources |
| Clickbait Detection | 10% | Sensational language analysis |
| Language Patterns | 10% | Manipulation indicator detection |

**Verdicts:**
| Score Range | Verdict |
|-------------|---------|
| 75-100 | Likely Credible |
| 50-74 | Mixed Credibility |
| 25-49 | Likely Misinformation |
| 0-24 | High Risk Misinformation |

---

## Supported Datasets

| Dataset | Description | Labels | Download |
|---------|-------------|--------|----------|
| LIAR | Political statements | 6-class (mapped to binary) | [Link](https://www.cs.ucsb.edu/~william/data/liar_dataset.zip) |
| FakeNewsNet/PolitiFact | Political fact-checks | Binary | [GitHub](https://github.com/KaiDMML/FakeNewsNet) |
| FakeNewsNet/GossipCop | Celebrity news | Binary | [GitHub](https://github.com/KaiDMML/FakeNewsNet) |
| ISOT | News articles | Binary | [Link](https://www.uvic.ca/ecs/ece/isot/datasets/) |
| Custom | Your own data | Binary (CSV/JSON) | - |

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| ML Framework | PyTorch + HuggingFace Transformers |
| NLP | spaCy, Tokenizers |
| API | FastAPI + Uvicorn |
| Explainability | SHAP, LIME |
| Scraping | newspaper3k, BeautifulSoup |
| Config | Pydantic Settings |
| Testing | pytest |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEWS_API_KEY` | - | NewsAPI.org API key for evidence retrieval |
| `SERP_API_KEY` | - | SerpAPI key for Google search |
| `MODEL_NAME` | `roberta-base` | HuggingFace model identifier |
| `MAX_SEQ_LENGTH` | `512` | Maximum token length |
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `8000` | Server port |
| `LOG_LEVEL` | `INFO` | Logging verbosity |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT License. See [LICENSE](LICENSE) for details.