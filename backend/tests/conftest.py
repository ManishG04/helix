import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from main import app
from db.session import Base
from api.deps import get_db

# Import models to ensure they are registered with Base metadata before create_all
from models.user import User
from models.project import Project
from models.team import Team, TeamMember
from models.faculty import FacultyAvailability
from models.appointment import Appointment

# Use an in-memory SQLite database for fast, isolated tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def db_engine():
    """Create all tables for testing."""
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(db_engine) -> Generator[Session, None, None]:
    """
    Creates a fresh sqlalchemy session for each test that automatically rolls back
    after the test completes, ensuring true isolation.
    """
    connection = db_engine.connect()
    # Begin a distinct transaction
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    # Roll back so the next test gets a clean slate
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """
    Returns a FastAPI TestClient with the `get_db` dependency overridden to use
    our isolated test database session.
    """

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client: TestClient) -> dict:
    """Helper to register and login a user, returning auth headers."""

    def _auth_headers(email="test@example.com", role="STUDENT"):
        client.post(
            "/api/v1/auth/register",
            json={
                "name": "Test User",
                "email": email,
                "password": "password123",
                "role": role,
            },
        )
        resp = client.post(
            "/api/v1/auth/login", data={"username": email, "password": "password123"}
        )
        token = resp.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    return _auth_headers
