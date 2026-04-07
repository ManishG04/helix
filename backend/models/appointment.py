import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Enum, DateTime, ForeignKey, Date, Time
from sqlalchemy.orm import relationship
from db.session import Base
from schemas.models import AppointmentStatus


def generate_uuid():
    return str(uuid.uuid4())


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    slot_id = Column(String, ForeignKey("faculty_availability.id"), nullable=False)
    student_id = Column(String, ForeignKey("users.id"), nullable=False)
    faculty_id = Column(String, ForeignKey("users.id"), nullable=False)
    team_id = Column(String, ForeignKey("teams.id"), nullable=True)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    status = Column(
        Enum(AppointmentStatus), default=AppointmentStatus.PENDING, nullable=False
    )
    purpose = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    slot = relationship("FacultyAvailability")
    student = relationship("User", foreign_keys=[student_id])
    faculty = relationship("User", foreign_keys=[faculty_id])
    team = relationship("Team", foreign_keys=[team_id])
