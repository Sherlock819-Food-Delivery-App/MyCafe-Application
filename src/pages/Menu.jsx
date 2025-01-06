import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { restaurantAPI, cartAPI } from '../services/api';

const Menu = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        const [restaurantResponse, menuResponse] = await Promise.all([
          restaurantAPI.getById(restaurantId),
          restaurantAPI.getMenu(restaurantId)
        ]);
        setRestaurant(restaurantResponse.data);
        setMenuItems(menuResponse.data || []);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch restaurant and menu. Please try again.');
        setLoading(false);
      }
    };

    fetchRestaurantAndMenu();
  }, [restaurantId]);

  const handleAddToCart = async (menuItem) => {
    if (!isAuthenticated) {
      // Redirect to sign in page or show a modal
      return;
    }
    try {
      await cartAPI.addItem({
        restaurantId,
        itemId: menuItem.id,
        name: menuItem.name,
        quantity: 1,
      });
      // Show a success message or update cart count
    } catch (error) {
      // Show an error message
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      {restaurant && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{restaurant.name}</h2>
          <p className="text-gray-600 mb-2">{restaurant.cuisine}</p>
          <div className="flex items-center">
            <span className="text-yellow-500 mr-1">★</span>
            <span>{restaurant.rating ? restaurant.rating.toFixed(1) : 'N/A'}</span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src={item.imageUrl || 'default-food-image.jpg'} 
              alt={item.name} 
              className="w-full h-48 object-cover" 
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-2">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">
                  ${item.price ? item.price.toFixed(2) : '0.00'}
                </span>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;

