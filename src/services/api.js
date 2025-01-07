import axios from 'axios';
import { API_BASE_URL, RESTAURANT_API_BASE_URL } from '../config/config';

console.log('API_BASE_URL:', API_BASE_URL);

// Create axios instance with default config
const user_api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const restaurant_api = axios.create({
    baseURL: RESTAURANT_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

// Add request logger interceptor
user_api.interceptors.request.use((config) => {
//   console.log('Config baseURL:', config.baseURL);
//   console.log('Config URL:', config.url);
//   console.log('Full URL:', `${config.baseURL}${config.url}`);
  return config;
});

// Add auth token to requests
user_api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  sendOTP: (email) => user_api.post('/user/auth/request-otp', { "email": email, "role": "USER" }),
  verifyOTP: (email, otp) => user_api.post('/user/auth/validate-otp', { email, otp }),
  signup: (userData) => user_api.post('/signup', userData),
  validateToken: () => user_api.get('/user/api/users/getUserProfile'),
  updateProfile: (userData) => user_api.put('/user/api/users/updateUserProfile', userData)
};

export const restaurantAPI = {
  getAll: () => restaurant_api.get('/restaurant/restaurant-management/restaurant/all'),
  getById: (id) => restaurant_api.get(`/restaurant/restaurant/${id}`),
  getMenu: (id) => restaurant_api.get(`/restaurant/restaurant/${id}/menu`)
};

export const cartAPI = {
  get: () => user_api.get('order/api/cart'),
  addItem: (data) => user_api.post('order/api/cart/items', data),
  updateItem: (itemId, quantity) => user_api.put(`order/api/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => user_api.delete(`order/api/cart/items/${itemId}`),
  placeOrder: () => user_api.post('order/api/orders')
};

export const orderAPI = {
  get: () => user_api.get('order/api/orders'),
  placeOrder: () => user_api.post('order/api/orders'),
  getOrderUpdates: () => `${API_BASE_URL}/order/api/order-events/subscribe`,
  subscribePushNotification: (subscription) => 
    user_api.post('order/api/push/subscribe', subscription)
};

export default user_api; 