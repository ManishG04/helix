from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.deps import get_db, get_current_user
from models.user import User
from models.appointment import Appointment
from models.faculty import FacultyAvailability
from schemas.models import (
    Appointment as AppointmentSchema,
    AppointmentCreate,
    UserRole,
    AppointmentStatus,
)

router = APIRouter()


@router.get("")
def list_appointments(
    page: int = 1,
    size: int = 20,
    status: Optional[AppointmentStatus] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    faculty_id: Optional[str] = None,
    team_id: Optional[str] = None,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = db.query(Appointment)

    # Role-based access control
    if current_user.role == UserRole.STUDENT:
        query = query.filter(Appointment.student_id == current_user.id)
    elif current_user.role == UserRole.FACULTY:
        query = query.filter(Appointment.faculty_id == current_user.id)

    # Optional filters (admins can use them too; faculty/student are constrained by role above)
    if status:
        query = query.filter(Appointment.status == status)
    if date_from:
        query = query.filter(Appointment.date >= date_from)
    if date_to:
        query = query.filter(Appointment.date <= date_to)
    if faculty_id:
        query = query.filter(Appointment.faculty_id == str(faculty_id))
    if team_id:
        query = query.filter(Appointment.team_id == str(team_id))

    total = query.count()
    offset = max(0, (page - 1) * size)
    pages = (total + size - 1) // size if size > 0 else 1

    items = (
        query.order_by(Appointment.created_at.asc()).offset(offset).limit(size).all()
    )

    # Ensure JSON-serializable output types (time/date) for the frontend.
    return {
        "items": [AppointmentSchema.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }


@router.post("", response_model=AppointmentSchema, status_code=status.HTTP_201_CREATED)
def create_appointment(
    app_in: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=403, detail="Only students can book appointments"
        )

    # Fetch the selected faculty availability slot.
    # We derive start/end time from the slot so the client doesn't have to (or can't fake) times.
    slot = (
        db.query(FacultyAvailability)
        .filter(FacultyAvailability.id == str(app_in.slot_id))
        .first()
    )
    if not slot:
        raise HTTPException(status_code=404, detail="Faculty or slot not found")

    if slot.faculty_id != str(app_in.faculty_id):
        raise HTTPException(status_code=403, detail="Selected slot does not belong to the faculty")

    derived_start = slot.start_time
    derived_end = slot.end_time

    # Check if the faculty already has an appointment booked at this time
    faculty_overlap = (
        db.query(Appointment)
        .filter(
            Appointment.faculty_id == str(app_in.faculty_id),
            Appointment.date == app_in.date,
            Appointment.start_time < derived_end,
            Appointment.end_time > derived_start,
            Appointment.status.in_(
                [AppointmentStatus.PENDING, AppointmentStatus.ACCEPTED]
            ),
        )
        .first()
    )

    if faculty_overlap:
        raise HTTPException(
            status_code=409,
            detail="The faculty member already has a pending or approved appointment at this time",
        )

    # Check if the student is double-booking their own schedule
    student_overlap = (
        db.query(Appointment)
        .filter(
            Appointment.student_id == current_user.id,
            Appointment.date == app_in.date,
            Appointment.start_time < derived_end,
            Appointment.end_time > derived_start,
            Appointment.status.in_(
                [AppointmentStatus.PENDING, AppointmentStatus.ACCEPTED]
            ),
        )
        .first()
    )

    if student_overlap:
        raise HTTPException(
            status_code=409,
            detail="You already have an appointment scheduled at this time",
        )

    # Optional logic verifying faculty slot exists could go here

    new_app = Appointment(
        student_id=current_user.id,
        team_id=str(app_in.team_id) if app_in.team_id else None,
        faculty_id=str(app_in.faculty_id),
        slot_id=str(app_in.slot_id),
        purpose=app_in.purpose,
        date=app_in.date,
        start_time=derived_start,
        end_time=derived_end,
        status=AppointmentStatus.PENDING,
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    return new_app


@router.patch("/{appointment_id}/status", response_model=AppointmentSchema)
def update_appointment_status(
    appointment_id: str,
    new_status: AppointmentStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if current_user.role != UserRole.FACULTY or app.faculty_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this appointment"
        )

    # Automatically reject other pending overlapping requests if this one gets approved
    if new_status == AppointmentStatus.ACCEPTED and app.status != AppointmentStatus.ACCEPTED:
        overlapping_apps = (
            db.query(Appointment)
            .filter(
                Appointment.id != appointment_id,
                Appointment.faculty_id == app.faculty_id,
                Appointment.date == app.date,
                Appointment.start_time < app.end_time,
                Appointment.end_time > app.start_time,
                Appointment.status == AppointmentStatus.PENDING,
            )
            .all()
        )

        for overlap_app in overlapping_apps:
            overlap_app.status = AppointmentStatus.REJECTED

    app.status = new_status
    db.commit()
    db.refresh(app)

    return app


@router.post("/{appointment_id}/accept", response_model=AppointmentSchema)
def accept_appointment(
    appointment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if current_user.role != UserRole.FACULTY or app.faculty_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this appointment"
        )

    if app.status != AppointmentStatus.PENDING:
        raise HTTPException(status_code=409, detail="Appointment already processed")

    # Automatically reject other pending overlapping requests if this one gets approved
    overlapping_apps = (
        db.query(Appointment)
        .filter(
            Appointment.id != appointment_id,
            Appointment.faculty_id == app.faculty_id,
            Appointment.date == app.date,
            Appointment.start_time < app.end_time,
            Appointment.end_time > app.start_time,
            Appointment.status == AppointmentStatus.PENDING,
        )
        .all()
    )

    for overlap_app in overlapping_apps:
        overlap_app.status = AppointmentStatus.REJECTED

    app.status = AppointmentStatus.ACCEPTED
    db.commit()
    db.refresh(app)
    return app


@router.post("/{appointment_id}/reject", response_model=AppointmentSchema)
def reject_appointment(
    appointment_id: str,
    payload: Optional[dict] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # `payload.reason` is currently not persisted; we still accept it to match frontend/OpenAPI.
    _ = payload.get("reason") if payload else None

    app = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if current_user.role != UserRole.FACULTY or app.faculty_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this appointment"
        )

    if app.status != AppointmentStatus.PENDING:
        raise HTTPException(status_code=409, detail="Appointment already processed")

    app.status = AppointmentStatus.REJECTED
    db.commit()
    db.refresh(app)
    return app
