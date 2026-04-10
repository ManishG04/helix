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
