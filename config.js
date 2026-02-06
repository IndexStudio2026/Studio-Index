// Configurações de Conexão do Supabase - STUDIO INDEX
const SUPABASE_URL = 'https://xlrufhinivgrxvyxnqhh.supabase.co';
// INSIRA ABAIXO A CHAVE QUE COMEÇA COM sb_publishable (aquela que você gerou agora)
const SUPABASE_KEY = 'sb_publishable_0IfUWtx4qNQUJcED4fkh_w_E0fyKG5q';

// Inicialização Global
let supabaseClient;

if (typeof supabase !== 'undefined') {
    // Inicializa o cliente padrão
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Isso aqui garante que o seu ADMIN.HTML antigo (que usa _supabase) também funcione
    window._supabase = supabaseClient;

    console.log("✅ Conexão com Supabase estabelecida.");
} else {
    console.error("❌ SDK do Supabase não encontrado. Verifique a ordem dos scripts no HTML.");
}