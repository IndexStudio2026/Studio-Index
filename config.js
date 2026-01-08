// Configurações de Conexão do Supabase
// Substitua as strings abaixo pelas chaves reais do seu projeto no Supabase

const SUPABASE_URL = 'https://xlrufhinivgrxvyxnqhh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CER1aYylooXil3GDl6K6pg_dASrBWil';

// Inicialização Global (Isso evita o erro de "undefined")
if (typeof supabase !== 'undefined') {

} else {
    console.error("SDK do Supabase não encontrado. Verifique a ordem dos scripts no HTML.");
}