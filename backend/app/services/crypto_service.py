import os
import base64
import hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def generate_aes_key() -> bytes:
    key = os.getenv("NOTES_AES_KEY")
    if not key:
        raise ValueError("NOTES_AES_KEY is missing from environment")

    key_bytes = key.encode("utf-8")
    return hashlib.sha256(key_bytes).digest()


def encrypt_text(plain_text: str) -> tuple[str, str]:
    key = generate_aes_key()
    aesgcm = AESGCM(key)

    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, plain_text.encode("utf-8"), None)

    return (
        base64.b64encode(ciphertext).decode("utf-8"),
        base64.b64encode(nonce).decode("utf-8"),
    )


def decrypt_text(ciphertext_b64: str, nonce_b64: str) -> str:
    key = generate_aes_key()
    aesgcm = AESGCM(key)

    ciphertext = base64.b64decode(ciphertext_b64)
    nonce = base64.b64decode(nonce_b64)

    plain_text = aesgcm.decrypt(nonce, ciphertext, None)
    return plain_text.decode("utf-8")


def compute_note_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()
  