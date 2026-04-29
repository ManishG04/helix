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
    resp = client.get(f"/api/v1/faculty/{fac_id}/availability", headers=stu_headers)
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


def test_upload_timetable_endpoint(client, auth_headers):
    # Setup
    fac_headers = auth_headers(email="f_uploader@test.com", role="FACULTY")
    stu_headers = auth_headers(email="s_uploader@test.com", role="STUDENT")

    # 1. Student trying to upload should fail 403
    test_pdf_content = b"%PDF-1.4 mock content"
    files = {"file": ("timetable.pdf", test_pdf_content, "application/pdf")}

    stu_resp = client.post(
        "/api/v1/faculty/timetable/upload", headers=stu_headers, files=files
    )
    assert stu_resp.status_code == 403

    # 2. Faculty uploading txt (invalid type) should fail 422
    bad_files = {"file": ("timetable.txt", test_pdf_content, "text/plain")}
    fac_bad_resp = client.post(
        "/api/v1/faculty/timetable/upload", headers=fac_headers, files=bad_files
    )
    assert fac_bad_resp.status_code == 422
    assert "Invalid file type" in fac_bad_resp.json()["detail"]

    # 3. Faculty uploading valid PDF should succeed 202
    # Because httpx handles multipart when the `files` dict is passed, we need a fresh stream:
    good_files = {
        "file": ("timetable.pdf", b"%PDF-1.4 valid content", "application/pdf")
    }
    fac_good_resp = client.post(
        "/api/v1/faculty/timetable/upload", headers=fac_headers, files=good_files
    )
    assert fac_good_resp.status_code == 202
    assert "AWS S3" in fac_good_resp.json()["message"]
    assert "job_id" in fac_good_resp.json()


def test_availability_bulk_and_delete(client, auth_headers):
    # Setup
    fac_headers = auth_headers(email="f_bulk@test.com", role="FACULTY")

    # 1. Bulk insert
    bulk_resp = client.post(
        "/api/v1/faculty/availability/bulk",
        headers=fac_headers,
        json=[
            {"day_of_week": 1, "start_time": "10:00:00", "end_time": "11:00:00"},
            {"day_of_week": 2, "start_time": "14:00:00", "end_time": "15:00:00"},
        ],
    )
    assert bulk_resp.status_code == 200
    added_slots = bulk_resp.json()
    assert len(added_slots) == 2

    # Check they actually exist
    check_resp = client.get("/api/v1/faculty/availability", headers=fac_headers)
    assert len(check_resp.json()) >= 2

    # 2. Delete one slot
    slot_id_to_delete = added_slots[0]["id"]
    del_resp = client.delete(
        f"/api/v1/faculty/availability/{slot_id_to_delete}", headers=fac_headers
    )
    assert del_resp.status_code == 204

    # Check it's gone
    check2_resp = client.get("/api/v1/faculty/availability", headers=fac_headers)
    # Filter JSON for the deleted ID
    slot_exists = any(slot["id"] == slot_id_to_delete for slot in check2_resp.json())
    assert not slot_exists
