from flask import Flask, jsonify

from app.config import Config
from app.extensions import db, cors
from app.routes.auth import auth_bp
from app.routes.notes import notes_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    cors.init_app(
        app,
        resources={r"/*": {"origins": [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "https://secure-notes-1-562b.onrender.com",
        ]}},
        supports_credentials=False,
        allow_headers=["Content-Type", "Authorization"],
    )

    app.register_blueprint(auth_bp)
    app.register_blueprint(notes_bp)

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200

    with app.app_context():
        db.create_all()

    return app
