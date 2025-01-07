import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantAPI } from '../services/api';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await restaurantAPI.getAll();
        console.log('Restaurants data : ',response);
        setRestaurants(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch restaurants. Please try again.');
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((restaurant) => (
        <Link key={restaurant.id} to={`/menu/${restaurant.id}`} className="block">
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <img 
              src={restaurant.imageUrl || 'default-restaurant-image.jpg'} 
              alt={restaurant.name} 
              className="w-full h-48 object-cover" 
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
              <p className="text-gray-600 mb-2">{restaurant.cuisine}</p>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span>{restaurant.rating ? restaurant.rating.toFixed(1) : 'N/A'}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Restaurants;

