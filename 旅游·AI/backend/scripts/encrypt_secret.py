import argparse

from cryptography.fernet import Fernet

from app.core.secrets import encrypt_secret


def main() -> None:
    parser = argparse.ArgumentParser(description="Encrypt API secret for backend .env")
    parser.add_argument("--secret", required=True, help="Plain API key")
    parser.add_argument("--key", required=False, help="Existing Fernet key")
    args = parser.parse_args()

    encryption_key = args.key or Fernet.generate_key().decode("utf-8")
    encrypted = encrypt_secret(args.secret, encryption_key)

    print("APP_ENCRYPTION_KEY=" + encryption_key)
    print("GEMINI_API_KEY_ENCRYPTED=" + encrypted)


if __name__ == "__main__":
    main()
