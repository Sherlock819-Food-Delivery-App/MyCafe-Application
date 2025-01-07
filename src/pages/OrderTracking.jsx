import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { orderAPI } from '../services/api';

const OrderTracking = () => {
  const [orders, setOrders] = useState({});
  const [error, setError] = useState('');
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    let eventSource;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000;

    const setupSSE = () => {
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('Missing token');
        setError('Authentication error. Please sign in again.');
        return;
      }

      try {
        // First fetch existing orders
        const fetchOrders = async () => {
          try {
            const response = await orderAPI.get();
            const orderMap = {};
            response.data.forEach(order => {
              orderMap[order.orderId] = order.status;
            });
            setOrders(orderMap);
            retryCount = 0; // Reset retry count on successful fetch
          } catch (error) {
            console.error('Error fetching orders:', error);
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              console.log(`Retrying fetch (${retryCount}/${MAX_RETRIES})...`);
              setTimeout(fetchOrders, RETRY_DELAY);
            } else {
              setError('Unable to fetch orders. Please try again later.');
            }
          }
        };

        fetchOrders();

        // Set up SSE connection
        eventSource = new EventSource(
          `${orderAPI.getOrderUpdates()}?token=${token}`
        );
        
        // Handle initial connection
        eventSource.addEventListener('INIT', (event) => {
          console.log('SSE Connection established:', event.data);
          retryCount = 0; // Reset retry count on successful connection
        });

        // Handle order updates
        eventSource.addEventListener('ORDER_UPDATE', (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received order update:', data);
            if (data.orderId && data.status) {
              setOrders(prevOrders => ({
                ...prevOrders,
                [data.orderId]: data.status
              }));
            }
          } catch (err) {
            console.error('Error parsing SSE data:', err);
          }
        });

        eventSource.onerror = (error) => {
          console.error('SSE Error:', error);
          if (eventSource.readyState === EventSource.CLOSED) {
            console.log('Connection closed, attempting to reconnect...');
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              console.log(`Retrying SSE connection (${retryCount}/${MAX_RETRIES})...`);
              setTimeout(setupSSE, RETRY_DELAY);
            } else {
              setError('Connection lost. Please refresh the page to try again.');
            }
          }
        };

        // Setup push notifications with retry logic
        const initPushNotifications = async () => {
          try {
            await setupPushNotifications(token);
            retryCount = 0; // Reset retry count on successful setup
          } catch (error) {
            console.error('Push notification setup failed:', error);
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              console.log(`Retrying push notification setup (${retryCount}/${MAX_RETRIES})...`);
              setTimeout(initPushNotifications, RETRY_DELAY);
            }
          }
        };

        initPushNotifications();

      } catch (err) {
        console.error('Error setting up order tracking:', err);
        setError('Failed to setup order tracking');
      }
    };

    const setupPushNotifications = async (token) => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);

            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: 'YOUR_PUBLIC_KEY'
            });

            if (subscription) {
              const subscriptionData = {
                endpoint: subscription.endpoint,
                auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
                p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
                payload: JSON.stringify({
                  title: 'Order Update',
                  body: 'You will receive notifications for order updates'
                })
              };
              await orderAPI.subscribePushNotification(subscriptionData);
            }
          }
        } catch (error) {
          console.error('Service Worker/Push registration failed:', error);
        }
      }
    };

    setupSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isAuthenticated, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLACED': return 'bg-yellow-500';
      case 'PREPARING': return 'bg-blue-500';
      case 'PREPARED': return 'bg-green-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Order Tracking</h2>
      {Object.entries(orders).length === 0 ? (
        <p className="text-gray-600">No active orders</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(orders).map(([orderId, status]) => (
            <div key={orderId} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Order #{orderId}</h3>
                  <div className="flex items-center mt-2">
                    <span className={`${getStatusColor(status)} w-3 h-3 rounded-full mr-2`}></span>
                    <span className="text-gray-700">{status}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {/* Add any additional order actions here */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTracking; 