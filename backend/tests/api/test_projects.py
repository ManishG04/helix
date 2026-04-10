def test_create_project_student(client, auth_headers):
    headers = auth_headers(email="student1@test.com", role="STUDENT")
    resp = client.post(
        "/api/v1/projects/",
        headers=headers,
        json={
            "title": "New AI Model",
            "description": "AI model for text generation",
            "domain": "AI/ML",
            "tags": ["AI", "Python"],
        },
    )

    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "New AI Model"
    assert data["status"] == "PROPOSED"
    assert data["current_phase"] == "SYNOPSIS"


def test_create_project_faculty(client, auth_headers):
    headers = auth_headers(email="fac1@test.com", role="FACULTY")
    resp = client.post(
        "/api/v1/projects/",
        headers=headers,
        json={
            "title": "Faculty AI Model",
            "description": "AI model for text generation",
            "domain": "AI/ML",
            "tags": ["AI", "Python"],
        },
    )

    # Faculty CANNOT create projects based on new rules
    assert resp.status_code == 403


def test_list_projects(client, auth_headers):
    headers = auth_headers()
    client.post(
        "/api/v1/projects/",
        headers=headers,
        json={
            "title": "Test Project 1",
            "description": "Desc",
            "domain": "Web",
            "tags": ["Web"],
        },
    )

    resp = client.get("/api/v1/projects/", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert any(p["title"] == "Test Project 1" for p in data)


def test_approve_project(client, auth_headers):
    # Student proposes project
    stu_headers = auth_headers(email="s1@test.com", role="STUDENT")
    proj_resp = client.post(
        "/api/v1/projects/",
        headers=stu_headers,
        json={
            "title": "Proj to approve",
            "description": "Desc",
            "domain": "Web",
            "tags": ["Web"],
        },
    )
    proj_id = proj_resp.json()["id"]

    # Student tries to approve it (should fail)
    fail_resp = client.post(f"/api/v1/projects/{proj_id}/approve", headers=stu_headers)
    assert fail_resp.status_code == 403

    # Faculty approves it
    fac_headers = auth_headers(email="f1@test.com", role="FACULTY")
    succ_resp = client.post(f"/api/v1/projects/{proj_id}/approve", headers=fac_headers)
    assert succ_resp.status_code == 200
    assert succ_resp.json()["status"] == "APPROVED"


def test_advance_project_phase(client, auth_headers):
    # Setup
    stu_headers = auth_headers(email="s_adv@test.com", role="STUDENT")
    fac_headers = auth_headers(email="f_adv@test.com", role="FACULTY")
    # Need to get faculty ID to assign them as mentor on creation
    resp = client.post(
        "/api/v1/auth/login",
        data={"username": "f_adv@test.com", "password": "password123"},
    )
    fac_id = resp.json()["user"]["id"]

    # 1. Propose with mentor ID assigned
    proj_resp = client.post(
        "/api/v1/projects/",
        headers=stu_headers,
        json={
            "title": "Advancing Project",
            "description": "Desc",
            "domain": "Web",
            "tags": ["Web"],
            "mentor_id": fac_id,
        },
    )
    proj_id = proj_resp.json()["id"]

    # 2. Advance (Fails because it's not approved yet, depending on logic or just tests faculty role)
    # Actually, the endpoint logic tests role then advances if project exists and handles status
    # We will test if student fails to advance it
    stu_adv = client.post(
        f"/api/v1/projects/{proj_id}/advance-phase", headers=stu_headers
    )
    assert stu_adv.status_code == 403

    # 3. Faculty approves it first (and becomes mentor automatically based on endpoint?)
    # Assuming `approve_project` sets the current_user as mentor...
    fac_app = client.post(f"/api/v1/projects/{proj_id}/approve", headers=fac_headers)
    assert fac_app.status_code == 200

    # 4. Faculty advances it
    fac_adv = client.post(
        f"/api/v1/projects/{proj_id}/advance-phase", headers=fac_headers
    )
    assert fac_adv.status_code == 200

    # Verify phase moved from SYNOPSIS to MID_TERM
    assert fac_adv.json()["current_phase"] == "MID_TERM"

    # Advance again to FINAL_EVALUATION
    fac_adv_2 = client.post(
        f"/api/v1/projects/{proj_id}/advance-phase", headers=fac_headers
    )
    assert fac_adv_2.json()["current_phase"] == "FINAL_EVALUATION"

    # Advance again (maxed out)
    fac_adv_3 = client.post(
        f"/api/v1/projects/{proj_id}/advance-phase", headers=fac_headers
    )
    assert fac_adv_3.status_code == 409
    assert "already in the final phase" in fac_adv_3.json()["detail"].lower()
