// database.js
const DB = {
    client: null,

    init() {
        if (!window.CONFIG || !window.CONFIG.SUPABASE_URL) {
            console.error("Configurações do Supabase não encontradas no config.js");
            return;
        }

        // Tenta usar o SDK do Supabase carregado via CDN ou NPM
        const supabaseLib = window.supabase || (typeof createClient !== 'undefined' ? { createClient } : null);

        if (supabaseLib) {
            this.client = supabaseLib.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_KEY);
            console.log("Supabase conectado com sucesso!");
        } else {
            console.error("SDK do Supabase não foi carregado. Verifique o index.html.");
        }
    },

    // --- PRODUTOS ---
    async getAll() {
        if (!this.client) return {};
        const { data, error } = await this.client.from('produtos').select('*');
        if (error) { console.error("Erro ao buscar produtos:", error); return {}; }

        const productsMap = {};
        data.forEach(row => { productsMap[row.id] = row.data; });
        return productsMap;
    },

    async addProduct(id, productData) {
        if (!this.client) return;
        const { error } = await this.client
            .from('produtos')
            .upsert({ id: id, data: productData });

        if (error) {
            console.error("Erro ao salvar produto:", error);
        } else {
            console.log("Produto salvo com sucesso!");
        }
    },

    async deleteProduct(id) {
        if (!this.client) return;
        const { error } = await this.client
            .from('produtos')
            .delete()
            .eq('id', id);

        if (error) console.error("Erro ao deletar produto:", error);
    },

    // --- LEADS (PEDIDOS E CONTATOS) ---
    async addLead(lead) {
        if (!this.client) return;
        const newLead = {
            client_phone: lead.clientPhone,
            product_title: lead.productTitle,
            category: lead.category || 'Geral',
            status: 'Pendente'
        };
        const { error } = await this.client.from('leads').insert(newLead);
        if (error) console.error("Erro ao salvar lead:", error);
    },

    async getLeads() {
        if (!this.client) return [];
        const { data, error } = await this.client
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Erro ao buscar leads:", error);
            return [];
        }

        // Converte o formato do banco para o formato que o seu admin espera
        return data.map(l => ({
            id: l.id,
            timestamp: l.created_at,
            status: l.status,
            clientPhone: l.client_phone,
            productTitle: l.product_title,
            category: l.category
        }));
    },

    async updateLeadStatus(id, status) {
        if (!this.client) return;
        const { error } = await this.client
            .from('leads')
            .update({ status: status })
            .eq('id', id);

        if (error) console.error("Erro ao atualizar status do lead:", error);
    },

    async deleteLead(id) {
        if (!this.client) return;
        const { error } = await this.client
            .from('leads')
            .delete()
            .eq('id', id);

        if (error) console.error("Erro ao deletar lead:", error);
    },

    // --- FUNÇÕES DE IMAGENS DO SITE (SLIDER E MARCAS) ---

    async getSiteImages() {
        if (!this.client) return { home_slider: [], brand_logos: [], about_marcas: [], about_corporate: [] };
        const { data, error } = await this.client
            .from('site_config')
            .select('*')
            .eq('id', 'site_images')
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            console.error("Erro ao buscar imagens do site:", error);
        }

        return data ? data.data : { home_slider: [], brand_logos: [], about_marcas: [], about_corporate: [] };
    },

    async getSectionImages(section) {
        // Resolve o erro "StudioDB.getSectionImages is not a function"
        const all = await this.getSiteImages();
        return all[section] || [];
    },

    async saveSiteImages(data) {
        if (!this.client) return;
        const { error } = await this.client
            .from('site_config')
            .upsert({ id: 'site_images', data: data });

        if (error) console.error("Erro ao salvar imagens do site:", error);
    }
};

window.StudioDB = DB;
window.addEventListener('load', () => StudioDB.init());