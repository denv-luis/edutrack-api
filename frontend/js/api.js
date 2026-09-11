async function listarAlunos() {
    const resposta = await fetch(API_URL);

    if (!resposta.ok) {
        throw new Error("Erro ao buscar alunos.");
    }

    return await resposta.json();
}

async function buscarAluno(id) {
    const resposta = await fetch(`${API_URL}/${id}`);

    if (!resposta.ok) {
        throw new Error("Erro ao buscar aluno.");
    }

    return await resposta.json();
}

async function adicionarAluno(aluno) {
    const resposta = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
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
            "Content-Type": "application/json"
        },
        body: JSON.stringify(aluno)
    });

    if (!resposta.ok) {
        throw new Error("Erro ao atualizar aluno.");
    }

    return await resposta.json();
}

async function excluirAluno(nome) {
    const resposta = await fetch(`${API_URL}/${encodeURIComponent(nome)}`, {
        method: "DELETE"
    });

    if (!resposta.ok) {
        throw new Error("Erro ao excluir aluno.");
    }

    return await resposta.json();
}
