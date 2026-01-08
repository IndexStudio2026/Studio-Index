// content_loader.js - TESTE DE DIAGNÓSTICO
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('products-grid');

    if (!container) {
        alert("ERRO CRÍTICO: O elemento 'products-grid' não foi encontrado no HTML!");
        return;
    }

    container.innerHTML = "<h1>Tentando conectar ao banco...</h1>";

    try {
        const products = await window.StudioDB.getAll();
        console.log("DADOS DO BANCO:", products);

        if (!products || Object.keys(products).length === 0) {
            container.innerHTML = "<h1>O banco respondeu, mas está VAZIO.</h1><p>Verifique se os produtos aparecem no painel do Supabase na tabela 'produtos'.</p>";
        } else {
            container.innerHTML = "<h1>Produtos encontrados! Renderizando...</h1>";
            // Aqui ele tentaria desenhar os cards...
        }
    } catch (err) {
        container.innerHTML = "<h1>Erro na conexão: " + err.message + "</h1>";
    }
});