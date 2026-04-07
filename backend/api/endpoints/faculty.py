from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.deps import get_db, get_current_user
from models.user import User
from models.faculty import FacultyAvailability
from schemas.models import (
    FacultyAvailability as FacultySchema,
    FacultyAvailabilityCreate,
    UserRole,
    AvailabilityStatus,
    AvailabilitySource,
)

router = APIRouter()


@router.get("/availability", response_model=List[FacultySchema])
def get_my_availability(
    status_filter: Optional[AvailabilityStatus] = None,
    day_of_week: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Not a faculty member")

    query = db.query(FacultyAvailability).filter(
        FacultyAvailability.faculty_id == current_user.id
    )
    if status_filter:
        query = query.filter(FacultyAvailability.status == status_filter)
    if day_of_week is not None:
        query = query.filter(FacultyAvailability.day_of_week == day_of_week)

    return query.all()


@router.post(
    "/availability", response_model=FacultySchema, status_code=status.HTTP_201_CREATED
)
def add_availability(
    slot_in: FacultyAvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Not a faculty member")

    # Check for overlapping slots (simplistic check for demo)
    overlap = (
        db.query(FacultyAvailability)
        .filter(
            FacultyAvailability.faculty_id == current_user.id,
            FacultyAvailability.day_of_week == slot_in.day_of_week,
            FacultyAvailability.start_time < slot_in.end_time,
            FacultyAvailability.end_time > slot_in.start_time,
        )
        .first()
    )

    if overlap:
        raise HTTPException(status_code=409, detail="Overlapping slot exists")

    new_slot = FacultyAvailability(
        faculty_id=current_user.id,
        start_time=slot_in.start_time,
        end_time=slot_in.end_time,
        day_of_week=slot_in.day_of_week,
        status=AvailabilityStatus.ACTIVE,
        source=AvailabilitySource.MANUAL,
    )
    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)

    return new_slot


@router.get("/{faculty_id}/availability", response_model=List[FacultySchema])
def get_faculty_availability(
    faculty_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Ensure the user exists and is a faculty member
    faculty = (
        db.query(User)
        .filter(User.id == faculty_id, User.role == UserRole.FACULTY)
        .first()
    )
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty member not found")

    query = db.query(FacultyAvailability).filter(
        FacultyAvailability.faculty_id == faculty_id,
        FacultyAvailability.status == AvailabilityStatus.ACTIVE,
    )

    return query.all()


@router.post("/timetable/upload")
def upload_timetable(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Not a faculty member")

    # Placeholder for AWS S3 + Lambda + SQS async processing
    return {
        "message": "Timetable uploaded successfully. Processing in background.",
        "job_id": "mock-job-id",
    }
