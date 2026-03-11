import json
import logging
import time
from app.worker.celery_app import celery_app, redis_client
from app.database import SessionLocal
from app.services.assessment_service import run_assessment

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, name="run_assessment_task")
def run_assessment_task(self, supplier_id: int, user_id: int):
    # This task gets executed in the background for <= 2-3 mins SLA
    db = SessionLocal()
    try:
        # We can add an artificial delay to simulate heavy scraping or crawling here,
        # but the real system implies run_assessment carries out network tasks
        
        result = run_assessment(supplier_id=supplier_id, db=db, user_id=user_id)
        
        # Once complete, cache the payload in Redis to fulfill the <= 1 second response SLA
        cache_key = f"assessment:cached:{supplier_id}"
        
        # Convert objects like datetime or enums if any. Assuming result is dict serializable.
        redis_client.setex(cache_key, 86400, json.dumps(result)) # 24 hrs cache TTL
        
        return result
    except Exception as e:
        logger.error(f"Task failed: {e}")
        return {"error": str(e)}
    finally:
        db.close()
