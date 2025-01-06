import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await axios.get('/api/cart', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCartItems(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch cart. Please try again.');
        setLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated, navigate]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      await axios.put(`/api/cart/${itemId}`, { quantity: newQuantity }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      setError('Failed to update quantity. Please try again.');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await axios.delete(`/api/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error) {
      setError('Failed to remove item. Please try again.');
    }
  };

  const handlePlaceOrder = async () => {
    try {
      await axios.post('/api/orders', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCartItems([]);
      navigate('/orders');
    } catch (error) {
      setError('Failed to place order. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-600">${item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="bg-gray-200 text-gray-800 px-2 py-1 rounded"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="bg-gray-200 text-gray-800 px-2 py-1 rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
            <button
              onClick={handlePlaceOrder}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Place Order
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;

