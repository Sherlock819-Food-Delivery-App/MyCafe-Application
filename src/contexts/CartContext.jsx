import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { cartAPI } from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useContext(AuthContext);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get();
      setCartItems(response.data?.cartItems || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addToCart = async (item) => {
    try {
      await cartAPI.addItem(item);
      setCartItems(prev => [...prev, { ...item, itemId: item.itemId }]);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateCartItem = async (itemId, newQuantity) => {
    try {
      if (newQuantity === 0) {
        await cartAPI.removeItem(itemId);
        setCartItems(prev => prev.filter(item => item.itemId !== itemId));
      } else {
        await cartAPI.updateItem(itemId, newQuantity);
        setCartItems(prev => 
          prev.map(item => 
            item.itemId === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      cartCount,
      loading,
      addToCart, 
      updateCartItem,
      clearCart,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
}; 