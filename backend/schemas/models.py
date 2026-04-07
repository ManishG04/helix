import uuid
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from enum import Enum
from datetime import date, time, datetime


class UserRole(str, Enum):
    STUDENT = "STUDENT"
    FACULTY = "FACULTY"
    ADMIN = "ADMIN"


class ProjectStatus(str, Enum):
    PROPOSED = "PROPOSED"
    APPROVED = "APPROVED"
    COMPLETED = "COMPLETED"


class ProjectPhase(str, Enum):
    SYNOPSIS = "SYNOPSIS"
    MID_TERM = "MID_TERM"
    FINAL_EVALUATION = "FINAL_EVALUATION"


class AvailabilityStatus(str, Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    DISABLED = "DISABLED"
    ACTIVE = "ACTIVE"


class AvailabilitySource(str, Enum):
    MANUAL = "MANUAL"
    OCR = "OCR"


class AppointmentStatus(str, Enum):
    PENDING = "PENDING"
    REJECTED = "REJECTED"
    ACCEPTED = "ACCEPTED"


class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    role: UserRole
    academic_interests: Optional[str] = None


class User(UserBase):
    id: uuid.UUID


class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    mentor_id: Optional[uuid.UUID] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    mentor_id: Optional[uuid.UUID] = None
    status: Optional[ProjectStatus] = None
    current_phase: Optional[ProjectPhase] = None


class Project(ProjectBase):
    id: uuid.UUID
    mentor_id: Optional[uuid.UUID] = None
    status: ProjectStatus
    current_phase: Optional[ProjectPhase] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TeamBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class TeamCreate(TeamBase):
    project_id: uuid.UUID


class Team(TeamBase):
    id: uuid.UUID
    project_id: uuid.UUID
    join_code: str

    class Config:
        from_attributes = True


class TeamMember(BaseModel):
    member_id: uuid.UUID
    team_id: uuid.UUID
    is_leader: bool
    member: User

    class Config:
        from_attributes = True


class TeamWithMembers(Team):
    members: List[TeamMember] = []


class JoinTeamRequest(BaseModel):
    join_code: str


class FacultyAvailabilityBase(BaseModel):
    start_time: time
    end_time: time
    day_of_week: int = Field(..., ge=0, le=6)


class FacultyAvailabilityCreate(FacultyAvailabilityBase):
    pass


class FacultyAvailability(FacultyAvailabilityBase):
    id: uuid.UUID
    faculty_id: uuid.UUID
    status: AvailabilityStatus
    source: AvailabilitySource
    created_at: datetime

    class Config:
        from_attributes = True


class AppointmentBase(BaseModel):
    date: date
    start_time: time
    end_time: time
    purpose: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    slot_id: uuid.UUID
    faculty_id: uuid.UUID
    team_id: Optional[uuid.UUID] = None


class Appointment(AppointmentBase):
    id: uuid.UUID
    slot_id: uuid.UUID
    student_id: uuid.UUID
    faculty_id: uuid.UUID
    team_id: Optional[uuid.UUID] = None
    status: AppointmentStatus
    created_at: datetime

    class Config:
        from_attributes = True
