from cryptography.fernet import Fernet, InvalidToken


def encrypt_secret(secret: str, encryption_key: str) -> str:
    f = Fernet(encryption_key.encode("utf-8"))
    return f.encrypt(secret.encode("utf-8")).decode("utf-8")


def decrypt_secret(secret_encrypted: str, encryption_key: str) -> str:
    f = Fernet(encryption_key.encode("utf-8"))
    try:
        return f.decrypt(secret_encrypted.encode("utf-8")).decode("utf-8")
    except InvalidToken as exc:
        raise ValueError("Invalid encrypted secret or encryption key") from exc
