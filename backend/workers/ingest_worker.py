import asyncio
import logging
import time
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.core.database import SessionLocal, engine
from backend.models.domain import Article, Claim
from ingestion.news_crawler import RSSFeedCrawler
from backend.api.ws_manager import manager

logger = logging.getLogger("truthlens.worker.ingest")

class IngestWorker:
    def __init__(self):
        self.crawler = RSSFeedCrawler()
        self.interval = 60 # Poll every minute
        
    async def run_forever(self):
        logger.info("TruthLens Ingest Worker started.")
        while True:
            try:
                await self.process_feeds()
            except Exception as e:
                logger.error(f"Error in ingest cycle: {e}")
            
            await asyncio.sleep(self.interval)
            
    async def process_feeds(self):
        logger.info("Starting ingest cycle...")
        latest_intel = self.crawler.fetch_latest_intelligence()
        
        db: Session = SessionLocal()
        try:
            from backend.models.domain import Article, Claim, Narrative, SourceCredibility
            
            new_articles = []
            for item in latest_intel:
                # 1. Handle Source Credibility
                source_domain = item["source"]
                source = db.query(SourceCredibility).filter(SourceCredibility.domain == source_domain).first()
                if not source:
                    source = SourceCredibility(
                        domain=source_domain,
                        reliability_score=0.9 if any(x in source_domain.lower() for x in ["bbc", "nytimes", "reuters"]) else 0.4,
                        bias_rating="Center" if "bbc" in source_domain.lower() else "Mixed",
                        verified_status=True if "bbc" in source_domain.lower() or "nytimes" in source_domain.lower() else False
                    )
                    db.add(source)
                    db.flush()

                # 2. Handle Narrative Clustering (Simulated)
                topic_keywords = {
                    "Crisis": "Global Energy & Resource Crisis",
                    "Election": "Democratic Process Integrity",
                    "AI": "Artificial Intelligence Ethics & Regulation",
                    "War": "Geopolitical Conflict Escalation"
                }
                
                detected_topic = "General Global News"
                for kw, theme in topic_keywords.items():
                    if kw.lower() in item["title"].lower():
                        detected_topic = theme
                        break
                
                narrative = db.query(Narrative).filter(Narrative.topic == detected_topic).first()
                if not narrative:
                    narrative = Narrative(
                        topic=detected_topic,
                        description=f"Automated tracking for {detected_topic}",
                        origin_source=source_domain
                    )
                    db.add(narrative)
                    db.flush()

                # 3. Create Article
                existing = db.query(Article).filter(Article.source_domain == item["source"], Article.title == item["title"]).first()
                if not existing:
                    article = Article(
                        narrative_id=narrative.id,
                        source_domain=item["source"],
                        title=item["title"],
                        content=item["summary_text"],
                        published_at=datetime.now(timezone.utc)
                    )
                    db.add(article)
                    db.flush()
                    
                    severity = "Critical" if any(word in item["title"].lower() for word in ["war", "bomb", "cyber", "attack", "dead"]) else "Medium"
                    suspicion = 88.0 if severity == "Critical" else 32.0
                    
                    claim = Claim(
                        article_id=article.id,
                        claim_text=item["title"],
                        verdict="Unverified",
                        confidence=0.85
                    )
                    db.add(claim)
                    
                    msg = {
                        "type": "new_intelligence",
                        "data": {
                            "id": article.id,
                            "source": article.source_domain,
                            "content_preview": article.title,
                            "severity": severity,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "suspicion_score": suspicion
                        }
                    }
                    new_articles.append(msg)
            
            db.commit()
            
            # Broadcast to all connected analysts via WebSocket
            for update in new_articles:
                await manager.broadcast(update)
                logger.info(f"Broadcasted new intelligence: {update['data']['content_preview'][:50]}...")
                
        finally:
            db.close()

async def start_worker():
    worker = IngestWorker()
    await worker.run_forever()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(start_worker())
