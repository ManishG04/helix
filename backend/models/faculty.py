import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Enum, DateTime, ForeignKey, Integer, Time
from sqlalchemy.orm import relationship
from db.session import Base
from schemas.models import AvailabilityStatus, AvailabilitySource


def generate_uuid():
    return str(uuid.uuid4())


class FacultyAvailability(Base):
    __tablename__ = "faculty_availability"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    faculty_id = Column(String, ForeignKey("users.id"), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    day_of_week = Column(Integer, nullable=False)
    status = Column(
        Enum(AvailabilityStatus), default=AvailabilityStatus.ACTIVE, nullable=False
    )
    source = Column(
        Enum(AvailabilitySource), default=AvailabilitySource.MANUAL, nullable=False
    )
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    faculty = relationship("User", foreign_keys=[faculty_id])
