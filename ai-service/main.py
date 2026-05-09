from fastapi import FastAPI

app = FastAPI(
    title="Nexlify AI Service",
    description="AI microservice for sentiment analysis, pattern detection, and burnout prediction.",
    version="0.1.0",
)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": "nexlify-ai-service"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
