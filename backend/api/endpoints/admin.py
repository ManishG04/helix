from fastapi import APIRouter

router = APIRouter()


@router.get("/users")
def admin_list_users():
    return {"message": "Users retrieved"}


@router.get("/stats")
def get_stats():
    return {"message": "Stats retrieved"}
