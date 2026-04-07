/**
 * Shop JS - UI Logic for the Shop/Search Page
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Initial UI state
    initShop();

    // Search interactivity
    const searchInput = document.getElementById('shop-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            handleSearch(query);
        });
    }

    // Category filters interactivity (Both sidebar and chips)
    const categoryFilters = document.querySelectorAll('.category-chip, .sidebar-item');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            const category = filter.getAttribute('data-category');
            currentCategory = category;

            // Update ALL filters with this category to active state
            categoryFilters.forEach(f => {
                const fCat = f.getAttribute('data-category');
                if (fCat === category) {
                    f.classList.add('active');
                    if (f.classList.contains('category-chip')) {
                        f.classList.remove('bg-surface-container-lowest', 'text-on-surface-variant');
                        f.classList.add('bg-primary', 'text-white');
                    }
                } else {
                    f.classList.remove('active');
                    if (f.classList.contains('category-chip')) {
                        f.classList.add('bg-surface-container-lowest', 'text-on-surface-variant');
                        f.classList.remove('bg-primary', 'text-white');
                    }
                }
            });
            
            filterByCategory(category);
        });
    });
});

let allProducts = [];
let allRestaurants = [];
let currentCategory = 'All';
let currentSearch = '';

async function initShop() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    console.log('Shop: Fetching data...');
    try {
        allProducts = await DataService.getProducts();
        allRestaurants = await DataService.getRestaurants();
        console.log(`Shop: Loaded ${allProducts.length} products and ${allRestaurants.length} restaurants.`);

        renderTrending();
        updateGrid();
    } catch (err) {
        console.error('Shop: Initialization failed:', err);
        grid.innerHTML = '<p class="col-span-2 text-center py-10 text-red-500">Failed to load menu data. Please refresh.</p>';
    }
}

function renderTrending() {
    const trendingGrid = document.getElementById('trending-grid');
    if (!trendingGrid) return;

    // Just pick top 4 products for trending
    const trending = allProducts.slice(0, 4);
    
    trendingGrid.innerHTML = trending.map(p => `
        <div class="flex-shrink-0 w-40 bg-white rounded-xl shadow-sm border border-slate-100 p-2 group transition-all hover:shadow-md cursor-pointer" onclick='openProductModal(${JSON.stringify(p).replace(/'/g, "&apos;")})'>
            <div class="relative w-full aspect-square rounded-lg overflow-hidden mb-2">
                <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${p.name}"/>
                <div class="absolute top-1 right-1 bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-sm">
                    <span class="material-symbols-outlined text-[14px] text-orange-500 fill-current">star</span>
                </div>
            </div>
            <h4 class="font-bold text-[11px] md:text-xs line-clamp-1 text-slate-800">${p.name}</h4>
            <div class="flex justify-between items-center mt-1">
                <span class="font-headline font-extrabold text-sm text-primary">₦${p.price.toLocaleString()}</span>
                <div class="w-6 h-6 rounded-full bg-surface-container-low text-primary flex items-center justify-center active:scale-90 transition-transform group-hover:bg-primary group-hover:text-white">
                    <span class="material-symbols-outlined text-[14px]">visibility</span>
                </div>
            </div>
        </div>
    `).join('');
}

function handleSearch(query) {
    currentSearch = query;
    updateGrid();
}

function filterByCategory(category) {
    currentCategory = category;
    const title = document.getElementById('main-grid-title');
    if (title) title.textContent = category === 'All' ? 'All Selections' : `${category} Selections`;
    updateGrid();
}

function updateGrid() {
    const grid = document.getElementById('product-grid');
    const countEl = document.getElementById('item-count');
    if (!grid) return;

    let filtered = allProducts;

    // Filter by Category
    if (currentCategory !== 'All') {
        filtered = filtered.filter(p => {
            // Check if product has an explicit category field
            if (p.category && p.category === currentCategory) return true;
            
            // Otherwise, look up its restaurant's cuisine
            const restaurant = allRestaurants.find(r => r.id === p.restaurant_id);
            return restaurant && restaurant.cuisine === currentCategory;
        });
    }

    // Filter by Search Query
    if (currentSearch) {
        const query = currentSearch.toLowerCase();
        filtered = filtered.filter(p => {
            const nameMatch = p.name ? p.name.toLowerCase().includes(query) : false;
            const descMatch = p.description ? p.description.toLowerCase().includes(query) : false;
            const catMatch = p.category ? p.category.toLowerCase().includes(query) : false;
            
            // Also match against restaurant name or cuisine
            const restaurant = allRestaurants.find(r => r.id === p.restaurant_id);
            const restMatch = restaurant ? 
                (restaurant.name.toLowerCase().includes(query) || restaurant.cuisine.toLowerCase().includes(query)) : false;
            
            return nameMatch || descMatch || catMatch || restMatch;
        });
    }

    if (countEl) countEl.textContent = `${filtered.length} items`;

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-2 py-20 flex flex-col items-center justify-center text-on-surface-variant">
                <span class="material-symbols-outlined text-4xl mb-3 opacity-30">restaurant_menu</span>
                <p class="text-sm font-medium">No dishes found matching your criteria.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(p => `
        <div class="product-card bg-surface-container-lowest rounded-DEFAULT p-3 flex flex-col gap-3 group animate-in fade-in slide-in-from-bottom-4 duration-500 cursor-pointer shadow-sm border border-surface-container-high" onclick='openProductModal(${JSON.stringify(p).replace(/'/g, "&apos;")})'>
            <div class="relative aspect-square rounded-2xl overflow-hidden bg-surface-container-low">
                <img alt="${p.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="${p.image}"/>
            </div>
            <div class="flex flex-col gap-1 justify-between flex-grow">
                <div>
                    <h4 class="font-label font-bold text-[13px] md:text-sm line-clamp-1 text-primary">${p.name}</h4>
                    <p class="text-[9px] md:text-[10px] text-on-surface-variant line-clamp-1 mt-0.5 italic">${p.description}</p>
                </div>
                <div class="flex items-center justify-between mt-2">
                    <span class="font-headline font-extrabold text-lg text-primary">₦${p.price.toLocaleString()}</span>
                    <div class="w-8 h-8 rounded-full bg-surface-container-low text-primary flex items-center justify-center active:scale-95 transition-transform shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                        <span class="material-symbols-outlined text-[18px]">visibility</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}
