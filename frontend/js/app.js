let alunosAtuais = [];
const loginForm = document.getElementById("login-form");
const loginScreen = document.getElementById("login-screen");
const app = document.getElementById("app");
const loginErro = document.getElementById("login-erro");

const botaoLogout = document.getElementById("btn-logout");

botaoLogout.addEventListener("click", () => {
    localStorage.removeItem("edutrack_token");

    app.style.display = "none";
    loginScreen.style.display = "flex";

    document.getElementById("login-usuario").value = "";
    document.getElementById("login-senha").value = "";
    loginErro.textContent = "";
});

loginForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const usuario = document.getElementById("login-usuario").value.trim();
    const senha = document.getElementById("login-senha").value;

    loginErro.textContent = "";

    try {
        const resposta = await fazerLogin(usuario, senha);

        localStorage.setItem(
            "edutrack_token",
            resposta.data.access_token
        );

        loginScreen.style.display = "none";
        app.style.display = "flex";

    } catch (erro) {
        loginErro.textContent = erro.message;
    }
});

function tokenAindaValido() {
    const token = localStorage.getItem("edutrack_token");

    if (!token) {
        return false;
    }

    try {
        const payload = JSON.parse(
            atob(token.split(".")[1])
        );

        const agora = Math.floor(Date.now() / 1000);

        return payload.exp && payload.exp > agora;

    } catch (erro) {
        return false;
    }
}


if (tokenAindaValido()) {
    loginScreen.style.display = "none";
    app.style.display = "flex";
}

const itensMenu = document.querySelectorAll(".menu-item");

function configurarBotoesAlunos() {

    const botoesSerie = document.querySelectorAll(".serie-card");

    botoesSerie.forEach(botao => {
        botao.addEventListener("click", () => {
            const serie = botao.dataset.serie;

            carregarAlunos()
                .then(alunos => {

                    const alunosSerie = alunos.filter(
                        aluno => aluno.serie === serie
                    );

                    mostrarPagina(
                        serie,
                        `
                            <h3>${serie}</h3>

                            ${renderizarTabelaAlunos(alunosSerie)}

                            <div class="detalhes-acoes">

                                <button class="btn-baixar-relatorio">
                                    Baixar relatório
                                </button>

                                <button class="btn-voltar">
                                    Voltar
                                </button>
                            </div>
                        `
                    );

                    configurarBotoesAlunos();

                    const botaoRelatorio = document.querySelector(".btn-baixar-relatorio");

                    botaoRelatorio.addEventListener("click", async () => {
                        try {
                            const arquivo = await baixarRelatorioSerie(serie);

                            const url = URL.createObjectURL(arquivo);

                            const link = document.createElement("a");

                            link.href = url;
                            link.download = `relatorio_${serie.replace(/\s+/g, "_")}.docx`;

                            document.body.appendChild(link);

                            link.click();

                            link.remove();

                            URL.revokeObjectURL(url);

                        } catch (erro) {
                            console.error(
                                "Erro ao baixar relatório."
                            );
                        }
                    });

                    const botaoVoltar = document.querySelector(".btn-voltar");

                    botaoVoltar.addEventListener("click", () => {
                        document.querySelector('[data-page="alunos"]').click();
                    });
                })
                .catch(erro => {
                    console.error(
                        "Erro ao carregar alunos da série:",
                        erro
                    );
                });
        });
    });

    const botaoCadastrar = document.querySelector(".btn-cadastrar");

    if (botaoCadastrar) {
        botaoCadastrar.addEventListener("click", () => {
            const aluno = obterDadosFormularioAluno();

            adicionarAluno(aluno)
                .then(resposta => {
                    console.log("Resposta da API:", resposta);

                    if (!resposta.success) {
                        throw new Error(
                            resposta.error || "Erro ao cadastrar aluno."
                        );
                    }

                    return carregarAlunos();
                })
                .then(alunos => {
                    alunosAtuais = alunos;

                    mostrarPagina(
                        "Alunos",
                        `
                            <h3>Alunos</h3>

                            ${renderizarFormularioAluno()}

                            ${renderizarAlunos(alunos)}
                        `
                    );

                    configurarBotoesAlunos();
                })
                .catch(erro => {
                    console.error(
                        "Erro ao cadastrar aluno:",
                        erro
                    );
                });
        });
    }


    const botoesVer = document.querySelectorAll(".btn-ver");

    botoesVer.forEach(botao => {
        botao.addEventListener("click", () => {
            const id = botao.dataset.id;

            buscarAluno(id)
                .then(resposta => {
                    if (!resposta.success) {
                        throw new Error(
                            resposta.error || "Erro ao buscar aluno."
                        );
                    }

                    mostrarPagina(
                        "Visualizar aluno",
                        renderizarDetalhesAluno(resposta.data)
                    );

                    const botaoVoltar = document.querySelector(".btn-voltar");

                    botaoVoltar.addEventListener("click", () => {
                        document.querySelector('[data-page="alunos"]').click();
                    });
                })
                .catch(erro => {
                    console.error(
                        "Erro ao buscar aluno:",
                        erro
                    );
                });
        });
    });


    const botoesEditar = document.querySelectorAll(".btn-editar");

    botoesEditar.forEach(botao => {
        botao.addEventListener("click", () => {
            const id = botao.dataset.id;

            buscarAluno(id)
                .then(resposta => {
                    if (!resposta.success) {
                        throw new Error(
                            resposta.error || "Erro ao buscar aluno."
                        );
                    }

                    mostrarPagina(
                        "Editar aluno",
                        `
                            <h3>Editar aluno</h3>

                            ${renderizarFormularioEdicao(resposta.data)}
                        `
                    );

                    const botaoSalvar = document.querySelector(".btn-salvar-edicao");

                    botaoSalvar.addEventListener("click", () => {
                        const nome = document.getElementById("nomeEdicao").value.trim();

                        const serie = document.getElementById("serieEdicao").value.trim();

                        const notasTexto = document.getElementById("notasEdicao").value;

                        const notas = notasTexto
                            .split(",")
                            .map(nota => Number(nota.trim()));

                        const alunoAtualizado = {
                            nome,
                            serie,
                            notas
                        };

                        atualizarAluno(id, alunoAtualizado)
                            .then(resposta => {
                                console.log(
                                    "Resposta da atualização:",
                                    resposta
                                );

                                if (!resposta.success) {
                                    throw new Error(
                                        resposta.error || "Erro ao atualizar aluno."
                                    );
                                }

                                return carregarAlunos();
                            })
                            .then(alunos => {
                                mostrarPagina(
                                    "Alunos",
                                    `
                                        <h3>Alunos</h3>

                                        ${renderizarFormularioAluno()}

                                        ${renderizarAlunos(alunos)}
                                    `
                                );

                                configurarBotoesAlunos();
                            })
                            .catch(erro => {
                                console.error(
                                    "Erro ao atualizar aluno:",
                                    erro
                                );
                            });
                    });

                    const botaoCancelar = document.querySelector(".btn-cancelar-edicao");

                    botaoCancelar.addEventListener("click", () => {
                        document.querySelector('[data-page="alunos"]').click();
                    });
                })
                .catch(erro => {
                    console.error(
                        "Erro ao buscar aluno para edição:",
                        erro
                    );
                });
        });
    });


    const botoesExcluir = document.querySelectorAll(".btn-excluir");

    botoesExcluir.forEach(botao => {
        botao.addEventListener("click", () => {
            const confirmar = confirm(
                "Tem certeza que deseja excluir este aluno?"
            );

            if (!confirmar) {
                return;
            }

            const id = botao.dataset.id;

            buscarAluno(id)
                .then(resposta => {
                    if (!resposta.success) {
                        throw new Error(
                            resposta.error || "Erro ao buscar aluno."
                        );
                    }

                    return excluirAluno(resposta.data.nome);
                })
                .then(resposta => {
                    console.log(
                        "Resposta da exclusão:",
                        resposta
                    );

                    if (!resposta.success) {
                        throw new Error(
                            resposta.error || "Erro ao excluir aluno."
                        );
                    }

                    return carregarAlunos();
                })
                .then(alunos => {
                    mostrarPagina(
                        "Alunos",
                        `
                            <h3>Alunos</h3>

                            ${renderizarFormularioAluno()}

                            ${renderizarAlunos(alunos)}
                        `
                    );

                    configurarBotoesAlunos();
                })
                .catch(erro => {
                    console.error(
                        "Erro ao excluir aluno:",
                        erro
                    );
                });
        });
    });
}


itensMenu.forEach(item => {
    item.addEventListener("click", () => {
        const pagina = item.dataset.page;

        if (pagina === "dashboard") {
            mostrarPagina(
                "Dashboard",
                `
                    <h3>Bem-vindo ao EduTrack</h3>
                    <p>Sistema de gerenciamento de alunos.</p>
                `
            );
        }

        if (pagina === "alunos") {
            mostrarPagina(
                "Alunos",
                `
                    <h3>Alunos</h3>

                    ${renderizarFormularioAluno()}

                    <p>Carregando alunos...</p>
                `
            );

            carregarAlunos()
                .then(alunos => {
                    mostrarPagina(
                        "Alunos",
                        `
                            <h3>Alunos</h3>

                            ${renderizarFormularioAluno()}

                            ${renderizarAlunos(alunos)}
                        `
                    );

                    configurarBotoesAlunos();
                })
                .catch(erro => {
                    console.error(
                        "Erro ao carregar alunos:",
                        erro
                    );
                });
        }

        atualizarMenuAtivo(pagina);
    });
});
