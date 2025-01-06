import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { NotificationContext } from '../contexts/NotificationContext';

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const notificationContext = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <nav className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">FoodDelivery</Link>
        <div className="flex items-center space-x-4">
          <Link to="/restaurants" className="hover:text-blue-200">Restaurants</Link>
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {notificationContext?.notifications?.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notificationContext.notifications.length}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="hover:text-blue-200">Profile</Link>
              <button onClick={handleLogout} className="hover:text-blue-200">
                Logout
              </button>
            </>
          ) : (
            <Link to="/signin" className="hover:text-blue-200">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

