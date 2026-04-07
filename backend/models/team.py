import uuid
from sqlalchemy import Column, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from db.session import Base


def generate_uuid():
    return str(uuid.uuid4())


class Team(Base):
    __tablename__ = "teams"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    name = Column(String, nullable=False)
    join_code = Column(String, unique=True, index=True, nullable=False)

    project = relationship("Project")
    members = relationship(
        "TeamMember", back_populates="team", cascade="all, delete-orphan"
    )


class TeamMember(Base):
    __tablename__ = "team_members"

    member_id = Column(String, ForeignKey("users.id"), primary_key=True)
    team_id = Column(String, ForeignKey("teams.id"), primary_key=True)
    is_leader = Column(Boolean, default=False, nullable=False)

    member = relationship("User")
    team = relationship("Team", back_populates="members")
