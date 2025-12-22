import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  Star,
} from 'lucide-react';
import axios from 'axios';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  activeOrders: number;
  todayOrders: number;
  rating: number;
  pendingOrders: number;
}

const RestaurantDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    activeOrders: 0,
    todayOrders: 0,
    rating: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsRes, ordersRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/restaurant/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/restaurant/orders/recent`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats(statsRes.data.data);
      setRecentOrders(ordersRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      trend: '+12.5%',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      trend: '+8.2%',
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      icon: Clock,
      color: 'bg-orange-500',
      trend: `${stats.pendingOrders} pending`,
    },
    {
      title: 'Average Rating',
      value: stats.rating.toFixed(1),
      icon: Star,
      color: 'bg-yellow-500',
      trend: `${stats.todayOrders} today`,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Restaurant Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your orders and track performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`${card.color} p-3 rounded-lg text-white`}
                >
                  <card.icon size={24} />
                </div>
                <span className="text-sm font-medium text-green-600">
                  {card.trend}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {card.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {card.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Orders
            </h2>
            <button className="text-green-600 hover:text-green-700 font-medium">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Items
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm">
                        #{order._id.slice(-8)}
                      </span>
                    </td>
                    <td className="py-3 px-4">{order.customer?.name}</td>
                    <td className="py-3 px-4">{order.items.length}</td>
                    <td className="py-3 px-4">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'preparing'
                            ? 'bg-orange-100 text-orange-800'
                            : order.status === 'ready'
                            ? 'bg-purple-100 text-purple-800'
                            : order.status === 'on_the_way'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-green-600 hover:text-green-700 font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
