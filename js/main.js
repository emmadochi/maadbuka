/**
 * Main JS - UI Logic for EasyShop
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Initial UI state
    injectProductModal();
    injectNavigationDrawer();
    updateBasketBadge();

    // Route-specific logic
    const path = window.location.pathname;
    if (path.endsWith('index.html') || path === '/' || path.endsWith('EasyShop/')) {
        await initHeroPage();
    } else if (path.endsWith('basket.html')) {
        initBasketPage();
    }

    // Scroll-reveal animations
    initScrollReveal();

    // Header Search placeholder interactivity
    const searchInputs = ['desktop-search', 'mobile-search', 'search-input', 'shop-search'];
    searchInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                if (path.endsWith('index.html') || path === '/' || path.endsWith('EasyShop/')) {
                    filterMeals(query);
                } else if (path.endsWith('shop.html')) {
                    if (typeof filterProducts === 'function') filterProducts(query);
                }
            });
        }
    });
});

/**
 * Updates the floating red badge on the basket icon
 */
function updateBasketBadge() {
    const badgeIds = ['basket-badge', 'basket-badge-mobile'];
    const count = BasketService.getBasketCount();
    
    badgeIds.forEach(id => {
        const badge = document.getElementById(id);
        if (!badge) return;
        
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });
}

// Listen for basket updates from anywhere
window.addEventListener('basketUpdated', () => {
    updateBasketBadge();
    // If we are on the basket page, re-render it
    if (window.location.pathname.endsWith('basket.html')) {
        initBasketPage();
    }
});

let featuredMeals = [];
let modalSelectedProduct = null;
let modalQuantity = 1;

/**
 * Home Page Logic: Fetch and Render Featured Meals
 */
async function initHeroPage() {
    const grid = document.getElementById('featured-meals-grid');
    if (!grid) return;

    const allProducts = await DataService.getProducts();
    // Select first 6 as "featured"
    featuredMeals = allProducts.slice(0, 6);
    renderFeaturedMeals(featuredMeals);
}

function renderFeaturedMeals(meals) {
    const grid = document.getElementById('featured-meals-grid');
    if (!grid) return;

    if (meals.length === 0) {
        grid.innerHTML = '<p class="col-span-2 text-center py-10 text-on-surface-variant font-medium">No gourmet meals found matching your criteria.</p>';
        return;
    }

    grid.innerHTML = meals.map(m => `
        <div class="bg-surface-container-lowest rounded-DEFAULT p-3 flex flex-col gap-3 group animate-in fade-in slide-in-from-bottom-4 duration-500 hover:shadow-lg transition-shadow cursor-pointer" onclick='openProductModal(${JSON.stringify(m).replace(/'/g, "&apos;")})'>
            <div class="relative aspect-square rounded-lg overflow-hidden bg-surface-container-low">
                <img alt="${m.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${m.image}"/>
                <div class="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur text-[10px] font-bold rounded-full text-primary shadow-sm">
                    $${m.price.toFixed(2)}
                </div>
            </div>
            <div class="flex flex-col gap-1">
                <div class="flex justify-between items-start">
                    <h4 class="font-label font-bold text-sm line-clamp-1 flex-grow text-primary">${m.name}</h4>
                </div>
                <p class="text-[10px] text-on-surface-variant line-clamp-2 italic h-6">${m.description || ''}</p>
                <div class="flex items-center justify-between mt-2">
                    <div class="flex items-center gap-1 text-[10px] text-orange-500 font-bold">
                        <span class="material-symbols-outlined text-[12px] material-symbols-fill">star</span>
                        4.8
                    </div>
                    <div class="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
                        <span class="material-symbols-outlined text-[18px]">visibility</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function openProductModal(product) {
    modalSelectedProduct = product;
    modalQuantity = 1;
    
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-product-price').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('modal-product-description').textContent = product.description || 'Gourmet selection prepared with fresh ingredients.';
    document.getElementById('modal-product-image').src = product.image;
    document.getElementById('modal-quantity').textContent = modalQuantity;
    document.getElementById('modal-instructions').value = '';

    const modal = document.getElementById('product-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const content = document.getElementById('modal-content');

    modal.classList.remove('hidden');
    // Force reflow for animations
    setTimeout(() => {
        backdrop.classList.add('opacity-100');
        backdrop.classList.remove('pointer-events-none');
        content.classList.remove('translate-y-full');
    }, 10);
    
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const backdrop = document.getElementById('modal-backdrop');
    const content = document.getElementById('modal-content');

    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('pointer-events-none');
    content.classList.add('translate-y-full');

    setTimeout(() => {
        document.getElementById('product-modal').classList.add('hidden');
        document.body.style.overflow = '';
    }, 500);
}

function updateModalQuantity(delta) {
    modalQuantity = Math.max(1, modalQuantity + delta);
    document.getElementById('modal-quantity').textContent = modalQuantity;
}

function confirmAddToBasket() {
    if (!modalSelectedProduct) return;
    
    const instructions = document.getElementById('modal-instructions').value;
    BasketService.addToBasket(modalSelectedProduct, modalQuantity, instructions);
    
    showToast(`Added ${modalQuantity}x ${modalSelectedProduct.name} to basket!`);
    closeProductModal();
}

function filterMeals(query) {
    const filtered = featuredMeals.filter(m => 
        m.name.toLowerCase().includes(query) || 
        (m.category && m.category.toLowerCase().includes(query))
    );
    renderFeaturedMeals(filtered);
}

/**
 * Quick add to basket specifically for home page meals
 */
function quickAdd(product) {
    openProductModal(product);
}

/**
 * Placeholder for viewing a specific restaurant (would show products)
 */
function viewRestaurant(id) {
    DataService.getProductsByRestaurant(id).then(products => {
        if (products.length > 0) {
            openProductModal(products[0]);
        }
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 soulful-gradient text-white px-6 py-3 rounded-full text-xs font-bold shadow-xl z-[100] animate-in fade-in slide-in-from-bottom-10 duration-300';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-10');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

/**
 * Basket Page Logic
 */
function initBasketPage() {
    const list = document.getElementById('basket-items-list');
    const totalEl = document.getElementById('basket-total');
    if (!list) return;

    const basket = BasketService.getBasket();
    const count = BasketService.getBasketCount();

    if (basket.length === 0) {
        list.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-center">
                <span class="material-symbols-outlined text-6xl text-surface-container-high mb-4">shopping_basket</span>
                <h3 class="text-xl font-bold text-primary mb-2">Your basket is empty</h3>
                <p class="text-on-surface-variant text-sm mb-8">Add some gourmet dishes to get started!</p>
                <a href="index.html" class="soulful-gradient text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider">Browse Dishes</a>
            </div>
        `;
        if (totalEl) totalEl.textContent = '$0.00';
        // Hide summary section if empty
        const summary = document.getElementById('basket-summary');
        if (summary) summary.classList.add('hidden');
        return;
    }

    // Show summary
    const summary = document.getElementById('basket-summary');
    if (summary) summary.classList.remove('hidden');

    list.innerHTML = basket.map(item => `
        <div class="bg-white p-5 rounded-3xl flex gap-5 items-center transition-all duration-300 shadow-sm border border-surface-container-high animate-in fade-in slide-in-from-bottom-4">
            <div class="w-24 h-24 bg-surface-container-low rounded-2xl overflow-hidden flex-shrink-0 shadow-inner">
                <img class="w-full h-full object-cover" src="${item.image}"/>
            </div>
            <div class="flex-grow flex flex-col justify-between h-24 py-1">
                <div class="relative">
                    <div class="flex justify-between items-start">
                        <h3 class="font-headline font-bold text-lg text-primary">${item.name}</h3>
                        <button onclick="BasketService.removeFromBasket(${item.id}, '${item.customizations || ''}')" class="text-on-surface-variant hover:text-red-500 transition-colors">
                            <span class="material-symbols-outlined text-xl">close</span>
                        </button>
                    </div>
                    ${item.customizations ? `
                        <div class="flex items-center gap-1.5 mt-0.5 bg-secondary-container/30 px-2 py-0.5 rounded-full w-fit">
                            <span class="material-symbols-outlined text-[10px] text-primary">edit_note</span>
                            <p class="text-[10px] text-primary font-bold line-clamp-1 italic">${item.customizations}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="flex justify-between items-end">
                    <span class="font-headline font-bold text-xl">$${(item.price * item.quantity).toFixed(2)}</span>
                    <div class="bg-surface-container-low rounded-full flex items-center p-1 px-2 gap-4 border border-surface-container-high">
                        <button onclick="BasketService.removeFromBasket(${item.id}, '${item.customizations || ''}')" class="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm active:scale-90 transition-transform">
                            <span class="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span class="font-bold text-sm min-w-[1rem] text-center">${item.quantity}</span>
                        <button onclick="BasketService.addToBasket({id: ${item.id}, name: '${item.name}', price: ${item.price}, image: '${item.image}'}, 1, '${item.customizations || ''}')" class="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-white shadow-md active:scale-90 transition-transform">
                            <span class="material-symbols-outlined text-sm">add</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    if (totalEl) totalEl.textContent = `$${BasketService.getBasketTotal().toFixed(2)}`;
    
    // Update mobile total if exists
    const totalMobileEl = document.getElementById('basket-total-mobile');
    if (totalMobileEl) totalMobileEl.textContent = `$${BasketService.getBasketTotal().toFixed(2)}`;

    // Show/Hide mobile summary
    const summaryMobile = document.getElementById('basket-summary-mobile');
    if (summaryMobile) {
        if (basket.length > 0) summaryMobile.classList.remove('hidden');
        else summaryMobile.classList.add('hidden');
    }

    // Update subtotal, taxes, etc if they exist
    const subtotalEl = document.getElementById('basket-subtotal');
    if (subtotalEl) subtotalEl.textContent = `$${BasketService.getBasketTotal().toFixed(2)}`;
}

/**
 * Scroll Reveal Implementation
 */
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-10');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Elements to reveal
    const revealElements = document.querySelectorAll('section, .product-card, footer');
    revealElements.forEach(el => {
        // Only if it doesn't already have it
        if (!el.classList.contains('reveal-init')) {
            el.classList.add('reveal-init', 'transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
            observer.observe(el);
        }
    });
}

/**
 * Injects the Product Preview Modal into the DOM if it doesn't exist
 */
function injectProductModal() {
    if (document.getElementById('product-modal')) return;

    const modalHTML = `
    <div id="product-modal" class="fixed inset-0 z-[100] hidden flex items-end sm:items-center justify-center p-0 sm:p-4 active:scale-100 transition-all duration-300">
        <div id="modal-backdrop" class="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 transition-opacity duration-300 pointer-events-none" onclick="closeProductModal()"></div>
        <div id="modal-content" class="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden translate-y-full transition-transform duration-500 max-h-[90vh] flex flex-col">
            <!-- Modal Header / Image -->
            <div class="relative h-64 sm:h-72 w-full flex-shrink-0">
                <img id="modal-product-image" src="" alt="" class="w-full h-full object-cover">
                <button onclick="closeProductModal()" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <!-- Modal Body (Scrollable) -->
            <div class="p-6 overflow-y-auto hide-scrollbar flex-grow">
                <div class="flex justify-between items-start mb-2">
                    <h2 id="modal-product-name" class="text-2xl font-headline font-extrabold text-primary">Dish Name</h2>
                    <span id="modal-product-price" class="text-xl font-bold bg-secondary-container px-3 py-1 rounded-full text-slate-800">$0.00</span>
                </div>
                <p id="modal-product-description" class="text-on-surface-variant text-sm mb-6"></p>
                
                <!-- Quantity Selector -->
                <div class="bg-surface-container-low p-4 rounded-2xl mb-6 shadow-inner">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-sm">Select Quantity</span>
                        <div class="bg-white rounded-full p-1 flex items-center gap-6 shadow-sm border border-surface-container-high">
                            <button onclick="updateModalQuantity(-1)" class="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low active:scale-90 transition-transform">
                                <span class="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <span id="modal-quantity" class="font-extrabold text-lg min-w-[1.5rem] text-center">1</span>
                            <button onclick="updateModalQuantity(1)" class="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white active:scale-90 transition-transform shadow-md">
                                <span class="material-symbols-outlined text-sm">add</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Custom Instructions -->
                <div class="mb-4">
                    <label for="modal-instructions" class="block font-bold text-sm mb-3">Culinary Instructions (Ingredients, allergy notes, etc.)</label>
                    <textarea id="modal-instructions" class="w-full bg-surface-container-high border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium" rows="3" placeholder="e.g., No onions, extra spicy, etc."></textarea>
                </div>
            </div>

            <!-- Modal Footer (Fixed) -->
            <div class="p-6 pt-2 bg-white border-t border-surface-container-high flex-shrink-0">
                <button id="add-to-basket-btn" onclick="confirmAddToBasket()" class="soulful-gradient w-full py-4 rounded-full text-white font-label font-bold text-sm uppercase tracking-widest active:scale-[0.98] transition-transform shadow-xl flex items-center justify-center gap-3">
                    Confirm Selection
                    <span class="material-symbols-outlined text-lg">restaurant</span>
                </button>
            </div>
        </div>
    </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = modalHTML.trim();
    document.body.appendChild(div.firstChild);
}

/**
 * Injects the Mobile Navigation Drawer into the DOM
 */
function injectNavigationDrawer() {
    if (document.getElementById('mobile-menu-drawer')) return;

    const drawerHTML = `
    <div id="mobile-menu-drawer" class="fixed inset-0 z-[110] hidden active:scale-100 transition-all duration-300">
        <div id="menu-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300 pointer-events-none" onclick="toggleMenu()"></div>
        <div id="menu-content" class="absolute top-0 left-0 h-full w-[280px] bg-white shadow-2xl -translate-x-full transition-transform duration-500 flex flex-col">
            <div class="p-6 border-b border-surface-container-high flex items-center justify-between">
                <img src="logo.png" alt="MaadBuka Logo" class="h-8 object-contain">
                <button onclick="toggleMenu()" class="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-slate-800">
                    <span class="material-symbols-outlined text-sm">close</span>
                </button>
            </div>
            <div class="flex-grow p-6 overflow-y-auto">
                <nav class="flex flex-col gap-6">
                    <a href="index.html" class="flex items-center gap-4 text-slate-900 font-bold hover:text-primary transition-colors">
                        <span class="material-symbols-outlined">home</span>
                        Explore
                    </a>
                    <a href="shop.html" class="flex items-center gap-4 text-slate-900 font-bold hover:text-primary transition-colors">
                        <span class="material-symbols-outlined">restaurant_menu</span>
                        Our Menu
                    </a>
                    <hr class="border-surface-container-high">
                    <a href="about.html" class="flex items-center gap-4 text-slate-600 font-medium hover:text-primary transition-colors">
                        <span class="material-symbols-outlined">info</span>
                        About Us
                    </a>
                    <a href="contact.html" class="flex items-center gap-4 text-slate-600 font-medium hover:text-primary transition-colors">
                        <span class="material-symbols-outlined">mail</span>
                        Contact Us
                    </a>
                    <a href="terms.html" class="flex items-center gap-4 text-slate-600 font-medium hover:text-primary transition-colors">
                        <span class="material-symbols-outlined">shield_person</span>
                        Terms & Conditions
                    </a>
                    <a href="refund.html" class="flex items-center gap-4 text-slate-600 font-medium hover:text-primary transition-colors">
                        <span class="material-symbols-outlined">assignment_return</span>
                        Refund Policy
                    </a>
                    <a href="track.html" class="flex items-center gap-4 text-slate-900 font-bold hover:text-primary transition-colors mt-4">
                        <span class="material-symbols-outlined text-primary">local_shipping</span>
                        Track Order
                    </a>
                </nav>
            </div>
            <div class="p-6 border-t border-surface-container-high">
                <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest text-center">Fire & Flavor Since 2024</p>
            </div>
        </div>
    </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = drawerHTML.trim();
    document.body.appendChild(div.firstChild);
}

function toggleMenu() {
    const drawer = document.getElementById('mobile-menu-drawer');
    const backdrop = document.getElementById('menu-backdrop');
    const content = document.getElementById('menu-content');

    if (drawer.classList.contains('hidden')) {
        drawer.classList.remove('hidden');
        setTimeout(() => {
            backdrop.classList.add('opacity-100');
            backdrop.classList.remove('pointer-events-none');
            content.classList.remove('-translate-x-full');
        }, 10);
        document.body.style.overflow = 'hidden';
    } else {
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('pointer-events-none');
        content.classList.add('-translate-x-full');
        setTimeout(() => {
            drawer.classList.add('hidden');
            document.body.style.overflow = '';
        }, 500);
    }
}
