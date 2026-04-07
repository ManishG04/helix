from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import api_router
from db.session import engine, Base

# Create tables for demo
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Helix - Project Management & Appointment System API",
    description="Backend API for Helix - A comprehensive project management and faculty appointment scheduling system.",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": "Welcome to Helix API. GOTO /docs for the Swagger API documentation."
    }
