function obterHeadersAutenticacao() {
    const token = localStorage.getItem("edutrack_token");

    return {
        "Authorization": `Bearer ${token}`
    };
}

async function listarAlunos() {
    const resposta = await fetch(API_URL, {
        headers: obterHeadersAutenticacao()
    });

    if (!resposta.ok) {
        throw new Error("Erro ao buscar alunos.");
    }

    return await resposta.json();
}

async function buscarAluno(id) {
    const resposta = await fetch(`${API_URL}/${id}`, {
        headers: obterHeadersAutenticacao()
    });

    if (!resposta.ok) {
        throw new Error("Erro ao buscar aluno.");
    }

    return await resposta.json();
}

async function adicionarAluno(aluno) {
    const resposta = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...obterHeadersAutenticacao()
        },
        body: JSON.stringify(aluno)
    });

    if (!resposta.ok) {
        throw new Error("Erro ao cadastrar aluno.");
    }

    return await resposta.json();
}

async function atualizarAluno(id, aluno) {
    const resposta = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...obterHeadersAutenticacao()
        },
        body: JSON.stringify(aluno)
    });

    if (!resposta.ok) {
        throw new Error("Erro ao atualizar aluno.");
    }

    return await resposta.json();
}

async function excluirAluno(nome) {
    const resposta = await fetch(
        `${API_URL}/${encodeURIComponent(nome)}`,
        {
            method: "DELETE",
            headers: obterHeadersAutenticacao()
        }
    );

    if (!resposta.ok) {
        throw new Error("Erro ao excluir aluno.");
    }

    return await resposta.json();
}

async function fazerLogin(usuario, senha) {
    const resposta = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            usuario: usuario,
            senha: senha
        })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            dados.detail || "Usuário ou senha inválidos."
        );
    }

    return dados;
}

async function baixarRelatorioSerie(serie) {
    const resposta = await fetch(
        `/alunos/serie/${encodeURIComponent(serie)}/relatorio`,
        {
            method: "GET",
            headers: obterHeadersAutenticacao()
        }
    );

    if (!resposta.ok) {
        let mensagem = "Erro ao gerar relatório.";

        try {
            const dados = await resposta.json();

            if (dados.detail) {
                mensagem = dados.detail;
            }
        } catch (erro) {
            // Mantém a mensagem padrão.
        }

        throw new Error(mensagem);
    }

    return await resposta.blob();
}
