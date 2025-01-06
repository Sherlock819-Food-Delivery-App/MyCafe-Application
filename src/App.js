import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Restaurants from './pages/Restaurants';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/restaurants" element={<Restaurants />} />
                <Route path="/menu/:restaurantId" element={<Menu />} />
                <Route path="/cart" element={<Cart />} />
              </Routes>
            </main>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
