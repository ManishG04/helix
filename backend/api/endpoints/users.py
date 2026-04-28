from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from api.deps import get_db, get_current_user
from models.user import User
from schemas.models import User as UserSchema, UserRole

router = APIRouter()


@router.get("/me", response_model=UserSchema)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserSchema)
def update_current_user(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Keep updates explicit to avoid accidentally mutating auth-only fields.
    allowed_fields = {"name", "academic_interests"}
    for key, value in payload.items():
        if key in allowed_fields:
            setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("")
def list_users(
    page: int = 1,
    size: int = 20,
    role: Optional[UserRole] = None,
    search: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Students can browse faculty only; other role-based user listing is restricted.
    if current_user.role == UserRole.STUDENT and role != UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(or_(User.name.ilike(s), User.email.ilike(s)))

    total = query.count()
    offset = max(0, (page - 1) * size)
    items = query.offset(offset).limit(size).all()
    pages = (total + size - 1) // size if size > 0 else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }


@router.get("/faculty")
def list_faculty(
    page: int = 1,
    size: int = 20,
    search: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(User).filter(User.role == UserRole.FACULTY)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(or_(User.name.ilike(s), User.academic_interests.ilike(s)))

    total = query.count()
    offset = max(0, (page - 1) * size)
    items = query.offset(offset).limit(size).all()
    pages = (total + size - 1) // size if size > 0 else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }


@router.get("/{user_id}", response_model=UserSchema)
def get_user_by_id(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": f"User {user_id} deleted successfully"}
