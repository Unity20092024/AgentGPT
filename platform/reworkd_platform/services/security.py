from typing import Union

import cryptography.fernet as fernet
from cryptography.hazmat.primitives import hmac
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

from reworkd_platform.settings import settings
from reworkd_platform.web.api.http_responses import forbidden

class EncryptionService:
    def __init__(self, secret: bytes):
        self.key = self._derive_key(secret)

    def _derive_key(self, password: bytes) -> bytes:
        kdf = PBKDF2HMAC(
            algorithm=hmac.algorithms.SHA256(),
            length=32,
            salt=settings.secret_signing_key.encode(),
            iterations=100000,
            backend=default_backend()
        )
        return kdf.derive(password)

    def encrypt(self, text: str) -> bytes:
        nonce = self._generate_nonce()
        cipher = Cipher(algorithms.AES(self.key), modes.CTR(nonce), backend=default_backend())
        encryptor = cipher.encryptor()
        encrypted_data = encryptor.update(text.encode("utf-8")) + encryptor.finalize()
        return nonce + encrypted_data

    def decrypt(self, encrypted_data: Union[bytes, str]) -> str:
        if isinstance(encrypted_data, str):
            encrypted_data = encrypted_data.encode()
        nonce = encrypted_data[:16]
        encrypted_text = encrypted_data[16:]
        cipher = Cipher(algorithms.AES(self.key), modes.CTR(nonce), backend=default_backend())
        decryptor = cipher.decryptor()
        decrypted_data = decryptor.update(encrypted_text) + decryptor.finalize()
        return decrypted_data.decode("utf-8")

    def _generate_nonce(self) -> bytes:
        return secrets.token_bytes(16)

encryption_service = EncryptionService(settings.secret_signing_key.encode())

