from typing import List, Optional
import uuid
import secrets
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.deps import get_db, get_current_user
from models.user import User
from models.project import Project
from models.team import Team, TeamMember
from schemas.models import (
    Team as TeamSchema,
    TeamCreate,
    TeamWithMembers,
    JoinTeamRequest,
    UserRole,
    TeamMember as TeamMemberSchema,
)

router = APIRouter()


def generate_join_code(length=8):
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


@router.get("/", response_model=List[TeamSchema])
def list_teams(
    page: int = 1,
    size: int = 20,
    project_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Team)
    if project_id:
        query = query.filter(Team.project_id == project_id)

    teams = query.offset((page - 1) * size).limit(size).all()
    return teams


@router.post("/", response_model=TeamSchema, status_code=201)
def create_team(
    team_in: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == str(team_in.project_id)).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    existing_team = (
        db.query(Team).filter(Team.project_id == str(team_in.project_id)).first()
    )
    if existing_team:
        raise HTTPException(
            status_code=409, detail="This project already has a team associated with it"
        )

    user_in_team = (
        db.query(TeamMember).filter(TeamMember.member_id == current_user.id).first()
    )
    if user_in_team:
        raise HTTPException(status_code=409, detail="You are already in a team")

    new_team = Team(
        project_id=str(team_in.project_id),
        name=team_in.name,
        join_code=generate_join_code(),
    )
    db.add(new_team)
    db.commit()
    db.refresh(new_team)

    new_member = TeamMember(
        member_id=current_user.id, team_id=new_team.id, is_leader=True
    )
    db.add(new_member)
    db.commit()

    return new_team


@router.get("/{team_id}", response_model=TeamWithMembers)
def get_team(
    team_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team


@router.post("/join", response_model=TeamSchema)
def join_team(
    join_request: JoinTeamRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in [UserRole.STUDENT, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only students can join teams")

    team = db.query(Team).filter(Team.join_code == join_request.join_code).first()
    if not team:
        raise HTTPException(
            status_code=404, detail="Invalid join code. Team not found."
        )

    existing_membership = (
        db.query(TeamMember).filter(TeamMember.member_id == current_user.id).first()
    )
    if existing_membership:
        if existing_membership.team_id == team.id:
            raise HTTPException(
                status_code=409, detail="You are already a member of this team"
            )
        raise HTTPException(status_code=409, detail="You are already in another team")

    new_member = TeamMember(member_id=current_user.id, team_id=team.id, is_leader=False)
    db.add(new_member)
    db.commit()

    return team


@router.delete("/{team_id}/members/{user_id}", status_code=204)
def remove_team_member(
    team_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member_record = (
        db.query(TeamMember)
        .filter(TeamMember.team_id == team_id, TeamMember.member_id == user_id)
        .first()
    )

    if not member_record:
        raise HTTPException(status_code=404, detail="User is not a member of this team")

    if current_user.id != user_id:
        requesting_user_record = (
            db.query(TeamMember)
            .filter(
                TeamMember.team_id == team_id, TeamMember.member_id == current_user.id
            )
            .first()
        )

        if not requesting_user_record or not requesting_user_record.is_leader:
            raise HTTPException(
                status_code=403, detail="Only the team leader can remove other members"
            )

    db.delete(member_record)
    db.commit()
    return None
