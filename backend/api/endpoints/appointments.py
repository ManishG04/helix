from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.deps import get_db, get_current_user
from models.user import User
from models.appointment import Appointment
from schemas.models import (
    Appointment as AppointmentSchema,
    AppointmentCreate,
    UserRole,
    AppointmentStatus,
)

router = APIRouter()


@router.get("/", response_model=List[AppointmentSchema])
def list_appointments(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.STUDENT:
        # Students see their own appointments
        return (
            db.query(Appointment)
            .filter(Appointment.student_id == current_user.id)
            .order_by(Appointment.created_at.asc())
            .all()
        )
    elif current_user.role == UserRole.FACULTY:
        # Faculty see appointments booked with them, ordered by booking time (first-come first-serve)
        return (
            db.query(Appointment)
            .filter(Appointment.faculty_id == current_user.id)
            .order_by(Appointment.created_at.asc())
            .all()
        )

    return db.query(Appointment).order_by(Appointment.created_at.asc()).all()


@router.post("/", response_model=AppointmentSchema, status_code=status.HTTP_201_CREATED)
def create_appointment(
    app_in: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=403, detail="Only students can book appointments"
        )

    # Check if the faculty already has an appointment booked at this exact time
    faculty_overlap = (
        db.query(Appointment)
        .filter(
            Appointment.faculty_id == str(app_in.faculty_id),
            Appointment.date == app_in.date,
            Appointment.start_time < app_in.end_time,
            Appointment.end_time > app_in.start_time,
            Appointment.status.in_(
                [AppointmentStatus.PENDING, AppointmentStatus.APPROVED]
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
            Appointment.start_time < app_in.end_time,
            Appointment.end_time > app_in.start_time,
            Appointment.status.in_(
                [AppointmentStatus.PENDING, AppointmentStatus.APPROVED]
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
        start_time=app_in.start_time,
        end_time=app_in.end_time,
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
    if (
        new_status == AppointmentStatus.APPROVED
        and app.status != AppointmentStatus.APPROVED
    ):
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
