import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { cartAPI } from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentRestaurantId, setCurrentRestaurantId] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get();
      setCartItems(response.data?.cartItems || []);
      if (response.data?.cartItems?.length > 0) {
        setCurrentRestaurantId(response.data.restaurantId);
      } else {
        setCurrentRestaurantId(null);
      }
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
      const cartData = await cartAPI.addItem(item);
      console.log("Added cart data : ", cartData.data)
      if (cartData.data) {
        setCartItems(cartData.data.cartItems || []);
        setCurrentRestaurantId(cartData.data.restaurantId);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateCartItem = async (itemId, newQuantity) => {
    try {
      if (newQuantity === 0) {
        await cartAPI.removeItem(itemId);
        const updatedCart = await cartAPI.get();
        setCartItems(updatedCart.data?.cartItems || []);
        setCurrentRestaurantId(updatedCart.data?.restaurantId || null);
      } else {
        const cartData = await cartAPI.updateItem(itemId, newQuantity);
        console.log("Updated cart data : ", cartData.data)
        if (cartData.data) {
          setCartItems(cartData.data.cartItems || []);
          setCurrentRestaurantId(cartData.data.restaurantId);
        }
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCartItems([]);
      setCurrentRestaurantId(null);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
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
      refreshCart: fetchCart,
      currentRestaurantId
    }}>
      {children}
    </CartContext.Provider>
  );
}; 