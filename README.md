# TruthLens
**Real-Time News Detection and Intelligence Platform**

## Overview
TruthLens is a centralized, event-centric intelligence platform that continuously aggregates news from multiple global sources, automatically detects emerging events, and enriches raw data using a robust AI and NLP pipeline. 

Unlike traditional news aggregators that operate on a per-article basis, TruthLens structures discrete articles into evolving storylines. By dynamically clustering related coverage, tracking narratives across time, and computing cross-source trust scores, the system surfaces holistic operational intelligence. Fake news classification is integrated as an auxiliary sub-feature, while the primary focus remains on autonomous event detection, multi-source aggregation, and intelligence extraction. 

## Key Features
* **Event-Centric Clustering**: Groups individual articles into discrete, continuously evolving events using Sentence-BERT embeddings and centroid-based assignment algorithms.
* **Timeline Tracking**: Automatically maintains chronologies of emerging and ongoing events, intelligently merging or splitting event clusters as new data arrives.
* **Multi-Factor Credibility Scoring**: Calculates trust mathematically by combining source reliability indices, linguistic analysis, and cross-source contradiction detection.
* **Semantic Search Engine**: Unified search layer supporting exact keyword matching, dense vector semantic similarity, and trust-aware hybrid ranking techniques.
* **Multi-Source Ingestion Engine**: Aggregates from highly distributed sources utilizing asynchronous API connectors (NewsAPI, GDELT), robust RSS parsers, and direct HTML extraction fallbacks.
* **Extensible NLP Pipeline**: Executes sequential text cleaning, Named Entity Recognition (NER), DistilBERT sentiment analysis, and DistilBART abstractive summarization.

## How It Works (High-Level)
1. **Ingestion**: Schedulers asynchronously pull articles from multiple publishers, deduplicating via content hashes and uniform resource locators (URLs).
2. **Streaming**: Raw articles are published to distributed message queues for decoupled, fault-tolerant processing.
3. **Processing**: Background workers consume messages, executing a 7-stage NLP pipeline to clean text, extract entities, compute semantic embeddings, and assess sentiment.
4. **Event Detection**: The processed representations are compared against existing event centroids. Articles are either assigned to active events or used to instantiate new emerging events.
5. **Storage & Access**: Structured intelligence is persisted to a relational database and indexed for exposure via a high-performance REST and WebSocket API.

## Architecture
TruthLens is fundamentally designed as a decoupled, microservice-ready backend.
* **Ingestion Layer**: Independent polling agents and scrapers engineered for high throughput and rapid failure recovery.
* **Message Broker**: Redis Streams handles pub/sub semantics, acting as the durable buffer between ingestion and computation.
* **Intelligence Workers**: Scalable Python processes dedicated entirely to resource-heavy NLP inference and clustering permutations.
* **Event Engine**: The core algorithmic module responsible for clustering similarity matching, silhouette score profiling, and data lifecycle management.
* **API Layer**: An asynchronous FastAPI wrapper providing standardized RESTful routes and real-time WebSocket feeds for external consumption.

## Data Flow
1. Raw articles and metadata enter the system via the `IngestionScheduler`.
2. Extracted payloads are serialized into Redis topic streams (`raw_articles`).
3. The `NLPWorker` pulls batches from streams, executing embedding generation and entity mapping.
4. Processed articles are evaluated by the `EventDetector`. Similarity matrices determine cluster assignment.
5. The `TrustEngine` recalculates the event's overall credibility upon insertion to detect emergent contradictions.
6. The `EventMerger` daemon periodically evaluates event centroids to dynamically merge duplicate clusters or split diverging narratives.
7. Frontend clients retrieve serialized events via the API layer or subscribe to the `/ws/live` endpoint.

## Example Event Output
```json
{
  "id": "evt-7k29xP1",
  "title": "Central Bank Announces Unscheduled Rate Adjustments",
  "summary": "Multiple financial authorities confirm unexpected changes to baseline interest rates amidst fluctuating inflation indexes.",
  "category": "ECONOMY",
  "status": "ONGOING",
  "article_count": 14,
  "source_count": 6,
  "trust_score": 0.89,
  "significance_score": 92.4,
  "centroid_embedding": [0.012, -0.045, 0.881, "..."],
  "timeline": [
    {"timestamp": "2024-03-24T08:00:00Z", "description": "Initial press release from regulatory board."},
    {"timestamp": "2024-03-24T09:15:00Z", "description": "Market reaction and secondary coverage."}
  ],
  "entities": [
    {"text": "Central Bank", "label": "ORG", "mentions": 12},
    {"text": "Jerome Powell", "label": "PERSON", "mentions": 8}
  ]
}
```

## Tech Stack
* **Backend Framework**: FastAPI, Pydantic
* **AI & NLP Pipeline**: spaCy, Sentence-Transformers (SBERT), HuggingFace Transformers (DistilBERT, DistilBART)
* **Database & ORM**: PostgreSQL, SQLAlchemy, Alembic
* **Messaging & Caching**: Redis (Streams)
* **Infrastructure**: Docker, Docker Compose

## Getting Started

### Prerequisites
* Docker
* Docker Compose
* Python 3.11+ (Local execution fallback only)

### Setup
1. Clone the repository and configure the environment:
   ```bash
   cp .env.example .env
   ```
2. Initialize and start the containerized infrastructure:
   ```bash
   docker-compose up --build -d
   ```
3. The platform components are immediately accessible:
   * REST API & Documentation: `http://localhost:8000/docs`
   * Health Check: `curl http://localhost:8000/health`

## UI Mocks
*(Note: TruthLens acts as the intelligence core. Client implementations handle visualization).*
* **Event Feed**: A chronologically sorted, rank-adjusted feed of active events natively featuring trust score badges and structural volume sparklines.
* **Detail Canvas**: Expanded dashboards displaying event emergence timelines, multi-source contradiction matrices, and raw article references.
* **Analytic Modules**: Source bias distributions, credibility tracking, and trending entity maps. 

## Future Improvements
* **Knowledge Graph Extraction**: Neo4j integration to natively map entity-to-entity relations across isolated temporal events.
* **Early Signal Detection**: Stochastic modeling to identify significant narratives while article volume remains beneath standard thresholds.
* **Targeted Delivery Feeds**: User-specific dimensionality filtering for customized intelligence pipelines.

## Contributing
Contributions are evaluated through strict pull request reviews. Ensure all test suites pass, conform to formatting guidelines, and include adequate architectural documentation before submission.

## License
Distributed under the MIT License.
