from fastapi import APIRouter

router = APIRouter()


@router.get("/me")
def get_current_user():
    return {"message": "Current user profile"}


@router.put("/me")
def update_current_user():
    return {"message": "Profile updated successfully"}


@router.get("/")
def list_users(page: int = 1, size: int = 20, role: str = None, search: str = None):
    return {"message": "Users retrieved successfully", "items": []}


@router.get("/{user_id}")
def get_user_by_id(user_id: str):
    return {"message": f"User {user_id} retrieved successfully"}


@router.delete("/{user_id}")
def delete_user(user_id: str):
    return {"message": f"User {user_id} deleted successfully"}


@router.get("/faculty")
def list_faculty(page: int = 1, size: int = 20, search: str = None):
    return {"message": "Faculty list retrieved successfully"}
