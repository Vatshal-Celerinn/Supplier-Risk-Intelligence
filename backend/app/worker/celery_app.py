import os
import redis
from celery import Celery
from dotenv import load_dotenv

load_dotenv(override=True)

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery_broker_url = os.getenv("CELERY_BROKER_URL", redis_url)
celery_result_backend = os.getenv("CELERY_RESULT_BACKEND", redis_url)

celery_app = Celery(
    "vdashboard_tasks",
    broker=celery_broker_url,
    backend=celery_result_backend,
    include=["app.worker.tasks"]
)

import ssl

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_concurrency=4,  # Ensures the system supports at least 4 concurrent assessments
    broker_use_ssl={"ssl_cert_reqs": ssl.CERT_NONE},
    redis_backend_use_ssl={"ssl_cert_reqs": ssl.CERT_NONE}
)

# Force-strip trailing query params for the pure redis client connection to avoid stale Uvicorn states
clean_redis_url = redis_url.split("?")[0]

# Shared Redis client for ultra-fast <1s caching
redis_client = redis.Redis.from_url(clean_redis_url, decode_responses=True, ssl_cert_reqs=None)
