from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.models.database import init_db
from app.api import auth, organizations, scans, billing, remediation

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Cloud Misconfiguration + Compliance Automation Platform with ML-powered risk scoring. Supports CIS, SOC2, ISO27001, PCI DSS, NIST CSF, HIPAA, and GDPR.",
    docs_url="/api/docs" if settings.DEBUG else None,
    openapi_url="/api/openapi.json" if settings.DEBUG else None
)

# CORS — strict origin whitelist, never allow credentials with wildcard origins
origins = [settings.FRONTEND_URL]
if settings.DEBUG:
    origins.append("http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup():
    init_db()

# Health check
@app.get("/api/health")
def health():
    return {"status": "ok", "version": settings.APP_VERSION}

# Register routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(organizations.router, prefix="/api/v1")
app.include_router(scans.router, prefix="/api/v1")
app.include_router(billing.router, prefix="/api/v1")
app.include_router(remediation.router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
