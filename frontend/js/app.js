const itensMenu = document.querySelectorAll(".menu-item");

function configurarBotoesAlunos() {

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

                        const notasTexto = document.getElementById("notasEdicao").value;

                        const notas = notasTexto
                            .split(",")
                            .map(nota => Number(nota.trim()));

                        const alunoAtualizado = {
                            nome,
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
