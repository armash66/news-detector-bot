# Veritas AI - Production News Intelligence Platform

Veritas AI is a comprehensive AI Software-as-a-Service (SaaS) platform designed for real-time misinformation detection, fact-checking, and news intelligence. The system continuously fetches online content, analyzes it using advanced multimodal transformer models, and provides automated, transparent credibility reporting metrics.

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Platform Components](#platform-components)
3. [Project Structure](#project-structure)
4. [Prerequisites and Dependencies](#prerequisites-and-dependencies)
5. [Installation and Setup](#installation-and-setup)
6. [Running the Application](#running-the-application)
7. [API Reference Guide](#api-reference-guide)
8. [Multimodal Analysis Capabilities](#multimodal-analysis-capabilities)
9. [Discord Bot Integration](#discord-bot-integration)
10. [Model Training and Fine-Tuning](#model-training-and-fine-tuning)
11. [Extensibility](#extensibility)
12. [License](#license)

---

## System Architecture

The Veritas AI system utilizes a modern, decoupled architecture consisting of a high-performance Python backend, dynamic scraping workers, and a responsive React frontend.

The flow operates as follows:
- **Data Ingestion Layer**: Background worker nodes continuously scrape pre-configured RSS feeds and APIs for news content. This content is piped directly into the intelligence pipeline.
- **Processing Layer**: Extracted text is fed into a fine-tuned HuggingFace Transformer model (e.g., RoBERTa, DeBERTa) to isolate potentially manipulative syntax and classify general credibility.
- **Claim Extraction**: The article is decomposed into individual factual claims using Natural Language Processing segmentation routines.
- **Evidence Retrieval**: Each claim is queried against live internet search providers (NewsAPI, SerpAPI) to verify factual accuracy against established credible sources.
- **Multimodal Checking**: For articles with media, the image is passed alongside its caption or claim into a Vision-Language foundation model (CLIP). The vectors are compared using cosine similarity to ensure the image context perfectly aligns with the text context, automatically flagging deepfakes, recycled images, or out-of-context memes.
- **Storage Layer**: Results are archived in a structured SQL database.
- **Presentation Layer**: A dedicated web application exposes this intelligence via an interactable dashboard, allowing analysts to view live feeds, manually upload content for scans, and review platform-wide telemetry.

---

## Platform Components

### 1. The Core Analyzer Matrix
At the heart of Veritas AI is the Analyzer Pipeline. Instead of relying on a single heuristic, the application fuses multiple scoring mechanisms to output a final verdict:
- NLP Classification Score
- Cross-referencing against trusted domain whitelists/blacklists
- Clickbait linguistic analysis
- Linguistic integrity mapping (sentiment, polarity, and sensationalism checking)

### 2. Attention-based Explainable AI (XAI)
The application avoids "black box" decisions. When a prediction is issued, the backend runs an attention map generation sequence. It extracts the exact tokens or linguistic segments that heavily weighted the classifier's verdict and surfaces them to the dashboard, highlighting suspicious terms.

### 3. Background News Fetcher
Powered by APScheduler, a resilient background task loop polls global news aggregators and handles auto-processing. This allows Veritas AI to populate the dashboard autonomously without direct user intervention.

### 4. Interactive SaaS Dashboard
Built on top of React, Vite, and clean modular CSS, the frontend interface serves as an operations control center. Users can monitor the automated feed, analyze raw unstructured text, scan external web URLs, or test specific image-text pairs.

---

## Project Structure

```text
ai-news-detector/
├── backend/
│   ├── api/                 # Endpoint routing (REST endpoints for Dashboard and Bot)
│   │   ├── routes/          # Isolated routers (analyze, verify, health, dashboard, multimodal)
│   │   ├── dependencies.py  # Dependency injection for model analyzers
│   │   └── main.py          # FastAPI application entrypoint and scheduler init
│   ├── database.py          # SQLAlchemy context, engine, and ORM schema models
│   ├── models/              # Pydantic data schemas representing responses internally
│   ├── multimodal/          # Specialized CLIP Vision-Language AI integration scripts
│   ├── scrapers/            # Web Scraping utilities and background News Fetcher polling jobs
│   ├── services/            # Services for Credibility, XAI, Claims, and Evidence Retrieval
│   └── training/            # Custom Dataset fine-tuning pipelines and evaluate loops
├── frontend/                # React Vite Dashboard SPA root
│   ├── src/                 # Primary interface React components and glassmorphic CSS
│   ├── public/              # Static frontend assets
│   ├── vite.config.js       # Vite configuration with strict proxying rules
│   └── package.json         # Node.js dependencies
├── tests/                   # Automated pytest suite for backend reliability verification
├── bot.py                   # A production-ready Discord utility script for chat moderation
├── requirements.txt         # Core Python dependencies lockfile
├── TRAINING_GUIDE.md        # Specialized documentation for fine-tuning backend models
└── README.md                # System documentation
```

---

## Prerequisites and Dependencies

To successfully deploy the Veritas AI platform, the following environment prerequisites must be met:

- Python 3.10 or higher (Python 3.14 is natively supported)
- Node.js LTS (v18+) and npm
- Valid HuggingFace Hub environment connectivity
- Optional: Hardware acceleration (NVIDIA CUDA Toolkit) for production inferencing scale

Required Python libraries include `fastapi`, `uvicorn`, `transformers`, `torch`, `Pillow`, `SQLAlchemy`, `apscheduler`, `BeautifulSoup4`, `pydantic`, `feedparser`, and `discord.py`.

---

## Installation and Setup

Follow these exact steps to clone, configure, and install the complete architecture.

1. Clone the repository and navigate into the primary directory:
   ```bash
   git clone https://github.com/armash66/ai-news-detector.git
   cd ai-news-detector
   ```

2. Establish the Python environment and install the required modules. Using a virtual environment is strictly recommended.
   ```bash
   pip install -r requirements.txt
   ```

3. Configure Environment Variables. Create a file named `.env` in the root directory. This is utilized by the backend to handle critical keys and configurations without hardcoding.
   ```env
   # .env example
   NEWS_API_KEY=your_news_api_key_here
   SERP_API_KEY=your_serp_api_key_here
   DISCORD_TOKEN=your_discord_bot_token_here
   DATABASE_URL=sqlite:///./veritas.db
   ```

4. Install the Frontend dependencies.
   ```bash
   cd frontend
   npm install
   ```

No manual database migrations are required initially on SQLite, as the application utilizes SQLAlchemy's metadata auto-generation upon the first boot context.

---

## Running the Application

### 1. Booting the Backend Intelligence API

Navigate to the project root and initiate the uvicorn web server.
```bash
uvicorn backend.api.main:app --host 127.0.0.1 --port 8000 --reload
```
Upon execution, four primary events will occur:
- The base NLP models will initialize in memory.
- The multimodal image models (if required) will prepare.
- The SQL database will establish connections.
- The APScheduler worker will commence the background feed polling.

You can verify the API is online by navigating to `http://127.0.0.1:8000/docs`, which provides interactive Swagger UI testing interfaces.

### 2. Booting the Frontend Dashboard

Open an independent terminal window, navigate to the `frontend` folder, and initiate the Vite development server.
```bash
cd frontend
npm run dev
```
Navigate your browser to `http://localhost:5173`. The application proxy is pre-configured to automatically tunnel all `/api` requests to the locally hosted Python instance securely.

---

## API Reference Guide

The backend routes are cleanly segmented. The following represents the primary integration points for external applications.

### Text Analysis
`POST /api/v1/analyze`
Generates a comprehensive credibility report from raw text input. Submits text to the transformer model, isolates claims, retrieves internet evidence, and compiles a final unified score.

### URL Analysis
`POST /api/v1/analyze-url`
Performs identical operations as above, but natively scrapes the text content, authors, timestamps, and images directly from the provided article URL.

### Multimodal Pipeline
`POST /api/v1/analyze-multimodal`
Requires two fields: `text` and `image_url`. The Vision-Language model embeds both features into a shared space and measures consistency. A low consistency implies the image lacks relationship to the claim, alerting to potential manipulation.

### Dashboard Telemetry
`GET /api/v1/dashboard/feed`
Retrieves a paginated list of all independently scanned articles the background engine has intercepted, sorted chronologically.

`GET /api/v1/dashboard/stats`
Returns system footprint metrics, classifying all database entries into their respective credibility spectrums for administrative charting.

---

## Multimodal Analysis Capabilities

Modern misinformation often relies on cheap manipulation techniques, such as attaching an unrelated, emotionally charged image to a falsified claim.

The `backend/multimodal/analyzer.py` engine addresses this. The platform automatically downloads the target image and feeds it into OpenAI's CLIP architecture. The text embedding and vision embedding vectors undergo cosine similarity checks. If the resulting value drops below statistical thresholds, the application generates a "Manipulation Detected" or "Out of Context" warning.

This allows analysts to counter "Fake Context Memes" efficiently without requiring manual reverse image searches.

---

## Discord Bot Integration

For immediate community moderation or deployment within operational servers, a standalone Discord application is bundled within `bot.py`.

The bot listens for the `!verify` command prefix followed by any string of text. It dispatches a request to local intelligence engine, awaits the credibility assessment, and formats the output into a rich, color-coded Discord Embed containing the AI's logic methodology and final severity score.

To operate the bot, run:
```bash
python bot.py
```
Ensure your `DISCORD_TOKEN` environment parameter is correctly asserted, and that the backend API is online.

---

## Model Training and Fine-Tuning

While Veritas AI ships with support for highly capable pretrained weights, true enterprise accuracy demands domain-specific fine-tuning. A fully automated fine-tuning pipeline is incorporated.

By supplying a proprietary CSV matrix of confirmed positive and negative misinformation articles, analysts can rebuild the foundational classification engine using the `backend.training.train` module. The newly trained weights overwrite the legacy models smoothly.

For deeply detailed instructions regarding hyperparameter configurations, GPU offloading, and dataset schema requirements, please reference the dedicated `TRAINING_GUIDE.md` file located in the repository root.

---

## Extensibility

The platform architecture was specifically crafted to encourage expansion. The core engines are inherently decoupled.

Areas for optimal future development include:
- Establishing a PostgreSQL migration context using Alembic for enterprise replication and state management.
- Integrating caching layers like Redis to memorize XAI attention arrays for rapid subsequent serving and minimal processing latency.
- Developing browser extensions to highlight suspicious syntax visually directly upon the client's Document Object Model (DOM).

---

## License

Copyright (c) Armash Ansari. All Rights Reserved. This software is provided for the purpose of research, operational intelligence, and analytical data protection. Please reference the local `LICENSE` file for usage conditions and distribution terms related to open-source utilization and downstream modifications.