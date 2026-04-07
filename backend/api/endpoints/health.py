from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health_check():
    """
    Check if the API is running
    """
    return {"status": "healthy", "version": "1.0.0"}
