def test_create_team(client, auth_headers):
    headers = auth_headers(email="team-creator@test.com", role="STUDENT")
    # First create a project since team requires project_id
    proj_resp = client.post(
        "/api/v1/projects/",
        headers=headers,
        json={
            "title": "Team Project 1",
            "description": "Desc",
            "domain": "Web",
            "tags": ["Web"],
        },
    )
    project_id = proj_resp.json()["id"]

    resp = client.post(
        "/api/v1/teams/",
        headers=headers,
        json={
            "name": "Alpha Squad",
            "description": "Leading the way",
            "project_id": project_id,
        },
    )

    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Alpha Squad"
    assert "join_code" in data


def test_join_team(client, auth_headers):
    # Leader creates a team
    leader_headers = auth_headers(email="leader@test.com", role="STUDENT")
    proj_resp = client.post(
        "/api/v1/projects/",
        headers=leader_headers,
        json={
            "title": "Team Project 2",
            "description": "Desc",
            "domain": "Web",
            "tags": ["Web"],
        },
    )
    project_id = proj_resp.json()["id"]

    team_resp = client.post(
        "/api/v1/teams/",
        headers=leader_headers,
        json={
            "name": "Beta Squad",
            "description": "A great team",
            "project_id": project_id,
        },
    )
    join_code = team_resp.json()["join_code"]
    team_id = team_resp.json()["id"]

    # Member joins
    member_headers = auth_headers(email="member@test.com", role="STUDENT")
    join_resp = client.post(
        "/api/v1/teams/join", headers=member_headers, json={"join_code": join_code}
    )

    assert join_resp.status_code == 200
    if "id" in join_resp.json():
        assert join_resp.json()["id"] == team_id

    # Query team and see the members incremented
    get_resp = client.get(f"/api/v1/teams/{team_id}", headers=member_headers)
    assert get_resp.status_code == 200
    assert len(get_resp.json()["members"]) == 2


def test_join_team_invalid_code(client, auth_headers):
    headers = auth_headers(email="test2@test.com", role="STUDENT")
    resp = client.post(
        "/api/v1/teams/join", headers=headers, json={"join_code": "INVALID123"}
    )
    assert resp.status_code == 404
    assert "Invalid join code" in resp.json()["detail"]

    invalid_resp = client.post(
        "/api/v1/teams/join",
        headers=headers,
        json={"join_code": "INVALID123"},
    )
    assert invalid_resp.status_code == 404


def test_team_member_list_and_remove(client, auth_headers):
    # Setup
    stu1_headers = auth_headers(email="s_team_ldr@test.com", role="STUDENT")
    stu2_headers = auth_headers(email="s_team_mbr@test.com", role="STUDENT")

    # 1. Propose & create team
    p_resp = client.post(
        "/api/v1/projects/",
        headers=stu1_headers,
        json={
            "title": "Team Test Proj",
            "description": "Desc",
            "domain": "Web",
            "tags": ["Web"],
        },
    )
    proj_id = p_resp.json()["id"]

    team_resp = client.post(
        "/api/v1/teams/",
        headers=stu1_headers,
        json={"name": "Alpha Team", "project_id": proj_id},
    )
    team_id = team_resp.json()["id"]
    join_code = team_resp.json()["join_code"]

    # 2. Member joins
    client.post(
        "/api/v1/teams/join", headers=stu2_headers, json={"join_code": join_code}
    )

    # 3. List members
    members_resp = client.get(f"/api/v1/teams/{team_id}/members", headers=stu1_headers)
    assert members_resp.status_code == 200
    assert len(members_resp.json()) == 2

    # 4. Remove member successfully
    s2_id = (
        client.get("/api/v1/users/me", headers=stu2_headers).json().get("id", "dummy")
    )
    # Wait, we need real user id. Let's list members and extract it.
    members = members_resp.json()
    s2_member = next(m for m in members if not m["is_leader"])
    member_user_id = s2_member["member_id"]

    del_resp = client.delete(
        f"/api/v1/teams/{team_id}/members/{member_user_id}", headers=stu1_headers
    )
    assert del_resp.status_code == 204

    # Confirm removal
    members_resp2 = client.get(f"/api/v1/teams/{team_id}/members", headers=stu1_headers)
    assert len(members_resp2.json()) == 1


def test_team_leadership_transfer_and_regen_code(client, auth_headers):
    stu_old_ldr = auth_headers(email="leader1@test.com", role="STUDENT")
    stu_new_ldr = auth_headers(email="leader2@test.com", role="STUDENT")

    # 1. Propose & Create
    p_resp = client.post(
        "/api/v1/projects/",
        headers=stu_old_ldr,
        json={"title": "Ldr", "description": "D", "domain": "Web", "tags": ["Web"]},
    )
    team_resp = client.post(
        "/api/v1/teams/",
        headers=stu_old_ldr,
        json={"name": "LDR Team", "project_id": p_resp.json()["id"]},
    )
    team_id = team_resp.json()["id"]
    join_code = team_resp.json()["join_code"]

    # 2. Member joins
    client.post(
        "/api/v1/teams/join", headers=stu_new_ldr, json={"join_code": join_code}
    )

    m_list = client.get(f"/api/v1/teams/{team_id}/members", headers=stu_old_ldr).json()
    new_ldr_id = next(m for m in m_list if not m["is_leader"])["member_id"]

    # 3. Regenerate Code (Valid leader)
    regen = client.post(f"/api/v1/teams/{team_id}/regenerate-code", headers=stu_old_ldr)
    assert regen.status_code == 200
    assert regen.json()["join_code"] != join_code

    # 4. Transfer leadership
    transfer = client.post(
        f"/api/v1/teams/{team_id}/transfer-leadership",
        headers=stu_old_ldr,
        json={"new_leader_id": new_ldr_id},
    )
    assert transfer.status_code == 200

    # 5. Old leader tries to regenerate code (Should fail 403)
    no_regen = client.post(
        f"/api/v1/teams/{team_id}/regenerate-code", headers=stu_old_ldr
    )
    assert no_regen.status_code == 403
