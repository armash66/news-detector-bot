# TruthLens

**Multimodal AI OSINT (Open Source Intelligence) Platform**

TruthLens is a production-grade intelligence suite designed to monitor global information streams. It detects misinformation, coordinated propaganda campaigns, manipulated media (Deepfakes), and high-growth narrative clusters in real time.

## 🚀 Key Features

-   **Deepfake Forensics**: Multimodal VLM (Vision Language Model) analysis to detect manipulation and mismatched image/caption contexts.
-   **Bot Network Analysis**: Interaction topology visualization identifying coordinated amplifier networks and command nodes.
-   **Narrative Streams**: Semantic clustering of global news and social media streams into trackable topic clusters.
-   **Global Intel Feed**: Live-streaming OSINT threat dashboard.

## 🛠️ Tech Stack

-   **Backend**: FastAPI, Uvicorn, Pydantic, SQLAlchemy.
-   **AI Engine**: CLIP (Multimodal), ResNet (CNN Forensics), Tesseract (OCR), Sentence-Transformers.
-   **Frontend**: Next.js 16 (Turbopack), TailwindCSS 4, React-Force-Graph (WebGL).

## 🏁 Getting Started

### Prerequisites

-   Python 3.14+
-   Node.js 20+
-   Tesseract OCR (for image text extraction)

### Quick Start

1.  **Clone the Repo**:
    ```bash
    git clone <repository-url>
    cd truthlens-monolith
    ```

2.  **Start Backend**:
    ```bash
    pip install -r requirements.txt
    uvicorn backend.api.main:app --reload --port 8000
    ```

3.  **Start Frontend**:
    ```bash
    cd truthlens-ui
    npm install
    npm run dev
    ```

## 📊 Infrastructure

The system is designed for horizontal scaling. Production deployments include:
-   **Neo4j**: For deep network relationship querying.
-   **PostgreSQL**: Structured metadata and verified intelligence storage.
-   **Redis**: Real-time message bus for the Live Intel feed.
