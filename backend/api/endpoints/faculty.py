from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
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


@router.post("/timetable/upload", status_code=status.HTTP_202_ACCEPTED)
def upload_timetable(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Not a faculty member")

    allowed_types = ["image/jpeg", "image/png", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=422,
            detail="Invalid file type. Only JPEG, PNG, and PDF are supported.",
        )

    # Placeholder for AWS S3 direct upload
    # e.g., boto3_client.upload_fileobj(file.file, "helix-timetables", unique_s3_key)
    # The S3 PutObject event will natively trigger the OCR Lambda function!
    # Returning a 202 Accepted because processing will hit the DB async.
    return {
        "message": "Timetable uploaded to AWS S3 successfully. Background Lambda triggered for OCR.",
        "job_id": "mock-job-id",
    }


@router.delete(
    "/availability/{availability_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_availability(
    availability_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Not a faculty member")

    slot = (
        db.query(FacultyAvailability)
        .filter(
            FacultyAvailability.id == availability_id,
            FacultyAvailability.faculty_id == current_user.id,
        )
        .first()
    )

    if not slot:
        raise HTTPException(status_code=404, detail="Availability slot not found")

    db.delete(slot)
    db.commit()
    return None


@router.post("/availability/bulk", response_model=List[FacultySchema])
def add_availability_bulk(
    slots_in: List[FacultyAvailabilityCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Not a faculty member")

    new_slots = []
    for slot_in in slots_in:
        # Simplified overlap logic per slot
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
        if not overlap:
            new_slot = FacultyAvailability(
                faculty_id=current_user.id,
                start_time=slot_in.start_time,
                end_time=slot_in.end_time,
                day_of_week=slot_in.day_of_week,
                status=AvailabilityStatus.ACTIVE,
                source=AvailabilitySource.MANUAL,
            )
            db.add(new_slot)
            new_slots.append(new_slot)

    db.commit()
    for s in new_slots:
        db.refresh(s)

    return new_slots


@router.get("/timetable/ocr-status/{job_id}")
def check_ocr_status(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Not a faculty member")

    # Mock DB read for OCR step
    return {"job_id": job_id, "status": "COMPLETED"}


@router.get("/timetable/ocr-results/{job_id}")
def check_ocr_results(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Not a faculty member")

    # Return empty mock results
    return {
        "job_id": job_id,
        "extracted_slots": [
            {"day_of_week": 1, "start_time": "09:00:00", "end_time": "10:00:00"}
        ],
    }


@router.post("/timetable/ocr-confirm/{job_id}", response_model=List[FacultySchema])
def confirm_ocr_results(
    job_id: str,
    slots_in: List[FacultyAvailabilityCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Not a faculty member")

    # Basically identical bulk-addition mapping logic.
    return add_availability_bulk(slots_in, db, current_user)
