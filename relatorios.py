from io import BytesIO

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.shared import Pt


def gerar_relatorio_alunos(serie, alunos):
    documento = Document()

    titulo = documento.add_paragraph()
    titulo.alignment = WD_ALIGN_PARAGRAPH.CENTER

    run = titulo.add_run("EduTrack")
    run.bold = True
    run.font.size = Pt(20)

    subtitulo = documento.add_paragraph()
    subtitulo.alignment = WD_ALIGN_PARAGRAPH.CENTER

    run = subtitulo.add_run("Relatório de Alunos")
    run.bold = True
    run.font.size = Pt(14)

    paragrafo_serie = documento.add_paragraph()
    run = paragrafo_serie.add_run(f"Série: {serie}")
    run.bold = True

    tabela = documento.add_table(rows=1, cols=5)

    tabela.alignment = WD_TABLE_ALIGNMENT.CENTER
    tabela.style = "Table Grid"

    cabecalho = tabela.rows[0].cells

    cabecalho[0].text = "Nome"
    cabecalho[1].text = "Disciplina"
    cabecalho[2].text = "Notas"
    cabecalho[3].text = "Média"
    cabecalho[4].text = "Status"

    for aluno in alunos:
        for disciplina in aluno.disciplinas:
            linha = tabela.add_row().cells

            linha[0].text = aluno.nome
            linha[1].text = disciplina.nome

            linha[2].text = ", ".join(
                str(nota.valor)
                for nota in disciplina.notas
            )

            media = sum(
                nota.valor
                for nota in disciplina.notas
            ) / len(disciplina.notas)

            linha[3].text = str(round(media, 2))

            if media >= 5:
                linha[4].text = "Aprovado"
            else:
                linha[4].text = "Reprovado"

    arquivo = BytesIO()

    documento.save(arquivo)

    arquivo.seek(0)

    return arquivo