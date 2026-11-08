import httpx
import pytest

BASE_URL = "http://127.0.0.1:8000/api/v1"


def test_inquiry_submission_success():
    payload = {
        "full_name": "Valisher Fermer",
        "contact_info": "+998909876543",
        "role": "Farmer",
        "message": "We have 15,000 litres daily ready for titration.",
        "consent": True,
    }
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        resp = client.post("/inquiries", json=payload)
        assert resp.status_code == 201
        data = resp.json()
        assert data["status"] == "received"


def test_inquiry_submission_no_consent():
    payload = {
        "full_name": "Valisher Fermer",
        "contact_info": "+998909876543",
        "role": "Farmer",
        "message": "Missing consent check",
        "consent": False,
    }
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        resp = client.post("/inquiries", json=payload)
        assert resp.status_code == 422


def test_inquiry_submission_validation_error():
    payload = {
        "full_name": "",
        "contact_info": "abc",
        "role": "Farmer",
        "message": "",
        "consent": True,
    }
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        resp = client.post("/inquiries", json=payload)
        assert resp.status_code == 422
