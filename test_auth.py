import requests

try:
    print("Testing Registration...")
    res = requests.post("https://biodex-api.onrender.com/auth/register", json={"email": "test-bot@test.com", "password": "password"})
    print("Register HTTP Status:", res.status_code)
    print("Register Response Data:", res.text)
except Exception as e:
    print(e)
