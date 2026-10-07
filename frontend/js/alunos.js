async function carregarAlunos() {
    const resposta = await listarAlunos();

    if (!resposta.success) {
        throw new Error(resposta.error || "Erro ao carregar alunos.");
    }

    return resposta.data;
}


// ============================================================
// LISTAGEM
// ============================================================

function renderizarAlunos(alunos) {

    if (alunos.length === 0) {
        return `
            <div class="empty-state">
                <h3>Nenhum aluno cadastrado</h3>
                <p>Cadastre um aluno para começar.</p>
            </div>
        `;
    }

    const alunosPorSerie = {};

    alunos.forEach(aluno => {
        if (!alunosPorSerie[aluno.serie]) {
            alunosPorSerie[aluno.serie] = [];
        }

        alunosPorSerie[aluno.serie].push(aluno);
    });

    return `
        <div class="series-container">
            ${Object.entries(alunosPorSerie).map(([serie, alunosSerie]) => `
                <div class="serie-card" data-serie="${serie}">
                    <h3>${serie}</h3>
                    <p>
                        ${alunosSerie.length}
                        ${alunosSerie.length === 1 ? "aluno" : "alunos"}
                    </p>
                </div>
            `).join("")}
        </div>
    `;
}


function renderizarTabelaAlunos(alunos) {

    if (alunos.length === 0) {
        return `
            <div class="empty-state">
                <h3>Nenhum aluno nesta série</h3>
            </div>
        `;
    }

    return `
        <div class="alunos-table-container">

            <table class="alunos-table">

                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Disciplinas</th>
                        <th>Ações</th>
                    </tr>
                </thead>

                <tbody>

                    ${alunos.map(aluno => `

                        <tr>

                            <td>${aluno.nome}</td>

                            <td>
                                ${aluno.disciplinas
                                    .map(disciplina => disciplina.nome)
                                    .join(", ")}
                            </td>

                            <td>

                                <button
                                    class="btn-ver"
                                    data-id="${aluno.id}"
                                >
                                    Ver
                                </button>

                                <button
                                    class="btn-editar"
                                    data-id="${aluno.id}"
                                >
                                    Editar
                                </button>

                                <button
                                    class="btn-excluir"
                                    data-id="${aluno.id}"
                                >
                                    Excluir
                                </button>

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>
    `;
}


// ============================================================
// DETALHES
// ============================================================

function renderizarDetalhesAluno(aluno) {

    return `
        <div class="aluno-detalhes">

            <div class="detalhes-header">

                <div>
                    <h3>${aluno.nome}</h3>
                    <p>${aluno.serie}</p>
                </div>

            </div>

            <div class="disciplinas-detalhes">

                <h4>Disciplinas</h4>

                ${aluno.disciplinas.map(disciplina => `

                    <div class="disciplina-detalhe">

                        <div class="disciplina-detalhe-header">

                            <strong>
                                ${disciplina.nome}
                            </strong>

                            <span class="status-badge ${
                                disciplina.status === "Aprovado"
                                    ? "status-aprovado"
                                    : "status-reprovado"
                            }">
                                ${disciplina.status}
                            </span>

                        </div>

                        <p>
                            Notas:
                            ${disciplina.notas.join(", ")}
                        </p>

                        <p>
                            Média:
                            <strong>${disciplina.media}</strong>
                        </p>

                    </div>

                `).join("")}

            </div>

            <div class="detalhes-acoes">
                <button class="btn-voltar">
                    Voltar
                </button>
            </div>

        </div>
    `;
}


// ============================================================
// DISCIPLINA
// ============================================================

function criarFormularioDisciplina(disciplina = null) {

    const nome =
        disciplina ? disciplina.nome : "";

    const notas =
        disciplina && disciplina.notas.length
            ? disciplina.notas
            : [""];


    return `
        <div class="disciplina-form">

            <div class="disciplina-header">

                <label>Disciplina</label>

                <button
                    type="button"
                    class="btn-remover-disciplina"
                >
                    Remover disciplina
                </button>

            </div>

            <input
                type="text"
                class="nome-disciplina"
                placeholder="Ex: Português"
                value="${nome}"
            >

            <div class="notas-container">

                <label>Notas</label>

                <div class="notas-lista">

                    ${notas.map(nota => `

                        <div class="nota-item">

                            <input
                                type="number"
                                class="nota-disciplina"
                                min="0"
                                max="10"
                                step="0.01"
                                placeholder="Nota"
                                value="${nota}"
                            >

                            <button
                                type="button"
                                class="btn-remover-nota"
                            >
                                Remover
                            </button>

                        </div>

                    `).join("")}

                </div>

                <button
                    type="button"
                    class="btn-adicionar-nota"
                >
                    + Adicionar nota
                </button>

                <p class="nota-ajuda">
                    Use ponto (.) para separar as casas decimais. Ex.:7.5
                </p>

            </div>

        </div>
    `;
}


// ============================================================
// CADASTRO
// ============================================================

function renderizarFormularioAluno() {

    return `
        <div class="aluno-form">

            <div>
                <label for="nomeAluno">Nome</label>

                <input
                    type="text"
                    id="nomeAluno"
                    placeholder="Nome do aluno"
                >
            </div>

            <div>
                <label for="serieAluno">Série</label>

                <input
                    type="text"
                    id="serieAluno"
                    placeholder="Ex: 4º ano"
                >
            </div>

            <div>

                <label>Disciplinas</label>

                <div id="disciplinasAluno">

                    ${criarFormularioDisciplina()}

                </div>

                <button
                    type="button"
                    class="btn-adicionar-disciplina"
                >
                    + Adicionar disciplina
                </button>

            </div>

            <button class="btn-cadastrar">
                Cadastrar aluno
            </button>

        </div>
    `;
}


// ============================================================
// COLETAR DADOS DO CADASTRO
// ============================================================

function obterDadosFormularioAluno() {

    const nome =
        document.getElementById("nomeAluno").value.trim();

    const serie =
        document.getElementById("serieAluno").value.trim();

    const blocos =
        document.querySelectorAll(
            "#disciplinasAluno .disciplina-form"
        );

    const disciplinas = [];


    blocos.forEach(bloco => {

        const nomeDisciplina =
            bloco
                .querySelector(".nome-disciplina")
                .value
                .trim();


        const campos =
            bloco.querySelectorAll(
                "input.nota-disciplina"
            );


        const notas = [];


        campos.forEach(campo => {

            if (campo.value !== "") {

                const nota =
                    campo.valueAsNumber;

                if (!Number.isNaN(nota)) {
                    notas.push(nota);
                }
            }

        });


        disciplinas.push({
            nome: nomeDisciplina,
            notas: notas
        });

    });


    return {
        nome,
        serie,
        disciplinas
    };
}


// ============================================================
// EDIÇÃO
// ============================================================

function renderizarFormularioEdicao(aluno) {

    return `
        <div class="aluno-form">

            <div>

                <label for="nomeEdicao">
                    Nome
                </label>

                <input
                    type="text"
                    id="nomeEdicao"
                    value="${aluno.nome}"
                >

            </div>

            <div>

                <label for="serieEdicao">
                    Série
                </label>

                <input
                    type="text"
                    id="serieEdicao"
                    value="${aluno.serie}"
                    placeholder="Ex: 4º ano"
                >

            </div>

            <div>

                <label>Disciplinas</label>

                <div id="disciplinasEdicao">

                    ${aluno.disciplinas
                        .map(criarFormularioDisciplina)
                        .join("")}

                </div>

                <button
                    type="button"
                    class="btn-adicionar-disciplina"
                >
                    + Adicionar disciplina
                </button>

            </div>

            <div class="detalhes-acoes">

                <button class="btn-salvar-edicao">
                    Salvar alterações
                </button>

                <button class="btn-cancelar-edicao">
                    Cancelar
                </button>

            </div>

        </div>
    `;
}


// ============================================================
// COLETAR DADOS DA EDIÇÃO
// ============================================================

function obterDadosFormularioEdicao() {

    const nome =
        document.getElementById("nomeEdicao").value.trim();

    const serie =
        document.getElementById("serieEdicao").value.trim();

    const blocos =
        document.querySelectorAll(
            "#disciplinasEdicao .disciplina-form"
        );

    const disciplinas = [];


    blocos.forEach(bloco => {

        const nomeDisciplina =
            bloco
                .querySelector(".nome-disciplina")
                .value
                .trim();


        const campos =
            bloco.querySelectorAll(
                "input.nota-disciplina"
            );


        const notas = [];


        campos.forEach(campo => {

            if (campo.value !== "") {

                const nota =
                    campo.valueAsNumber;

                if (!Number.isNaN(nota)) {
                    notas.push(nota);
                }

            }

        });


        disciplinas.push({
            nome: nomeDisciplina,
            notas: notas
        });

    });


    return {
        nome,
        serie,
        disciplinas
    };
}