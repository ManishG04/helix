def test_register_new_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test Student",
            "email": "student@test.com",
            "password": "strongpassword123",
            "role": "STUDENT",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Student"
    assert data["email"] == "student@test.com"
    assert data["role"] == "STUDENT"
    assert "id" in data


def test_register_existing_user(client):
    # First, create a user
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "First Mover",
            "email": "duplicate@test.com",
            "password": "pass",
            "role": "STUDENT",
        },
    )

    # Try to register again with same email
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Second Try",
            "email": "duplicate@test.com",
            "password": "pass",
            "role": "STUDENT",
        },
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_success(client):
    # Setup: register user
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Login User",
            "email": "login@test.com",
            "password": "mypassword",
            "role": "STUDENT",
        },
    )

    # Act: log in using OAuth2 form data
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "login@test.com", "password": "mypassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_failure_wrong_password(client):
    # Setup: register user
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Failure Check",
            "email": "fail@test.com",
            "password": "correct_password",
            "role": "STUDENT",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        data={"username": "fail@test.com", "password": "wrong_password"},
    )
    assert response.status_code == 400


def test_protected_route_with_token(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Protected Mode",
            "email": "protect@test.com",
            "password": "pw",
            "role": "STUDENT",
        },
    )

    login_response = client.post(
        "/api/v1/auth/login", data={"username": "protect@test.com", "password": "pw"}
    )
    token = login_response.json()["access_token"]

    response = client.get(
        "/api/v1/auth/test-token", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    assert response.json()["email"] == "protect@test.com"


def test_protected_route_no_token(client):
    response = client.get("/api/v1/auth/test-token")
    assert response.status_code == 401

def test_change_password(client, auth_headers):
    headers = auth_headers(email="changepw@test.com", role="STUDENT")
    
    # Successful change
    resp = client.post("/api/v1/auth/change-password", headers=headers, json={
        "current_password": "password123",
        "new_password": "newpassword456"
    })
    assert resp.status_code == 200
    assert resp.json()["message"] == "Password changed successfully"
    
    # Try logging in with new password
    login_resp = client.post("/api/v1/auth/login", data={
        "username": "changepw@test.com",
        "password": "newpassword456"
    })
    assert login_resp.status_code == 200

def test_change_password_wrong_current(client, auth_headers):
    headers = auth_headers(email="wrongpw@test.com", role="STUDENT")
    
    resp = client.post("/api/v1/auth/change-password", headers=headers, json={
        "current_password": "wrongpassword",
        "new_password": "newpassword456"
    })
    assert resp.status_code == 400

def test_logout(client, auth_headers):
    headers = auth_headers(email="logout@test.com", role="STUDENT")
    resp = client.post("/api/v1/auth/logout", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["message"] == "Logged out successfully"
