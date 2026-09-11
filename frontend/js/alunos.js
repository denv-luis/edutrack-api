async function carregarAlunos() {
    const resposta = await listarAlunos();

    if (!resposta.success) {
        throw new Error(resposta.error || "Erro ao carregar alunos.");
    }

    return resposta.data;
}

function renderizarAlunos(alunos) {
    if (alunos.length === 0) {
        return `
            <div class="empty-state">
                <h3>Nenhum aluno cadastrado</h3>
                <p>Cadastre um aluno para começar.</p>
            </div>
        `;
    }

    return `
        <div class="alunos-table-container">
            <table class="alunos-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Notas</th>
                        <th>Média</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>

                <tbody>
                    ${alunos.map(aluno => `
                        <tr>
                            <td>${aluno.nome}</td>
                            <td>${aluno.notas.join(", ")}</td>
                            <td>${aluno.media}</td>
                            <td>
                                <span class="status-badge ${aluno.status === "Aprovado" ? "status-aprovado" : "status-reprovado"}">
                                    ${aluno.status}
                                </span>
                            </td>
                            <td>
                                <button class="btn-ver" data-id="${aluno.id}">
                                    Ver
                                </button>

                                <button class="btn-editar" data-id="${aluno.id}">
                                    Editar
                                </button>

                                <button class="btn-excluir" data-id="${aluno.id}">
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

function renderizarDetalhesAluno(aluno) {
    return `
        <div class="aluno-detalhes">

            <div class="detalhes-header">
                <h3>${aluno.nome}</h3>

                <span class="status-badge ${aluno.status === "Aprovado" ? "status-aprovado" : "status-reprovado"}">
                    ${aluno.status}
                </span>
            </div>

            <div class="detalhes-info">
                <div>
                    <span>Média</span>
                    <strong>${aluno.media}</strong>
                </div>

                <div>
                    <span>Notas</span>
                    <strong>${aluno.notas.join(", ")}</strong>
                </div>
            </div>

            <div class="detalhes-acoes">
                <button class="btn-voltar">
                    Voltar
                </button>
            </div>

        </div>
    `;
}

function renderizarFormularioAluno() {
    return `
        <div class="aluno-form">
            <div>
                <label for="nomeAluno">Nome</label>
                <input type="text" id="nomeAluno" placeholder="Nome do aluno">
            </div>

            <div>
                <label for="notasAluno">Notas</label>
                <input
                    type="text"
                    id="notasAluno"
                    placeholder="Ex: 7.89, 8, 6.5, 9"
                    >

                    <small>Separe as notas por vírgula e use ponto (.) para casas decimais. Ex: 7.89, 8, 6.5, 9</small>
            </div>

            <button class="btn-cadastrar">
                Cadastrar aluno
            </button>
        </div>
    `;
}

function obterDadosFormularioAluno() {
    const nome = document.getElementById("nomeAluno").value.trim();
    const notasTexto = document.getElementById("notasAluno").value;

    const notas = notasTexto
        .split(",")
        .map(nota => Number(nota.trim()));

    return {
        nome,
        notas
    };
}

function renderizarFormularioEdicao(aluno) {
    return `
        <div class="aluno-form">

            <div>
                <label for="nomeEdicao">Nome</label>
                <input
                    type="text"
                    id="nomeEdicao"
                    value="${aluno.nome}"
                >
            </div>

            <div>
                <label for="notasEdicao">Notas</label>
                <input
                    type="text"
                    id="notasEdicao"
                    value="${aluno.notas.join(", ")}"
                >
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
