/**
 * STUDIO INDEX - Shared Utility Module
 * Consolidates common logic for carousels, modals, filters, and security.
 */

// --- PRODUCT CARD ROTATION ---
window.rotationInterval = null;

function startRotation(card) {
    const images = card.querySelectorAll('.card-image');
    if (images.length <= 1) return;
    let currentIndex = 0;
    clearInterval(window.rotationInterval);
    window.rotationInterval = setInterval(() => {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('active');
    }, 1200);
}

function stopRotation(card) {
    clearInterval(window.rotationInterval);
    const images = card.querySelectorAll('.card-image');
    images.forEach((img, index) => {
        img.classList.remove('active');
        if (index === 0) img.classList.add('active');
    });
}

// --- FILTRATION ---
function filterProducts(slug, event) {
    const cards = document.querySelectorAll('.product-card-link');
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    cards.forEach(card => {
        const item = card.querySelector('.product-card');
        const tag = item.getAttribute('data-subtag');
        card.style.display = (slug === 'all' || tag === slug.toLowerCase()) ? 'block' : 'none';
    });
}

async function loadDynamicFilters(type) {
    const filterBar = document.getElementById('dynamic-filters');
    if (!filterBar) return;
    try {
        const { data: cats } = await window._supabase.from('categorias').select('*').eq('tipo', type).order('nome');
        if (cats) {
            cats.forEach(cat => {
                const btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.textContent = cat.nome;
                btn.onclick = (e) => filterProducts(cat.slug, e);
                filterBar.appendChild(btn);
            });
        }
    } catch (e) { console.error("Erro filtros:", e); }
}

// --- CATALOG RENDERING ---
async function renderCatalog(category, containerId = 'product-grid') {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    try {
        const { data: products, error } = await window._supabase.from('produtos').select('*').eq('categoria', category).order('created_at', { ascending: false });
        if (error) throw error;

        if (!products || products.length === 0) {
            grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Nenhum produto encontrado.</p>';
            return;
        }

        grid.innerHTML = products.map(p => {
            const allPhotos = (p.fotos && p.fotos.length > 0) ? p.fotos : ['images/placeholder.png'];
            const tagHtml = p.tag_personalizacao ? `<div class="card-tag">${p.tag_personalizacao}</div>` : '';

            return `
            <a href="product-detail.html?id=${p.id}" class="product-card-link">
                <article class="product-card" data-subtag="${(p.tag_personalizacao || 'all').toLowerCase()}" onmouseenter="startRotation(this)" onmouseleave="stopRotation(this)">
                    ${tagHtml}
                    <div class="image-container">
                        ${allPhotos.map((url, idx) => `<img src="${url}" class="card-image ${idx === 0 ? 'active' : ''}" alt="${p.nome}" loading="lazy">`).join('')}
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${p.nome}</h3>
                        <div class="card-tap-info">Ver Detalhes</div>
                    </div>
                </article>
            </a>
            `;
        }).join('');
    } catch (err) {
        console.error("Erro catálogo:", err);
        grid.innerHTML = '<p style="text-align:center; grid-column:1/-1; color:red;">Erro ao carregar catálogo.</p>';
    }
}

// --- LEAD MODAL & WHATSAPP ---

function openLeadModal(title) {
    window.currentLeadProduct = title;
    const modal = document.getElementById('lead-modal-overlay');
    if (modal) {
        modal.classList.add('active');
        const badge = document.getElementById('modal-product-name');
        if (badge) badge.textContent = title;
        const phoneInput = document.getElementById('user-phone');
        if (phoneInput) setTimeout(() => phoneInput.focus(), 200);
    }
}

function closeLeadModal() {
    const modal = document.getElementById('lead-modal-overlay');
    if (modal) modal.classList.remove('active');
}

async function submitLead(prefix = "GERAL") {
    const phoneInput = document.getElementById('user-phone');
    const phone = phoneInput ? phoneInput.value : "";
    if (phone.length < 14) return alert('Por favor, informe um WhatsApp válido com DDD.');

    const productName = window.currentLeadProduct || 'Geral';

    try {
        if (window._supabase) {
            await window._supabase.from('leads').insert([{
                telefone: phone,
                nome_produto: `${prefix}: ${productName}`
            }]);
        }
        const msg = encodeURIComponent(`Olá! Gostaria de falar sobre: ${productName}`);
        window.open(`https://wa.me/5528999763505?text=${msg}`, '_blank');
        closeLeadModal();
    } catch (e) {
        console.error("Erro ao enviar lead:", e);
        window.open(`https://wa.me/5528999763505`, '_blank');
    }
}

// --- LOGOS CAROUSEL ---
async function loadClientLogos(typeKey) {
    const track = document.getElementById('logo-track');
    if (!track) return;
    try {
        const { data } = await window._supabase.from('site_config').select('*').eq('id', 'client_logos').maybeSingle();
        const config = data ? data.data : { brand_logos: [], corporate_logos: [] };
        const logos = config[typeKey] || [];

        if (logos.length === 0) {
            const section = document.querySelector('.clients-section');
            if (section) section.style.display = 'none';
            return;
        }

        const logosHtml = logos.map(url => `<div class="client-item"><img src="${url}" alt="Parceiro"></div>`).join('');
        let finalHtml = '';
        // Multiplicador para loop infinito suave
        for (let i = 0; i < 12; i++) { finalHtml += logosHtml; }
        track.innerHTML = finalHtml;
        initCarousel();
    } catch (e) {
        console.error("Erro ao carregar logos:", e);
    }
}

function initCarousel() {
    const container = document.querySelector('.clients-carousel-container');
    const track = document.getElementById('logo-track');
    if (!container || !track) return;

    let isDown = false, startX, scrollLeft, isPaused = false, scrollAccumulator = 0;
    let autoScrollSpeed = window.innerWidth < 768 ? 0.5 : 0.3;

    // Inicia no meio para permitir scroll infinito em ambas as direções
    setTimeout(() => { container.scrollLeft = track.scrollWidth / 2; }, 100);

    container.addEventListener('mousedown', (e) => {
        isDown = true; isPaused = true; startX = e.pageX - container.offsetLeft; scrollLeft = container.scrollLeft;
    });
    container.addEventListener('mouseleave', () => { isDown = false; isPaused = false; });
    container.addEventListener('mouseup', () => { isDown = false; isPaused = false; });
    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        container.scrollLeft = scrollLeft - (x - startX) * 2;
    });

    function animateScroll() {
        const oneSetWidth = track.scrollWidth / 12;
        if (!isPaused) {
            scrollAccumulator += autoScrollSpeed;
            if (Math.abs(scrollAccumulator) >= 0.5) {
                container.scrollLeft += scrollAccumulator;
                scrollAccumulator = 0;
            }
        }
        // Teletransporte infinito
        if (container.scrollLeft < oneSetWidth * 4) container.scrollLeft += oneSetWidth * 4;
        else if (container.scrollLeft > oneSetWidth * 8) container.scrollLeft -= oneSetWidth * 4;
        requestAnimationFrame(animateScroll);
    }
    requestAnimationFrame(animateScroll);
}

// --- INITIALIZATION HELPERS ---
function setupCommon() {
    // Admin Shortcut (Shift + L)
    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && (e.key === 'L' || e.key === 'l')) {
            window.location.href = 'admin.html';
        }
    });

    // Phone Mask
    const phoneInput = document.getElementById('user-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
        // Enter key to submit
        phoneInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const submitBtn = document.querySelector('.lead-submit-btn') || document.getElementById('submit-btn');
                if (submitBtn) submitBtn.click();
            }
        });
    }
}

// Export functions to window
window.startRotation = startRotation;
window.stopRotation = stopRotation;
window.filterProducts = filterProducts;
window.openLeadModal = openLeadModal;
window.closeLeadModal = closeLeadModal;
window.submitLead = submitLead;
window.loadDynamicFilters = loadDynamicFilters;
window.renderCatalog = renderCatalog;
window.loadClientLogos = loadClientLogos;
window.initCarousel = initCarousel;
window.setupCommon = setupCommon;
