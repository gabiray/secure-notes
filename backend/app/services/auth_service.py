from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import current_app, jsonify, request, g

from app.models import User


def create_access_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(seconds=current_app.config["JWT_EXPIRES_IN_SECONDS"])

    payload = {
        "sub": str(user.id),
        "email": user.email,
        "username": user.username,
        "iat": now,
        "exp": expires_at,
    }

    token = jwt.encode(
        payload,
        current_app.config["JWT_SECRET_KEY"],
        algorithm=current_app.config["JWT_ALGORITHM"],
    )

    return token


def decode_access_token(token: str) -> dict:
    payload = jwt.decode(
        token,
        current_app.config["JWT_SECRET_KEY"],
        algorithms=[current_app.config["JWT_ALGORITHM"]],
    )
    return payload


def get_token_from_header() -> str | None:
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return None

    return auth_header.split(" ", 1)[1].strip()


def jwt_required(route_function):
    @wraps(route_function)
    def wrapper(*args, **kwargs):
        token = get_token_from_header()

        if not token:
            return jsonify({"error": "Missing or invalid Authorization header"}), 401

        try:
            payload = decode_access_token(token)
            user_id = payload.get("sub")

            if not user_id:
                return jsonify({"error": "Invalid token payload"}), 401

            user = User.query.get(int(user_id))
            if not user:
                return jsonify({"error": "User not found"}), 401

            g.current_user = user

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return route_function(*args, **kwargs)

    return wrapper
  