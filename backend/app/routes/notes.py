import bcrypt
from flask import Blueprint, request, jsonify, g

from app.extensions import db
from app.models import Note
from app.services.auth_service import jwt_required
from app.services.crypto_service import encrypt_text, decrypt_text, compute_note_hash

notes_bp = Blueprint("notes", __name__, url_prefix="/notes")


def get_user_note(note_id):
    return Note.query.filter_by(id=note_id, user_id=g.current_user.id).first()


def build_note_response(note, content=None, locked=False):
    response = {
        "id": note.id,
        "title": note.title,
        "is_password_protected": note.is_password_protected,
        "locked": locked,
        "created_at": note.created_at.isoformat(),
        "updated_at": note.updated_at.isoformat(),
    }

    if content is not None:
        response["content"] = content
        response["integrity_ok"] = compute_note_hash(content) == note.note_hash

    return response


def make_preview(content, limit=140):
    clean = " ".join(content.strip().split())
    if len(clean) <= limit:
        return clean
    return clean[:limit].rstrip() + "..."


@notes_bp.route("/", methods=["GET"])
@jwt_required
def get_notes():
    notes = (
        Note.query
        .filter_by(user_id=g.current_user.id)
        .order_by(Note.created_at.desc())
        .all()
    )

    result = [
        {
            "id": note.id,
            "title": note.title,
            "is_password_protected": note.is_password_protected,
            "content_preview": None if note.is_password_protected else note.content_preview,
            "created_at": note.created_at.isoformat(),
            "updated_at": note.updated_at.isoformat(),
        }
        for note in notes
    ]

    return jsonify(result), 200


@notes_bp.route("/", methods=["POST"])
@jwt_required
def create_note():
    data = request.get_json() or {}

    title = data.get("title", "").strip()
    content = data.get("content", "")
    note_password = data.get("note_password", "").strip()

    if not title or not content:
        return jsonify({"error": "title and content are required"}), 400

    ciphertext, nonce = encrypt_text(content)
    note_hash = compute_note_hash(content)

    is_password_protected = bool(note_password)
    note_password_hash = None
    preview = None

    if is_password_protected:
        note_password_hash = bcrypt.hashpw(
            note_password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")
    else:
        preview = make_preview(content)

    note = Note(
        title=title,
        ciphertext=ciphertext,
        nonce=nonce,
        note_hash=note_hash,
        content_preview=preview,
        user_id=g.current_user.id,
        is_password_protected=is_password_protected,
        note_password_hash=note_password_hash,
    )

    db.session.add(note)
    db.session.commit()

    return jsonify({
        "message": "Note created successfully",
        "id": note.id
    }), 201


@notes_bp.route("/<int:note_id>", methods=["GET"])
@jwt_required
def get_note(note_id):
    note = get_user_note(note_id)

    if not note:
        return jsonify({"error": "Note not found"}), 404

    if note.is_password_protected:
        return jsonify(build_note_response(note, locked=True)), 200

    content = decrypt_text(note.ciphertext, note.nonce)
    return jsonify(build_note_response(note, content=content, locked=False)), 200


@notes_bp.route("/<int:note_id>", methods=["PUT"])
@jwt_required
def update_note(note_id):
    note = get_user_note(note_id)

    if not note:
        return jsonify({"error": "Note not found"}), 404

    data = request.get_json() or {}

    raw_title = data.get("title")
    raw_content = data.get("content")

    if raw_title is None or raw_content is None:
        return jsonify({"error": "title and content are required"}), 400

    title = raw_title.strip()
    content = raw_content

    if not title or not content:
        return jsonify({"error": "title and content cannot be empty"}), 400

    ciphertext, nonce = encrypt_text(content)
    note_hash = compute_note_hash(content)
    preview = None if note.is_password_protected else make_preview(content)

    note.title = title
    note.ciphertext = ciphertext
    note.nonce = nonce
    note.note_hash = note_hash
    note.content_preview = preview

    db.session.commit()

    return jsonify({"message": "Note updated successfully"}), 200


@notes_bp.route("/<int:note_id>/unlock", methods=["POST"])
@jwt_required
def unlock_note(note_id):
    note = get_user_note(note_id)

    if not note:
        return jsonify({"error": "Note not found"}), 404

    if not note.is_password_protected:
        content = decrypt_text(note.ciphertext, note.nonce)
        return jsonify(build_note_response(note, content=content, locked=False)), 200

    data = request.get_json() or {}
    password = data.get("password", "")

    if not password:
        return jsonify({"error": "Password is required"}), 400

    if not note.note_password_hash:
        return jsonify({"error": "Password protection is misconfigured"}), 500

    if not bcrypt.checkpw(
        password.encode("utf-8"),
        note.note_password_hash.encode("utf-8")
    ):
        return jsonify({"error": "Invalid note password"}), 401

    content = decrypt_text(note.ciphertext, note.nonce)
    return jsonify(build_note_response(note, content=content, locked=False)), 200


@notes_bp.route("/<int:note_id>/set-password", methods=["POST"])
@jwt_required
def set_note_password(note_id):
    note = get_user_note(note_id)

    if not note:
        return jsonify({"error": "Note not found"}), 404

    data = request.get_json() or {}
    password = data.get("password", "").strip()

    if not password:
        return jsonify({"error": "Password is required"}), 400

    note.is_password_protected = True
    note.note_password_hash = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")
    note.content_preview = None

    db.session.commit()

    return jsonify({"message": "Note password set successfully"}), 200


@notes_bp.route("/<int:note_id>/remove-password", methods=["POST"])
@jwt_required
def remove_note_password(note_id):
    note = get_user_note(note_id)

    if not note:
        return jsonify({"error": "Note not found"}), 404

    data = request.get_json() or {}
    password = data.get("password", "")

    if not note.is_password_protected:
        return jsonify({"error": "Note is not password protected"}), 400

    if not password:
        return jsonify({"error": "Password is required"}), 400

    if not bcrypt.checkpw(
        password.encode("utf-8"),
        note.note_password_hash.encode("utf-8")
    ):
        return jsonify({"error": "Invalid note password"}), 401

    note.is_password_protected = False
    note.note_password_hash = None

    content = decrypt_text(note.ciphertext, note.nonce)
    note.content_preview = make_preview(content)

    db.session.commit()

    return jsonify({"message": "Note password removed successfully"}), 200


@notes_bp.route("/<int:note_id>", methods=["DELETE"])
@jwt_required
def delete_note(note_id):
    note = get_user_note(note_id)

    if not note:
        return jsonify({"error": "Note not found"}), 404

    db.session.delete(note)
    db.session.commit()

    return jsonify({"message": "Note deleted successfully"}), 200


@notes_bp.route("/me", methods=["GET"])
@jwt_required
def get_current_user():
    return jsonify({
        "id": g.current_user.id,
        "username": g.current_user.username,
        "email": g.current_user.email,
    }), 200
    