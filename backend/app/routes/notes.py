from flask import Blueprint, request, jsonify, g

from app.extensions import db
from app.models import Note
from app.services.auth_service import jwt_required
from app.services.crypto_service import encrypt_text, decrypt_text, compute_note_hash

notes_bp = Blueprint("notes", __name__, url_prefix="/notes")


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

    if not title or not content:
        return jsonify({"error": "title and content are required"}), 400

    ciphertext, nonce = encrypt_text(content)
    note_hash = compute_note_hash(content)

    note = Note(
        title=title,
        ciphertext=ciphertext,
        nonce=nonce,
        note_hash=note_hash,
        user_id=g.current_user.id,
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
    note = Note.query.filter_by(id=note_id, user_id=g.current_user.id).first()

    if not note:
        return jsonify({"error": "Note not found"}), 404

    content = decrypt_text(note.ciphertext, note.nonce)
    current_hash = compute_note_hash(content)

    return jsonify({
        "id": note.id,
        "title": note.title,
        "content": content,
        "integrity_ok": current_hash == note.note_hash,
        "created_at": note.created_at.isoformat(),
        "updated_at": note.updated_at.isoformat(),
    }), 200


@notes_bp.route("/<int:note_id>", methods=["PUT"])
@jwt_required
def update_note(note_id):
    note = Note.query.filter_by(id=note_id, user_id=g.current_user.id).first()

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

    note.title = title
    note.ciphertext = ciphertext
    note.nonce = nonce
    note.note_hash = note_hash

    db.session.commit()

    return jsonify({"message": "Note updated successfully"}), 200


@notes_bp.route("/<int:note_id>", methods=["DELETE"])
@jwt_required
def delete_note(note_id):
    note = Note.query.filter_by(id=note_id, user_id=g.current_user.id).first()

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
    