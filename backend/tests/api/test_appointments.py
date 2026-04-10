import uuid


def test_book_appointment(client, auth_headers):
    # Setup
    fac_headers = auth_headers(email="fac_appoint@test.com", role="FACULTY")
    stu_headers = auth_headers(email="stu_appoint@test.com", role="STUDENT")

    # 1. Faculty creates a slot
    slot_resp = client.post(
        "/api/v1/faculty/availability",
        headers=fac_headers,
        json={"day_of_week": 4, "start_time": "14:00:00", "end_time": "15:00:00"},
    )
    slot_id = slot_resp.json()["id"]
    fac_id = slot_resp.json()["faculty_id"]

    # 2. Student books it
    app_resp = client.post(
        "/api/v1/appointments/",
        headers=stu_headers,
        json={
            "slot_id": slot_id,
            "faculty_id": fac_id,
            "purpose": "Need guidance",
            "date": "2026-04-16",  # Thursday (day 4) in the future
            "start_time": "14:00:00",
            "end_time": "14:30:00",
        },
    )

    assert app_resp.status_code == 201
    assert app_resp.json()["faculty_id"] == fac_id
    assert app_resp.json()["status"] == "PENDING"
    assert app_resp.json()["purpose"] == "Need guidance"


def test_prevent_double_booking_student(client, auth_headers):
    fac1_headers = auth_headers(email="fac22@test.com", role="FACULTY")
    fac2_headers = auth_headers(email="fac23@test.com", role="FACULTY")
    stu_headers = auth_headers(email="stu22@test.com", role="STUDENT")

    slot1_resp = client.post(
        "/api/v1/faculty/availability",
        headers=fac1_headers,
        json={"day_of_week": 5, "start_time": "10:00:00", "end_time": "12:00:00"},
    )
    slot2_resp = client.post(
        "/api/v1/faculty/availability",
        headers=fac2_headers,
        json={"day_of_week": 5, "start_time": "10:00:00", "end_time": "12:00:00"},
    )

    slot1_id = slot1_resp.json()["id"]
    fac1_id = slot1_resp.json()["faculty_id"]
    slot2_id = slot2_resp.json()["id"]
    fac2_id = slot2_resp.json()["faculty_id"]

    client.post(
        "/api/v1/appointments/",
        headers=stu_headers,
        json={
            "slot_id": slot1_id,
            "faculty_id": fac1_id,
            "date": "2026-04-17",
            "start_time": "10:00:00",
            "end_time": "11:00:00",
        },
    )

    # Duplicate for the student with DIFFERENT faculty but overlapping time
    dup = client.post(
        "/api/v1/appointments/",
        headers=stu_headers,
        json={
            "slot_id": slot2_id,
            "faculty_id": fac2_id,
            "date": "2026-04-17",
            "start_time": "10:30:00",
            "end_time": "11:30:00",
        },
    )

    assert dup.status_code == 409
    assert "already have an appointment scheduled" in dup.json()["detail"]


def test_resolve_overlapping_appointments_on_approval(client, auth_headers):
    fac_headers = auth_headers(email="fac33@test.com", role="FACULTY")
    stu1_headers = auth_headers(email="stu1_overlap@test.com", role="STUDENT")
    stu2_headers = auth_headers(email="stu2_overlap@test.com", role="STUDENT")

    slot_resp = client.post(
        "/api/v1/faculty/availability",
        headers=fac_headers,
        json={"day_of_week": 1, "start_time": "08:00:00", "end_time": "10:00:00"},
    )
    slot_id = slot_resp.json()["id"]
    fac_id = slot_resp.json()["faculty_id"]

    # 1. Student 1 books
    app1 = client.post(
        "/api/v1/appointments/",
        headers=stu1_headers,
        json={
            "slot_id": slot_id,
            "faculty_id": fac_id,
            "date": "2026-04-20",
            "start_time": "08:00:00",
            "end_time": "09:00:00",
        },
    )

    # 2. To avoid the new "prevent double booking" intercepting the second request natively at the POST level,
    # we need to simulate the edge case where the post passed DB lock but is pending. Wait, the endpoint blocks this directly now on POST.
    # The fix applied earlier blocks faculty double bookings *if* the overlapping slots are PENDING or APPROVED.
    # Therefore, student 2 shouldn't even be able to book it, testing that:
    app2 = client.post(
        "/api/v1/appointments/",
        headers=stu2_headers,
        json={
            "slot_id": slot_id,
            "faculty_id": fac_id,
            "date": "2026-04-20",
            "start_time": "08:00:00",
            "end_time": "09:00:00",
        },
    )
    assert app2.status_code == 409

    # Let's test the faculty *approving* app1
    app1_id = app1.json()["id"]
    patch_resp = client.patch(
        f"/api/v1/appointments/{app1_id}/status",
        headers=fac_headers,
        params={"new_status": "ACCEPTED"},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "ACCEPTED"


def test_list_appointments_rbac(client, auth_headers):
    # Setup
    stu_headers = auth_headers(email="s_list_app@test.com", role="STUDENT")
    fac_headers = auth_headers(email="f_list_app@test.com", role="FACULTY")
    admin_headers = auth_headers(email="admin_list@test.com", role="ADMIN")

    # 1. Faculty creates a slot
    slot_resp = client.post(
        "/api/v1/faculty/availability",
        headers=fac_headers,
        json={"day_of_week": 2, "start_time": "09:00:00", "end_time": "10:00:00"},
    )
    slot_id = slot_resp.json()["id"]
    fac_id = slot_resp.json()["faculty_id"]

    # 2. Student books it
    client.post(
        "/api/v1/appointments/",
        headers=stu_headers,
        json={
            "slot_id": slot_id,
            "faculty_id": fac_id,
            "date": "2026-04-21",
            "start_time": "09:00:00",
            "end_time": "09:30:00",
        },
    )

    # 3. Student views THEIR appointments (should have 1)
    stu_list = client.get("/api/v1/appointments/", headers=stu_headers)
    assert stu_list.status_code == 200
    assert len(stu_list.json()) == 1

    # 4. Faculty views THEIR appointments (should have 1)
    fac_list = client.get("/api/v1/appointments/", headers=fac_headers)
    assert fac_list.status_code == 200
    assert len(fac_list.json()) == 1

    # 5. Random student should see NO appointments
    random_stu_headers = auth_headers(email="random_stu@test.com", role="STUDENT")
    r_stu_list = client.get("/api/v1/appointments/", headers=random_stu_headers)
    assert r_stu_list.status_code == 200
    assert len(r_stu_list.json()) == 0


def test_faculty_booking_appointments_fails(client, auth_headers):
    fac_headers = auth_headers(email="f_booker@test.com", role="FACULTY")
    # Faculty booking appointment should return 403. Using valid UUID to pass Pydantic schema validation (422) first.
    app_resp = client.post(
        "/api/v1/appointments/",
        headers=fac_headers,
        json={
            "slot_id": "00000000-0000-0000-0000-000000000000",
            "faculty_id": "00000000-0000-0000-0000-000000000000",
            "date": "2026-04-21",
            "start_time": "09:00:00",
            "end_time": "09:30:00",
        },
    )
    assert app_resp.status_code == 403
