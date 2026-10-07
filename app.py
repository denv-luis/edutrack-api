from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, conlist, confloat, Field
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, Session, relationship
from fastapi.middleware.cors import CORSMiddleware
import os

# --------------------- BANCO DE DADOS -------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{BASE_DIR}/alunos.db"
)

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+psycopg://",
        1
    )

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


# -------------------- APP ------------------------------------------

app = FastAPI(
    title="EduTrack API",
    description="Backend desenvolvido em Python com FastAPI para gerenciamento de alunos, cálculo de médias, CRUD completo e arquitetura escalável. ",
    version="1.0.0"
)

app.mount(
    "/css",
    StaticFiles(directory="frontend/css"),
    name="css"
)

app.mount(
    "/js",
    StaticFiles(directory="frontend/js"),
    name="js"
)


@app.get("/")
def inicio():
    return FileResponse("frontend/index.html")


# ------------------- MODELOS DA API -------------------------------

class Nota(BaseModel):
    valor: confloat(
        ge=0,
        le=10
    )


class Disciplina(BaseModel):
    nome: str = Field(
        ...,
        example="Português",
        description="Nome da disciplina"
    )

    notas: conlist(
        confloat(ge=0, le=10),
        min_length=1,
        max_length=10
    ) = Field(
        ...,
        example=[7.5, 8.0, 9.2],
        description="Lista de notas da disciplina"
    )


class Aluno(BaseModel):
    nome: str = Field(
        ...,
        example="Sávio Cambui",
        description="Nome do aluno"
    )

    serie: str = Field(
        ...,
        example="4º ano",
        description="Serie escolar do aluno"
    )

    disciplinas: conlist(
        Disciplina,
        min_length=1
    ) = Field(
        ...,
        description="Disciplinas e respectivas notas do aluno"
    )


# ------------------ MODELOS DO BANCO ------------------------------

class AlunoDB(Base):
    __tablename__ = "alunos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nome = Column(
        String,
        index=True
    )

    serie = Column(
        String
    )

    disciplinas = relationship(
        "DisciplinaDB",
        backref="aluno",
        cascade="all, delete-orphan"
    )


class DisciplinaDB(Base):
    __tablename__ = "disciplinas"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nome = Column(
        String
    )

    aluno_id = Column(
        Integer,
        ForeignKey("alunos.id")
    )

    notas = relationship(
        "NotaDB",
        backref="disciplina",
        cascade="all, delete-orphan"
    )


class NotaDB(Base):
    __tablename__ = "notas"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    valor = Column(
        Float
    )

    disciplina_id = Column(
        Integer,
        ForeignKey("disciplinas.id")
    )


# ----------------- CRIAR TABELAS NO BANCO ------------------------

Base.metadata.create_all(
    bind=engine
)


# -------------------- DEPENDENCY ----------------------------------

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def resposta(
    success: bool,
    data=None,
    error=None
):
    return {
        "success": success,
        "data": data,
        "error": error
    }


# -------------------- ROUTERS -------------------------------------

from routers import router
from auth import router as auth_router

app.include_router(router)
app.include_router(auth_router)