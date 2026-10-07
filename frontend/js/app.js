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

    const usuario =
        document.getElementById("login-usuario").value.trim();

    const senha =
        document.getElementById("login-senha").value;

    loginErro.textContent = "";

    try {

        const resposta =
            await fazerLogin(usuario, senha);

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

    const token =
        localStorage.getItem("edutrack_token");

    if (!token) {
        return false;
    }

    try {

        const payload = JSON.parse(
            atob(token.split(".")[1])
        );

        const agora =
            Math.floor(Date.now() / 1000);

        return payload.exp && payload.exp > agora;

    } catch (erro) {

        return false;
    }
}


if (tokenAindaValido()) {

    loginScreen.style.display = "none";
    app.style.display = "flex";
}


const itensMenu =
    document.querySelectorAll(".menu-item");


// ============================================================
// CONFIGURAÇÃO DOS BOTÕES
// ============================================================

function configurarBotoesAlunos() {


    // --------------------------------------------------------
    // SÉRIES
    // --------------------------------------------------------

    const botoesSerie =
        document.querySelectorAll(".serie-card");

    botoesSerie.forEach(botao => {

        botao.addEventListener("click", () => {

            const serie =
                botao.dataset.serie;

            carregarAlunos()
                .then(alunos => {

                    const alunosSerie =
                        alunos.filter(
                            aluno =>
                                aluno.serie === serie
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


                    const botaoRelatorio =
                        document.querySelector(
                            ".btn-baixar-relatorio"
                        );


                    if (botaoRelatorio) {

                        botaoRelatorio.addEventListener(
                            "click",
                            async () => {

                                try {

                                    const arquivo =
                                        await baixarRelatorioSerie(
                                            serie
                                        );

                                    const url =
                                        URL.createObjectURL(
                                            arquivo
                                        );

                                    const link =
                                        document.createElement(
                                            "a"
                                        );

                                    link.href = url;

                                    link.download =
                                        `relatorio_${serie.replace(
                                            /\s+/g,
                                            "_"
                                        )}.docx`;

                                    document.body.appendChild(
                                        link
                                    );

                                    link.click();

                                    link.remove();

                                    URL.revokeObjectURL(
                                        url
                                    );

                                } catch (erro) {

                                    console.error(
                                        "Erro ao baixar relatório:",
                                        erro
                                    );
                                }
                            }
                        );
                    }


                    const botaoVoltar =
                        document.querySelector(
                            ".btn-voltar"
                        );


                    if (botaoVoltar) {

                        botaoVoltar.addEventListener(
                            "click",
                            () => {

                                document
                                    .querySelector(
                                        '[data-page="alunos"]'
                                    )
                                    .click();
                            }
                        );
                    }

                })
                .catch(erro => {

                    console.error(
                        "Erro ao carregar alunos da série:",
                        erro
                    );
                });
        });
    });


    // --------------------------------------------------------
    // ADICIONAR DISCIPLINA
    // --------------------------------------------------------

    const botoesAdicionarDisciplina =
        document.querySelectorAll(
            ".btn-adicionar-disciplina"
        );


    botoesAdicionarDisciplina.forEach(botao => {

        botao.addEventListener("click", () => {

            const container =
                botao.previousElementSibling;


            if (!container) {
                return;
            }


            const blocoDisciplina =
                document.createElement("div");

            blocoDisciplina.className =
                "disciplina-form";


            blocoDisciplina.innerHTML = `
                <div class="disciplina-header">

                    <label>
                        Disciplina
                    </label>

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
                    placeholder="Ex: Matemática"
                >


                <div class="notas-container">

                    <label>
                        Notas
                    </label>

                    <div class="notas-lista">

                        <div class="nota-item">

                            <input
                                type="number"
                                class="nota-disciplina"
                                min="0"
                                max="10"
                                step="0.01"
                                placeholder="Nota"
                            >

                            <button
                                type="button"
                                class="btn-remover-nota"
                            >
                                Remover
                            </button>

                        </div>

                    </div>


                    <button
                        type="button"
                        class="btn-adicionar-nota"
                    >
                        + Adicionar nota
                    </button>

                    <p class="nota-ajuda">
                        Use ponto (.) para separar as casas decimais. Ex.: 7.5
                    </p>

                </div>
            `;


            container.appendChild(
                blocoDisciplina
            );


            configurarBotoesDisciplina(
                blocoDisciplina
            );
        });
    });


    // --------------------------------------------------------
    // ADICIONAR NOTA
    // --------------------------------------------------------

    const botoesAdicionarNota =
        document.querySelectorAll(
            ".btn-adicionar-nota"
        );


    botoesAdicionarNota.forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                adicionarCampoNota(
                    botao
                );
            }
        );
    });


    // --------------------------------------------------------
    // REMOVER DISCIPLINA
    // --------------------------------------------------------

    const botoesRemoverDisciplina =
        document.querySelectorAll(
            ".btn-remover-disciplina"
        );


    botoesRemoverDisciplina.forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                const disciplina =
                    botao.closest(
                        ".disciplina-form"
                    );


                if (!disciplina) {
                    return;
                }


                const container =
                    disciplina.parentElement;


                const disciplinas =
                    container.querySelectorAll(
                        ".disciplina-form"
                    );


                // Mantém pelo menos uma disciplina
                if (disciplinas.length <= 1) {

                    alert(
                        "O aluno precisa ter pelo menos uma disciplina."
                    );

                    return;
                }


                disciplina.remove();
            }
        );
    });


    // --------------------------------------------------------
    // REMOVER NOTA
    // --------------------------------------------------------

    const botoesRemoverNota =
        document.querySelectorAll(
            ".btn-remover-nota"
        );


    botoesRemoverNota.forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                removerCampoNota(
                    botao
                );
            }
        );
    });


    // --------------------------------------------------------
    // CADASTRAR ALUNO
    // --------------------------------------------------------

    const botaoCadastrar =
        document.querySelector(
            ".btn-cadastrar"
        );


    if (botaoCadastrar) {

        botaoCadastrar.addEventListener(
            "click",
            async () => {

                try {

                    const aluno =
                        obterDadosFormularioAluno();


                    validarAluno(aluno);


                    const resposta =
                        await adicionarAluno(
                            aluno
                        );


                    console.log(
                        "Resposta da API:",
                        resposta
                    );


                    if (!resposta.success) {

                        throw new Error(
                            resposta.error ||
                            "Erro ao cadastrar aluno."
                        );
                    }


                    const alunos =
                        await carregarAlunos();


                    alunosAtuais =
                        alunos;


                    mostrarPagina(
                        "Alunos",
                        `
                            <h3>Alunos</h3>

                            ${renderizarFormularioAluno()}

                            ${renderizarAlunos(alunos)}
                        `
                    );


                    configurarBotoesAlunos();

                } catch (erro) {

                    console.error(
                        "Erro ao cadastrar aluno:",
                        erro
                    );

                    alert(
                        erro.message
                    );
                }
            }
        );
    }


    // --------------------------------------------------------
    // VISUALIZAR ALUNO
    // --------------------------------------------------------

    const botoesVer =
        document.querySelectorAll(
            ".btn-ver"
        );


    botoesVer.forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                const id =
                    botao.dataset.id;


                buscarAluno(id)
                    .then(resposta => {

                        if (!resposta.success) {

                            throw new Error(
                                resposta.error ||
                                "Erro ao buscar aluno."
                            );
                        }


                        mostrarPagina(
                            "Visualizar aluno",
                            renderizarDetalhesAluno(
                                resposta.data
                            )
                        );


                        const botaoVoltar =
                            document.querySelector(
                                ".btn-voltar"
                            );


                        if (botaoVoltar) {

                            botaoVoltar.addEventListener(
                                "click",
                                () => {

                                    document
                                        .querySelector(
                                            '[data-page="alunos"]'
                                        )
                                        .click();
                                }
                            );
                        }

                    })
                    .catch(erro => {

                        console.error(
                            "Erro ao buscar aluno:",
                            erro
                        );
                    });
            }
        );
    });


    // --------------------------------------------------------
    // EDITAR ALUNO
    // --------------------------------------------------------

    const botoesEditar =
        document.querySelectorAll(
            ".btn-editar"
        );


    botoesEditar.forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                const id =
                    botao.dataset.id;


                buscarAluno(id)
                    .then(resposta => {

                        if (!resposta.success) {

                            throw new Error(
                                resposta.error ||
                                "Erro ao buscar aluno."
                            );
                        }


                        mostrarPagina(
                            "Editar aluno",
                            `
                                <h3>Editar aluno</h3>

                                ${renderizarFormularioEdicao(
                                    resposta.data
                                )}
                            `
                        );


                        configurarBotoesAlunos();


                        const botaoSalvar =
                            document.querySelector(
                                ".btn-salvar-edicao"
                            );


                        if (botaoSalvar) {

                            botaoSalvar.addEventListener(
                                "click",
                                async () => {

                                    try {

                                        const alunoAtualizado =
                                            obterDadosFormularioEdicao();


                                        validarAluno(
                                            alunoAtualizado
                                        );


                                        const resposta =
                                            await atualizarAluno(
                                                id,
                                                alunoAtualizado
                                            );


                                        console.log(
                                            "Resposta da atualização:",
                                            resposta
                                        );


                                        if (!resposta.success) {

                                            throw new Error(
                                                resposta.error ||
                                                "Erro ao atualizar aluno."
                                            );
                                        }


                                        const alunos =
                                            await carregarAlunos();


                                        alunosAtuais =
                                            alunos;


                                        mostrarPagina(
                                            "Alunos",
                                            `
                                                <h3>Alunos</h3>

                                                ${renderizarFormularioAluno()}

                                                ${renderizarAlunos(alunos)}
                                            `
                                        );


                                        configurarBotoesAlunos();

                                    } catch (erro) {

                                        console.error(
                                            "Erro ao atualizar aluno:",
                                            erro
                                        );

                                        alert(
                                            erro.message
                                        );
                                    }
                                }
                            );
                        }


                        const botaoCancelar =
                            document.querySelector(
                                ".btn-cancelar-edicao"
                            );


                        if (botaoCancelar) {

                            botaoCancelar.addEventListener(
                                "click",
                                () => {

                                    document
                                        .querySelector(
                                            '[data-page="alunos"]'
                                        )
                                        .click();
                                }
                            );
                        }

                    })
                    .catch(erro => {

                        console.error(
                            "Erro ao buscar aluno para edição:",
                            erro
                        );
                    });
            }
        );
    });


    // --------------------------------------------------------
    // EXCLUIR ALUNO
    // --------------------------------------------------------

    const botoesExcluir =
        document.querySelectorAll(
            ".btn-excluir"
        );


    botoesExcluir.forEach(botao => {

        botao.addEventListener(
            "click",
            async () => {

                const confirmar =
                    confirm(
                        "Tem certeza que deseja excluir este aluno?"
                    );


                if (!confirmar) {
                    return;
                }


                try {

                    const id =
                        botao.dataset.id;


                    const respostaBusca =
                        await buscarAluno(id);


                    if (!respostaBusca.success) {

                        throw new Error(
                            respostaBusca.error ||
                            "Erro ao buscar aluno."
                        );
                    }


                    const respostaExclusao =
                        await excluirAluno(
                            respostaBusca.data.nome
                        );


                    console.log(
                        "Resposta da exclusão:",
                        respostaExclusao
                    );


                    if (!respostaExclusao.success) {

                        throw new Error(
                            respostaExclusao.error ||
                            "Erro ao excluir aluno."
                        );
                    }


                    const alunos =
                        await carregarAlunos();


                    alunosAtuais =
                        alunos;


                    mostrarPagina(
                        "Alunos",
                        `
                            <h3>Alunos</h3>

                            ${renderizarFormularioAluno()}

                            ${renderizarAlunos(alunos)}
                        `
                    );


                    configurarBotoesAlunos();

                } catch (erro) {

                    console.error(
                        "Erro ao excluir aluno:",
                        erro
                    );

                    alert(
                        erro.message
                    );
                }
            }
        );
    });
}


// ============================================================
// FUNÇÕES AUXILIARES DAS DISCIPLINAS
// ============================================================

function configurarBotoesDisciplina(
    blocoDisciplina
) {

    const botaoAdicionarNota =
        blocoDisciplina.querySelector(
            ".btn-adicionar-nota"
        );


    if (botaoAdicionarNota) {

        botaoAdicionarNota.addEventListener(
            "click",
            () => {

                adicionarCampoNota(
                    botaoAdicionarNota
                );
            }
        );
    }


    const botaoRemoverDisciplina =
        blocoDisciplina.querySelector(
            ".btn-remover-disciplina"
        );


    if (botaoRemoverDisciplina) {

        botaoRemoverDisciplina.addEventListener(
            "click",
            () => {

                const container =
                    blocoDisciplina.parentElement;


                const disciplinas =
                    container.querySelectorAll(
                        ".disciplina-form"
                    );


                if (disciplinas.length <= 1) {

                    alert(
                        "O aluno precisa ter pelo menos uma disciplina."
                    );

                    return;
                }


                blocoDisciplina.remove();
            }
        );
    }


    const botoesRemoverNota =
        blocoDisciplina.querySelectorAll(
            ".btn-remover-nota"
        );


    botoesRemoverNota.forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                removerCampoNota(
                    botao
                );
            }
        );
    });
}


function adicionarCampoNota(
    botaoAdicionarNota
) {

    const blocoDisciplina =
        botaoAdicionarNota.closest(
            ".disciplina-form"
        );


    if (!blocoDisciplina) {
        return;
    }


    const containerNotas =
        blocoDisciplina.querySelector(
            ".notas-lista"
        );


    if (!containerNotas) {
        return;
    }


    const novoCampo =
        document.createElement("div");

    novoCampo.className =
        "nota-item";


    novoCampo.innerHTML = `
        <input
            type="number"
            class="nota-disciplina"
            min="0"
            max="10"
            step="0.01"
            placeholder="Nota"
        >

        <button
            type="button"
            class="btn-remover-nota"
        >
            Remover
        </button>
    `;


    containerNotas.appendChild(
        novoCampo
    );


    const botaoRemover =
        novoCampo.querySelector(
            ".btn-remover-nota"
        );


    botaoRemover.addEventListener(
        "click",
        () => {

            removerCampoNota(
                botaoRemover
            );
        }
    );
}


function removerCampoNota(
    botao
) {

    const blocoDisciplina =
        botao.closest(
            ".disciplina-form"
        );


    if (!blocoDisciplina) {
        return;
    }


    const notas =
        blocoDisciplina.querySelectorAll(
            ".nota-disciplina"
        );


    // Mantém pelo menos uma nota
    if (notas.length <= 1) {

        alert(
            "A disciplina precisa ter pelo menos uma nota."
        );

        return;
    }


    const notaItem =
        botao.closest(
            ".nota-item"
        );


    if (notaItem) {
        notaItem.remove();
    }
}


// ============================================================
// VALIDAÇÃO DO FORMULÁRIO
// ============================================================

function validarAluno(aluno) {

    if (!aluno.nome) {

        throw new Error(
            "Informe o nome do aluno."
        );
    }


    if (!aluno.serie) {

        throw new Error(
            "Informe a série do aluno."
        );
    }


    if (
        !aluno.disciplinas ||
        aluno.disciplinas.length === 0
    ) {

        throw new Error(
            "Adicione pelo menos uma disciplina."
        );
    }


    aluno.disciplinas.forEach(
        (disciplina, indice) => {

            if (!disciplina.nome) {

                throw new Error(
                    `Informe o nome da disciplina ${indice + 1}.`
                );
            }


            if (
                !disciplina.notas ||
                disciplina.notas.length === 0
            ) {

                throw new Error(
                    `Adicione pelo menos uma nota em ${disciplina.nome}.`
                );
            }


            disciplina.notas.forEach(
                nota => {

                    if (
                        Number.isNaN(nota) ||
                        nota < 0 ||
                        nota > 10
                    ) {

                        throw new Error(
                            `Existe uma nota inválida em ${disciplina.nome}. Use valores entre 0 e 10.`
                        );
                    }
                }
            );
        }
    );
}


// ============================================================
// MENU
// ============================================================

itensMenu.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            const pagina =
                item.dataset.page;


            if (pagina === "dashboard") {

                mostrarPagina(
                    "Dashboard",
                    `
                        <h3>Bem-vindo ao EduTrack</h3>

                        <p>
                            Sistema de gerenciamento de alunos.
                        </p>
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

                        alunosAtuais =
                            alunos;


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


            atualizarMenuAtivo(
                pagina
            );
        }
    );
});