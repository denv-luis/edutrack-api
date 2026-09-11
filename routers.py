from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import get_db, resposta, Aluno, AlunoDB, NotaDB
from services import calcular_media, verificar_status

router = APIRouter()

# -------------------- ROTAS ---------------------------------------
@router.get(
    "/alunos",
    tags=["Alunos"],
    summary="Listar alunos",
    description="Retorna todos os alunos cadastrados com notas e média."
    )
def listar_alunos(db: Session = Depends(get_db)):
    alunos_db = db.query(AlunoDB).all()

    resultado = []
    for aluno in alunos_db:
        resultado.append({
            "id": aluno.id,
            "nome": aluno.nome,
            "media": round(aluno.media, 2),
            "notas": [nota.valor for nota in aluno.notas],
            "status": verificar_status(aluno.media)
        })

    return resposta(True, resultado)

@router.get(
    "/alunos/{id}",
    tags=["Alunos"],
    summary="Buscar aluno por ID",
    description="Consulta os dados completos de um aluno específico."
    )
def buscar_aluno(id: int, db: Session = Depends(get_db)):
    aluno = db.query(AlunoDB).filter(AlunoDB.id == id).first()

    if not aluno:
        return resposta(False, None, "Aluno não encontrado")

    status = verificar_status(aluno.media)

    dados = {
        "id": aluno.id,
        "nome": aluno.nome,
        "media": round(aluno.media, 2),
        "notas": [nota.valor for nota in aluno.notas],
        "status": status
    }

    return resposta(True, dados)

@router.delete(
    "/alunos/{nome}",
    tags=["Alunos"],
    summary="Remover aluno",
    description="Exclui um aluno pelo nome."
    )
def deletar_aluno(nome: str, db: Session = Depends(get_db)):
    aluno = db.query(AlunoDB).filter(
        func.lower(AlunoDB.nome) == nome.lower()
    ).first()

    if not aluno:
        return resposta(False, None, "Aluno não encontrado")

    db.delete(aluno)
    db.commit()

    return resposta(True, f"Aluno {nome} removido com sucesso.")

@router.post(
    "/alunos",
    tags=["Alunos"],
    summary="Cadastrar aluno",
    description="Cria um novo aluno com notas, média e status."
    )
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

    dados = {
        "id": novo_aluno.id,
        "nome": novo_aluno.nome,
        "notas": aluno.notas,
        "media": media,
        "status": status
    }

    return resposta(True, dados)

@router.put(
    "/alunos/{id}",
    tags=["Alunos"],
    summary="Atualizar aluno",
    description="Atualiza nome, notas, média e status de um aluno existente."
    )
def atualizar_aluno(id: int, aluno: Aluno, db: Session = Depends(get_db)):
    aluno_db = db.query(AlunoDB).filter(AlunoDB.id == id).first()

    if not aluno_db:
        return resposta(False, None, "Aluno não encontrado")

    media = calcular_media(aluno.notas)
    status = verificar_status(media)

    aluno_db.nome = aluno.nome
    aluno_db.media = media

    db.query(NotaDB).filter(NotaDB.aluno_id == id).delete()

    novas_notas = []
    for nota in aluno.notas:
        novas_notas.append(
            NotaDB(
                valor=nota,
                aluno_id=id
            )
        )

    db.add_all(novas_notas)
    db.commit()

    dados = {
        "id": id,
        "nome": aluno.nome,
        "notas": aluno.notas,
        "media": media,
        "status": status
    }

    return resposta(True, dados)