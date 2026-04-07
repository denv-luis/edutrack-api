from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel, conlist, confloat
from sqlalchemy import create_engine, Column, Integer, String, Float, func, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, Session, relationship
import os

# --------------------- BANCO DE DADOS -------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{BASE_DIR}/alunos.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# -------------------- APP ------------------------------------------


app = FastAPI()

# ------------------- MODELO DA API --------------------------------

class Aluno(BaseModel):
    nome: str
    notas: conlist(confloat(ge=0, le=10), min_length=1, max_length=10)

# ------------------ MODELO DO BANCO -------------------------------

class AlunoDB(Base):
    __tablename__ = "alunos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    media = Column(Float)
    notas = relationship("NotaDB", backref="aluno")

class NotaDB(Base):
    __tablename__ = "notas"
    id = Column(Integer, primary_key=True, index=True)
    valor = Column(Float)
    aluno_id = Column(Integer, ForeignKey("alunos.id"))

# ----------------- CRIAR TABELA NO BANCO --------------------------

Base.metadata.create_all(bind=engine)

# ------------------ LÓGICA ---------------------------------------

def calcular_media(notas):
    return sum(notas) / len(notas)

def verificar_status(media):
    return "Aprovado" if media >= 5 else "Reprovado"
    
# -------------------- DEPENDENCY ----------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------- ROTAS ---------------------------------------

@app.post("/alunos")
def adicionar_aluno(aluno: Aluno, db: Session = Depends(get_db)):
    media = calcular_media(aluno.notas)
    status = verificar_status(media)

    novo_aluno = AlunoDB(
        nome=aluno.nome,
        media=media
    )
    db.add(novo_aluno)
    db.commit()
    db.refresh(novo_aluno)

    #salvar notas
    notas_db = []
    for nota in aluno.notas:
        notas_db.append(
            NotaDB(
                valor=nota,
                aluno_id=novo_aluno.id
            )
        )
        db.add_all(notas_db)
        db.commit()

    return{
        "mensagem": "Aluno e notas salvos",
        "aluno": {
            "id": novo_aluno.id,
            "nome": aluno.nome,
            "notas": aluno.notas,
            "media": media,
            "status": status
        }
    }

@app.get("/alunos")
def listar_alunos(db: Session = Depends(get_db)):
    
    alunos_db = db.query(AlunoDB).all()

    resultado = []
    for aluno in alunos_db:
        resultado.append({
            "id": aluno.id,
            "nome": aluno.nome,
            "media": aluno.media,
            "notas": [nota.valor for nota in aluno.notas]
        })
    return resultado
    
@app.delete("/alunos/{nome}")
def deletar_aluno(nome: str, db: Session = Depends(get_db)):

    aluno = db.query(AlunoDB).filter(func.lower(AlunoDB.nome) == nome.lower()).first()

    if not aluno:
        db.close()
        return {"erro": "Aluno não encontrado"}
    
    db.delete(aluno)
    db.commit()

    return {"mensagem": f"Aluno {nome} removido com sucesso."}

@app.get("/alunos/{id}")
def buscar_aluno(id: int, db: Session = Depends(get_db)):
    aluno = db.query(AlunoDB).filter(AlunoDB.id == id).first()

    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    return {
        "id": aluno.id,
        "nome": aluno.nome,
        "media": aluno.media
    }