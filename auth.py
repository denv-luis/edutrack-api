import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends
from pydantic import BaseModel


router = APIRouter()

security = HTTPBearer()

SECRET_KEY = os.getenv("EDUTRACK_SECRET_KEY")
USUARIO = os.getenv("EDUTRACK_USER", "Laisa")
SENHA = os.getenv("EDUTRACK_PASSWORD")

ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 8


class LoginRequest(BaseModel):
    usuario: str
    senha: str


def criar_token(usuario: str):
    expiracao = datetime.now(timezone.utc) + timedelta(
        hours=TOKEN_EXPIRE_HOURS
    )

    payload = {
        "sub": usuario,
        "exp": expiracao
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


@router.post("/login", tags=["Autenticação"])
def login(dados: LoginRequest):

    if not SECRET_KEY or not SENHA:
        raise HTTPException(
            status_code=500,
            detail="Configuração de autenticação não definida."
        )

    if dados.usuario != USUARIO or dados.senha != SENHA:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha inválidos."
        )

    token = criar_token(dados.usuario)

    return {
        "success": True,
        "data": {
            "access_token": token,
            "token_type": "bearer"
        },
        "error": None
    }


def verificar_token(
    credenciais: HTTPAuthorizationCredentials = Depends(security)
):
    if not SECRET_KEY:
        raise HTTPException(
            status_code=500,
            detail="Configuração de autenticação não definida."
        )

    try:
        payload = jwt.decode(
            credenciais.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        usuario = payload.get("sub")

        if usuario != USUARIO:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido."
            )

        return usuario

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado."
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido."
        )