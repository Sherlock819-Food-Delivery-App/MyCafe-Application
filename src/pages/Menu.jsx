import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { restaurantAPI } from '../services/api';
import { CartContext } from '../contexts/CartContext';
import ConfirmationModal from '../components/ConfirmationModal';

const Menu = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useContext(AuthContext);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showClearCartModal, setShowClearCartModal] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);
  const { 
    cartItems, 
    addToCart, 
    updateCartItem, 
    currentRestaurantId,
    clearCart 
  } = useContext(CartContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restaurantResponse, menuResponse] = await Promise.all([
          restaurantAPI.getById(restaurantId),
          restaurantAPI.getMenu(restaurantId)
        ]);
        
        setRestaurant(restaurantResponse.data);
        setMenuItems(menuResponse.data || []);
        
        // Initialize categories
        const categoryStates = {};
        menuResponse.data?.forEach(menu => {
          menu.categories?.forEach(category => {
            categoryStates[category.id] = true;
          });
        });
        setExpandedCategories(categoryStates);
        
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId, isAuthenticated]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getItemQuantityInCart = (itemId) => {
    const cartItem = cartItems.find(item => item.itemId === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = async (menuItem) => {
    if (!isAuthenticated) {
      return;
    }
    
    console.log('Current res : ', currentRestaurantId, '  New rest ID : ',restaurantId);
    
    // Force currentRestaurantId and restaurantId to be numbers for comparison
    const currentResId = Number(currentRestaurantId);
    const newResId = Number(restaurantId);
    
    if (!currentResId || currentResId === newResId) {
      try {
        await addToCart({
          restaurantId: newResId,
          itemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
        });
      } catch (error) {
        setError('Failed to add item to cart');
      }
    } else {
      console.log('Different restaurant detected. Current:', currentResId, 'New:', newResId);
      setPendingItem(menuItem);
      setShowClearCartModal(true);
    }
  };

  const handleUpdateCartQuantity = async (itemId, newQuantity) => {
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      setError('Failed to update cart');
    }
  };

  const handleConfirmClearCart = async () => {
    try {
      await clearCart();
      // Add a small delay to ensure cart is cleared before adding new item
      await new Promise(resolve => setTimeout(resolve, 100));
      if (pendingItem) {
        await addToCart({
          restaurantId: Number(restaurantId),
          itemId: pendingItem.id,
          name: pendingItem.name,
          price: pendingItem.price,
          quantity: 1,
        });
      }
    } catch (error) {
      setError('Failed to update cart');
    } finally {
      setShowClearCartModal(false);
      setPendingItem(null);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ConfirmationModal
        isOpen={showClearCartModal}
        message="Adding items from a different restaurant will clear your current cart. Do you want to continue?"
        onConfirm={handleConfirmClearCart}
        onCancel={() => {
          setShowClearCartModal(false);
          setPendingItem(null);
        }}
      />
      {restaurant && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{restaurant.name}</h2>
          <p className="text-gray-600 mb-2">{restaurant.description}</p>
          <div className="flex items-center">
            <span className="text-yellow-500 mr-1">★</span>
            <span>{restaurant.rating ? restaurant.rating.toFixed(1) : 'N/A'}</span>
          </div>
        </div>
      )}

      {menuItems.map((menu) => (
        <div key={menu.id} className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">{menu.name}</h3>
          
          {menu.categories?.map((category) => (
            <div key={category.id} className="mb-6">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between bg-gray-100 p-4 rounded-lg mb-2 hover:bg-gray-200"
              >
                <span className="text-xl font-medium">{category.name}</span>
                <span className="transform transition-transform">
                  {expandedCategories[category.id] ? '▼' : '▶'}
                </span>
              </button>
              
              {expandedCategories[category.id] && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items?.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <img 
                        src={item.imageUrl || 'default-food-image.jpg'} 
                        alt={item.name} 
                        className="w-full h-48 object-cover" 
                      />
                      <div className="p-4">
                        <h4 className="text-lg font-semibold mb-2">{item.name}</h4>
                        <p className="text-gray-600 mb-2">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">
                            ${item.price ? item.price.toFixed(2) : '0.00'}
                          </span>
                          {getItemQuantityInCart(item.id) > 0 ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleUpdateCartQuantity(
                                  item.id, 
                                  getItemQuantityInCart(item.id) - 1
                                )}
                                className="bg-gray-200 text-gray-800 px-3 py-1 rounded"
                              >
                                -
                              </button>
                              <span>{getItemQuantityInCart(item.id)}</span>
                              <button
                                onClick={() => handleUpdateCartQuantity(
                                  item.id, 
                                  getItemQuantityInCart(item.id) + 1
                                )}
                                className="bg-gray-200 text-gray-800 px-3 py-1 rounded"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Menu;

