def test_add_faculty_availability(client, auth_headers):
    # Try as student - must fail
    student_headers = auth_headers(email="s1@test.com", role="STUDENT")
    resp_fail = client.post(
        "/api/v1/faculty/availability",
        headers=student_headers,
        json={"day_of_week": 1, "start_time": "10:00:00", "end_time": "11:00:00"},
    )
    assert resp_fail.status_code == 403

    # Try as faculty - succeeds
    faculty_headers = auth_headers(email="f1@test.com", role="FACULTY")
    resp_succ = client.post(
        "/api/v1/faculty/availability",
        headers=faculty_headers,
        json={"day_of_week": 1, "start_time": "10:00:00", "end_time": "11:00:00"},
    )

    assert resp_succ.status_code == 201
    assert resp_succ.json()["day_of_week"] == 1
    assert resp_succ.json()["start_time"] == "10:00:00"


def test_faculty_overlap_prevention(client, auth_headers):
    fac_headers = auth_headers(email="f3@test.com", role="FACULTY")

    # Base slot
    client.post(
        "/api/v1/faculty/availability",
        headers=fac_headers,
        json={"day_of_week": 2, "start_time": "13:00:00", "end_time": "14:00:00"},
    )

    # Conflicting slot
    conflict = client.post(
        "/api/v1/faculty/availability",
        headers=fac_headers,
        json={
            "day_of_week": 2,
            "start_time": "13:30:00",  # Overlaps!
            "end_time": "14:30:00",
        },
    )

    assert conflict.status_code == 409


def test_get_faculty_availability(client, auth_headers):
    fac_headers = auth_headers(email="f4@test.com", role="FACULTY")

    slot_post = client.post(
        "/api/v1/faculty/availability",
        headers=fac_headers,
        json={"day_of_week": 3, "start_time": "09:00:00", "end_time": "10:00:00"},
    )
    fac_id = slot_post.json()["faculty_id"]

    # Student inquiries faculty 4's schedule
    stu_headers = auth_headers(email="s4@test.com", role="STUDENT")
    get_resp = client.get(f"/api/v1/faculty/{fac_id}/availability", headers=stu_headers)
    assert get_resp.status_code == 200
    assert len(get_resp.json()) == 1
    assert get_resp.json()[0]["day_of_week"] == 3
