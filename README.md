# TruthLens v3

**Real-Time News Detection and Intelligence Platform**

TruthLens is a centralized, event-centric backend system that continuously gathers news from multiple sources, detects emerging events, organizes them into structured entities, and enriches them with AI/NLP analysis.

## Features

- **Event-Centric Architecture**: Articles are clustered into unified events instead of standalone narratives.
- **Multimodal Ingestion**: Supports RSS feeds, NewsAPI, and direct web scraping (trafilatura).
- **Redis Streams**: Scalable, decoupled streaming layer for ingestion and NLP processing.
- **AI/NLP Pipeline**:
  - Text cleaning and embedding generation (Sentence-BERT)
  - Named Entity Recognition (spaCy) highlighting People, Organizations, Locations
  - DistilBERT Sentiment and DistilBART Summarization
- **Trust Engine**: Multi-factor article scoring with full explainability + cross-source contradiction detection.
- **Search Engine**: Unified endpoint supporting Keyword, Semantic, and Hybrid search with trust-aware ranking.

## Infrastructure

The platform uses a modern stack:
- **FastAPI**: High-performance asynchronous API
- **PostgreSQL / SQLAlchemy**: Relational event and article schemas
- **Redis (Streams)**: Message brokering and event bus
- **Docker**: Containerized services and reproducible environments

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Python 3.11+ (for local development)

### Quickstart

1. Clone the repository and configure your environment:
   ```bash
   cp .env.example .env
   # Edit .env with your specific API keys if needed
   ```

2. Start the platform using Docker Compose:
   ```bash
   docker-compose up --build -d
   ```

   This will spin up:
   - PostgreSQL (Database)
   - Redis (Message broker / Streams)
   - FastAPI Server (`http://localhost:8000`)
   - Ingestion Worker (scheduler for RSS/APIs)
   - NLP Worker (AI pipeline processor)

3. Verify the system is running:
   ```bash
   curl http://localhost:8000/health
   ```

4. View the interactive API documentation:
   Visit `http://localhost:8000/docs` in your browser.

## Project Structure

- `src/api/` - FastAPI routers (Events, Search, Trending, Trust, Alerts)
- `src/events/` - Event detection, clustering, and merge/split engine
- `src/ingestion/` - Data source connectors
- `src/nlp/` - AI processors (Embeddings, NER, Sentiment)
- `src/trust/` - Credibility scoring and contradiction detection
- `src/streaming/` - Redis pub/sub and stream handlers
- `src/workers/` - Background processes

*Frontend UI acts as a separate consumer repository.*
