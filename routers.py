from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi.responses import StreamingResponse

from relatorios import gerar_relatorio_alunos

from app import (
    get_db,
    resposta,
    Aluno,
    AlunoDB,
    DisciplinaDB,
    NotaDB
)

from services import (
    calcular_media,
    verificar_status
)

from auth import verificar_token


router = APIRouter()


# -------------------- FUNÇÕES AUXILIARES ---------------------------

def montar_dados_aluno(aluno_db):
    disciplinas = []

    for disciplina in aluno_db.disciplinas:
        notas = [
            nota.valor
            for nota in disciplina.notas
        ]

        media = calcular_media(notas)

        disciplinas.append({
            "id": disciplina.id,
            "nome": disciplina.nome,
            "notas": notas,
            "media": media,
            "status": verificar_status(media)
        })

    return {
        "id": aluno_db.id,
        "nome": aluno_db.nome,
        "serie": aluno_db.serie,
        "disciplinas": disciplinas
    }


# -------------------- ROTAS ---------------------------------------


@router.get(
    "/alunos",
    tags=["Alunos"],
    summary="Listar alunos",
    description="Retorna todos os alunos cadastrados com disciplinas, notas, médias e status."
)
def listar_alunos(
    db: Session = Depends(get_db),
    usuario: str = Depends(verificar_token)
):
    alunos_db = db.query(AlunoDB).all()

    resultado = []

    for aluno in alunos_db:
        resultado.append(
            montar_dados_aluno(aluno)
        )

    return resposta(
        True,
        resultado
    )


@router.get(
    "/alunos/{id}",
    tags=["Alunos"],
    summary="Buscar aluno por ID",
    description="Consulta os dados completos de um aluno específico."
)
def buscar_aluno(
    id: int,
    db: Session = Depends(get_db),
    usuario: str = Depends(verificar_token)
):
    aluno = (
        db.query(AlunoDB)
        .filter(AlunoDB.id == id)
        .first()
    )

    if not aluno:
        return resposta(
            False,
            None,
            "Aluno não encontrado"
        )

    return resposta(
        True,
        montar_dados_aluno(aluno)
    )


@router.get(
    "/alunos/serie/{serie}/relatorio",
    tags=["Relatórios"]
)
def gerar_relatorio_serie(
    serie: str,
    db: Session = Depends(get_db),
    usuario: str = Depends(verificar_token)
):
    alunos = (
        db.query(AlunoDB)
        .filter(AlunoDB.serie == serie)
        .all()
    )

    arquivo = gerar_relatorio_alunos(
        serie,
        alunos
    )

    nome_arquivo = (
        f"relatorio_{serie.replace(' ', '_')}.docx"
    )

    return StreamingResponse(
        arquivo,
        media_type=(
            "application/"
            "vnd.openxmlformats-officedocument."
            "wordprocessingml.document"
        ),
        headers={
            "Content-Disposition":
                f'attachment; filename="{nome_arquivo}"'
        }
    )


@router.delete(
    "/alunos/{nome}",
    tags=["Alunos"],
    summary="Remover aluno",
    description="Exclui um aluno pelo nome."
)
def deletar_aluno(
    nome: str,
    db: Session = Depends(get_db),
    usuario: str = Depends(verificar_token)
):
    aluno = (
        db.query(AlunoDB)
        .filter(
            func.lower(AlunoDB.nome) == nome.lower()
        )
        .first()
    )

    if not aluno:
        return resposta(
            False,
            None,
            "Aluno não encontrado"
        )

    db.delete(aluno)
    db.commit()

    return resposta(
        True,
        f"Aluno {nome} removido com sucesso."
    )


@router.post(
    "/alunos",
    tags=["Alunos"],
    summary="Cadastrar aluno",
    description="Cria um novo aluno com disciplinas, notas, médias e status."
)
def adicionar_aluno(
    aluno: Aluno,
    db: Session = Depends(get_db),
    usuario: str = Depends(verificar_token)
):

    novo_aluno = AlunoDB(
        nome=aluno.nome,
        serie=aluno.serie
    )

    db.add(novo_aluno)
    db.commit()
    db.refresh(novo_aluno)

    for disciplina in aluno.disciplinas:

        nova_disciplina = DisciplinaDB(
            nome=disciplina.nome,
            aluno_id=novo_aluno.id
        )

        db.add(nova_disciplina)
        db.commit()
        db.refresh(nova_disciplina)

        novas_notas = []

        for nota in disciplina.notas:
            novas_notas.append(
                NotaDB(
                    valor=nota,
                    disciplina_id=nova_disciplina.id
                )
            )

        db.add_all(novas_notas)

    db.commit()

    dados = montar_dados_aluno(
        novo_aluno
    )

    return resposta(
        True,
        dados
    )


@router.put(
    "/alunos/{id}",
    tags=["Alunos"],
    summary="Atualizar aluno",
    description="Atualiza nome, série, disciplinas, notas, médias e status."
)
def atualizar_aluno(
    id: int,
    aluno: Aluno,
    db: Session = Depends(get_db),
    usuario: str = Depends(verificar_token)
):
    aluno_db = (
        db.query(AlunoDB)
        .filter(AlunoDB.id == id)
        .first()
    )

    if not aluno_db:
        return resposta(
            False,
            None,
            "Aluno não encontrado"
        )

    aluno_db.nome = aluno.nome
    aluno_db.serie = aluno.serie

    # Remove as disciplinas antigas.
    # O cascade também remove suas notas.
    aluno_db.disciplinas.clear()

    for disciplina in aluno.disciplinas:

        nova_disciplina = DisciplinaDB(
            nome=disciplina.nome,
            aluno_id=id
        )

        for nota in disciplina.notas:
            nova_disciplina.notas.append(
                NotaDB(
                    valor=nota
                )
            )

        aluno_db.disciplinas.append(
            nova_disciplina
        )

    db.commit()

    db.refresh(aluno_db)

    dados = montar_dados_aluno(
        aluno_db
    )

    return resposta(
        True,
        dados
    )