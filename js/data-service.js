/**
 * DataService - Handles fetching JSON data for EasyShop
 */
const DataService = {
  /**
   * Fetches restaurants from the JSON file
   * @returns {Promise<Array>}
   */
  async getRestaurants() {
    try {
      const response = await fetch('data/restaurants.json');
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      return await response.json();
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      return [];
    }
  },

  /**
   * Fetches products from the JSON file
   * @returns {Promise<Array>}
   */
  async getProducts() {
    try {
      const response = await fetch('data/products.json');
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  /**
   * Fetches products for a specific restaurant
   * @param {number} restaurantId
   * @returns {Promise<Array>}
   */
  async getProductsByRestaurant(restaurantId) {
    const allProducts = await this.getProducts();
    return allProducts.filter(p => p.restaurant_id === restaurantId);
  }
};

/**
 * BasketService - Handles the shopping basket state using localStorage
 */
const BasketService = {
  getBasket() {
    const basket = localStorage.getItem('easyshop_basket');
    return basket ? JSON.parse(basket) : [];
  },

  saveBasket(basket) {
    localStorage.setItem('easyshop_basket', JSON.stringify(basket));
    // Dispatch a custom event so other components can react to basket changes
    window.dispatchEvent(new CustomEvent('basketUpdated', { detail: basket }));
  },

  addToBasket(product, quantity = 1, customizations = '') {
    const basket = this.getBasket();
    // For gourmet personalization, we only group if the product AND customizations are identical
    const existingItem = basket.find(item => item.id === product.id && item.customizations === customizations);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      basket.push({ 
        ...product, 
        quantity: quantity, 
        customizations: customizations,
        addedAt: Date.now() 
      });
    }
    this.saveBasket(basket);
  },

  removeFromBasket(productId, customizations = null) {
    let basket = this.getBasket();
    const item = basket.find(item => 
        item.id === productId && (customizations === null || item.customizations === customizations)
    );
    if (item && item.quantity > 1) {
      item.quantity -= 1;
    } else {
      basket = basket.filter(item => item.id !== productId);
    }
    this.saveBasket(basket);
  },

  clearBasket() {
    this.saveBasket([]);
  },

  getBasketTotal() {
    const basket = this.getBasket();
    return basket.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getBasketCount() {
    const basket = this.getBasket();
    return basket.reduce((count, item) => count + item.quantity, 0);
  }
};
