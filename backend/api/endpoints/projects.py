from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.deps import get_db, get_current_user
from models.user import User
from models.project import Project
from schemas.models import (
    Project as ProjectSchema,
    ProjectCreate,
    ProjectUpdate,
    ProjectStatus,
    ProjectPhase,
    UserRole,
)

router = APIRouter()


@router.get("/", response_model=List[ProjectSchema])
def list_projects(
    page: int = 1,
    size: int = 20,
    status_filter: Optional[ProjectStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Project)

    if current_user.role == UserRole.FACULTY:
        query = query.filter(Project.mentor_id == current_user.id)

    if status_filter:
        query = query.filter(Project.status == status_filter)

    projects = query.offset((page - 1) * size).limit(size).all()
    return projects


@router.post("/", response_model=ProjectSchema, status_code=201)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in [UserRole.STUDENT, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403, detail="Only students can propose projects"
        )

    new_project = Project(
        title=project_in.title,
        description=project_in.description,
        mentor_id=str(project_in.mentor_id) if project_in.mentor_id else None,
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


@router.get("/{project_id}", response_model=ProjectSchema)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/{project_id}/approve", response_model=ProjectSchema)
def approve_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in [UserRole.FACULTY, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403, detail="Only Faculty or Admins can approve projects"
        )

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.status == ProjectStatus.APPROVED:
        raise HTTPException(status_code=409, detail="Project is already approved")

    project.status = ProjectStatus.APPROVED
    db.commit()
    db.refresh(project)
    return project


@router.post("/{project_id}/advance-phase", response_model=ProjectSchema)
def advance_project_phase(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Only Faculty can advance phases")

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.mentor_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="You are not the mentor of this project"
        )

    if project.status != ProjectStatus.APPROVED:
        raise HTTPException(
            status_code=409, detail="Project must be approved to advance phases"
        )

    phases = list(ProjectPhase)
    try:
        current_index = phases.index(project.current_phase)
    except ValueError:
        current_index = 0

    if current_index >= len(phases) - 1:
        raise HTTPException(
            status_code=409, detail="Project is already in the final phase"
        )

    project.current_phase = phases[current_index + 1]
    db.commit()
    db.refresh(project)
    return project
