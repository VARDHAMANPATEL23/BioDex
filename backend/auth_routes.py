import os
from datetime import datetime, timedelta

import bcrypt
import jwt
from database import users_collection
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

router = APIRouter()
SECRET_KEY = os.getenv(
    "SECRET_KEY", "biodex-production-jwt-security-key-2026-v1-supersecret"
)


class UserAuth(BaseModel):
    email: str
    password: str


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if len(plain_password) > 72:
        plain_password = plain_password[:72]
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def get_password_hash(password: str) -> str:
    if len(password) > 72:
        password = password[:72]
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")


@router.post("/register")
def register(user: UserAuth):
    try:
        if users_collection.find_one({"email": user.email}):
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_password = get_password_hash(user.password)
        new_user = {"email": user.email, "password": hashed_password}
        users_collection.insert_one(new_user)

        token = create_access_token({"sub": user.email})
        return {"status": "success", "token": token}
    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Database or Server Error: {str(e)}"
        )


@router.post("/login")
def login(user: UserAuth):
    try:
        db_user = users_collection.find_one({"email": user.email})
        if not db_user or not verify_password(user.password, db_user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_access_token({"sub": user.email})
        return {"status": "success", "token": token}
    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Database or Server Error: {str(e)}"
        )
