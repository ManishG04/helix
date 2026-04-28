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
            Appointment.start_time < app_in.end_time,
            Appointment.end_time > app_in.start_time,
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
        start_time=app_in.start_time,
        end_time=app_in.end_time,
        status=AppointmentStatus.PENDING,
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    return new_app


@router.get("/available-slots")
def get_available_slots(
    faculty_id: str,
    date: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Dummy mock implementation to satisfy openapi.yaml
    return []


@router.get("/{appointment_id}", response_model=AppointmentSchema)
def get_appointment(
    appointment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if current_user.role == UserRole.STUDENT and app.student_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this appointment"
        )
    if current_user.role == UserRole.FACULTY and app.faculty_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this appointment"
        )
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

    # Automatically reject other pending overlapping requests if this one gets approved
    if app.status != AppointmentStatus.ACCEPTED:
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


from pydantic import BaseModel


class RejectReasonResponse(BaseModel):
    reason: Optional[str] = None


@router.post("/{appointment_id}/reject", response_model=AppointmentSchema)
def reject_appointment(
    appointment_id: str,
    body: RejectReasonResponse = None,
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

    app.status = AppointmentStatus.REJECTED
    # logic to store body.reason could go here if the model supported it.
    db.commit()
    db.refresh(app)

    return app


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(
    appointment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Only the student who booked it can delete it (or an admin)
    if current_user.role == UserRole.STUDENT and app.student_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this appointment"
        )

    # Faculty can only delete appointments associated with them
    if current_user.role == UserRole.FACULTY and app.faculty_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this appointment"
        )

    db.delete(app)
    db.commit()
    return None
