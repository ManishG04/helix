from fastapi import APIRouter
from api.endpoints import (
    auth,
    users,
    projects,
    teams,
    faculty,
    appointments,
    admin,
    health,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(teams.router, prefix="/teams", tags=["Teams"])
api_router.include_router(
    faculty.router, prefix="/faculty", tags=["Faculty Availability", "Timetable OCR"]
)
api_router.include_router(
    appointments.router, prefix="/appointments", tags=["Appointments"]
)
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(health.router, prefix="", tags=["Health"])
