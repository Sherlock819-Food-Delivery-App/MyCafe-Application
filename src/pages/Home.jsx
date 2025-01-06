import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to FoodDelivery</h1>
      <p className="text-xl mb-8">Discover and order from the best restaurants in your area!</p>
      <Link to="/restaurants" className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors">
        Browse Restaurants
      </Link>
    </div>
  );
};

export default Home;

