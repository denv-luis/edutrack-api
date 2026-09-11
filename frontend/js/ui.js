function mostrarPagina(titulo, conteudo) {
    const pageTitle = document.getElementById("page-title");
    const content = document.getElementById("content");

    pageTitle.textContent = titulo;
    content.innerHTML = conteudo;
}

function atualizarMenuAtivo(paginaSelecionada) {
    const itensMenu = document.querySelectorAll(".menu-item");

    itensMenu.forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.page === paginaSelecionada
        );
    });
}
