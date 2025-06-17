import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, User, X, Users, Download, RefreshCw, Grid, List, Edit3,
  Ban, Send, ExternalLink, CheckCircle, Clock, AlertCircle, UserCheck,
  Mail, Calendar, MapPin, Globe, Briefcase, Crown, Star, Loader2
} from 'lucide-react';
import UserModal from './UserModal';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubscription, setFilterSubscription] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    deployedPortfolios: 0,
    premiumUsers: 0
  });
  const [message, setMessage] = useState({ type: '', content: '' });

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Setup axios defaults
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';

    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [API_BASE_URL]);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/users');

      if (response.data.success) {
        console.log(response.data);

        setUsers(response.data.users || []);
        setStats({
          totalUsers: response.data.stats?.totalUsers || response.data.users?.length || 0,
          activeUsers: response.data.stats?.activeUsers || response.data.users?.filter(u => u.isActive).length || 0,
          deployedPortfolios: response.data.stats?.deployedPortfolios || response.data.users?.filter(u => u.portfolioDeployed).length || 0,
          premiumUsers: response.data.stats?.premiumUsers || response.data.users?.filter(u => u.subscriptionType === 'premium').length || 0
        });
        // setMessage({ type: 'success', content: 'Users loaded successfully' });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Failed to fetch users'
      });
    } finally {
      setLoading(false);
    }
  };

  // Update user status
  const updateUserStatus = async (userId, action) => {
    try {
      const response = await axios.patch(`/api/admin/users/${userId}`, { action });

      if (response.data.success) {
        setMessage({ type: 'success', content: `User ${action}d successfully` });
        fetchUsers(); // Refresh users list
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      setMessage({
        type: 'error',
        content: error.response?.data?.message || `Failed to ${action} user`
      });
    }
  };

  // Bulk update users
  const bulkUpdateUsers = async (userIds, action) => {
    try {
      const response = await axios.patch('/api/admin/users/bulk', { userIds, action });

      if (response.data.success) {
        setMessage({ type: 'success', content: `${userIds.length} users ${action}d successfully` });
        setSelectedUsers([]);
        fetchUsers();
      }
    } catch (error) {
      console.error(`Error bulk ${action} users:`, error);
      setMessage({
        type: 'error',
        content: error.response?.data?.message || `Failed to ${action} users`
      });
    }
  };

  // Export users
  const exportUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users/export', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage({ type: 'success', content: 'Users exported successfully' });
    } catch (error) {
      console.error('Error exporting users:', error);
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Failed to export users'
      });
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Auto-dismiss messages
  useEffect(() => {
    if (message.content) {
      const timer = setTimeout(() => {
        setMessage({ type: '', content: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message.content]);

  // Filter users based on current filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && user.isActive === true && !user.suspend) ||
      (filterStatus === 'inactive' && user.isActive === false && !user.suspend) ||
      (filterStatus === 'suspended' && user.suspend === true);
    const matchesSubscription = filterSubscription === 'all' || user.subscriptionType === filterSubscription;

    return matchesSearch && matchesStatus && matchesSubscription;
  });

  // Helper functions
  const getStatusConfig = (isActive) => {
    switch (isActive) {
      case true:
        return { color: 'text-green-700 bg-green-100 border-green-200', icon: CheckCircle, label: 'Active' };
      case false:
        return { color: 'text-red-700 bg-red-100 border-red-200', icon: Ban, label: 'Inactive' };
      case 'suspended':
        return { color: 'text-red-700 bg-red-100 border-red-200', icon: Ban, label: 'Suspended' };
      default:
        return { color: 'text-gray-700 bg-gray-100 border-gray-200', icon: AlertCircle, label: 'Unknown' };
    }
  };

  const getSubscriptionBadge = (subscription) => {
    switch (subscription) {
      case 'premium':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'free':
        return 'bg-gray-200 text-gray-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };



  return (
    <div className="space-y-6">
      {/* Message Toast */}
      {message.content && (
        <div className={`fixed top-4 right-4 z-50 rounded-2xl p-4 flex items-center space-x-3 shadow-2xl backdrop-blur-sm max-w-sm transform transition-all duration-300 ${message.type === 'success'
          ? 'bg-green-500/90 text-white'
          : message.type === 'error'
            ? 'bg-red-500/90 text-white'
            : 'bg-blue-500/90 text-white'
          }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{message.content}</span>
          <button
            onClick={() => setMessage({ type: '', content: '' })}
            className="ml-2 text-white/80 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">User Management</h1>
              <p className="text-blue-100 text-lg">Manage and monitor all platform users</p>
            </div>
            <div className="hidden lg:block">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-blue-100 text-sm">Total Users</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <div className="text-blue-100 text-sm">Active Users</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.deployedPortfolios}</div>
              <div className="text-blue-100 text-sm">Deployed</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.premiumUsers}</div>
              <div className="text-blue-100 text-sm">Premium Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 cursor-pointer bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={filterSubscription}
              onChange={(e) => setFilterSubscription(e.target.value)}
              className="px-4 py-3 cursor-pointer bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          {/* Actions and View Mode */}
          <div className="flex items-center space-x-4">
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedUsers.length} selected</span>
                <button
                  onClick={() => bulkUpdateUsers(selectedUsers, 'activate')}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Activate
                </button>
                <button
                  onClick={() => bulkUpdateUsers(selectedUsers, 'suspend')}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Suspend
                </button>
              </div>
            )}

            <button
              onClick={exportUsers}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 cursor-pointer bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer duration-200 ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white/50'
                  }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all cursor-pointer duration-200 ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-white/50'
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading users...</p>
        </div>
      ) : (
        <>
          {filteredUsers.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No users found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' || filterSubscription !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No users have signed up yet'}
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsers.map((user) => {
                    const statusConfig = getStatusConfig(user.isActive);
                    const StatusIcon = statusConfig.icon;
                    const isSelected = selectedUsers.includes(user._id);

                    return (
                      <div
                        key={user._id}
                        className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl cursor-pointer ${isSelected ? 'border-blue-500 ring-2 ring-blue-200/50' : 'border-white/50 hover:border-gray-200'
                          } transform hover:scale-[1.02]`}
                      >
                        <div className="p-6">
                          {/* User Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers(prev => [...prev, user._id]);
                                  } else {
                                    setSelectedUsers(prev => prev.filter(id => id !== user._id));
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>

                          {/* User Info */}
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{user.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : 'No Name'}</h3>
                            <p className="text-gray-600 text-sm mb-2">@{user.username}</p>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                          </div>

                          {/* Status and Subscription */}
                          <div className="flex items-center justify-between mb-4">
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg border text-xs font-medium ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              <span>{statusConfig.label}</span>
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getSubscriptionBadge(user.subscriptionType)}`}>
                              {user.subscriptionType?.charAt(0).toUpperCase() + user.subscriptionType?.slice(1)}
                            </div>
                          </div>

                          {/* User Stats */}
                          <div className="grid grid-cols-1 mb-4 text-center">

                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className={`text-lg font-bold ${user.portfolioDeployed ? 'text-green-600' : 'text-gray-400'}`}>
                                {user.portfolioDeployed ? 'Live' : 'Draft'}
                              </div>
                              <div className="text-xs text-gray-600">Portfolio</div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
                            >
                              View Details
                            </button>

                            {user.status === 'active' && (
                              <button
                                onClick={() => updateUserStatus(user._id, 'activate')}
                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* List View */
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/40 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50/80">
                        <tr>
                          <th className="px-6 py-4 text-left">
                            <input
                              type="checkbox"
                              checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers(filteredUsers.map(u => u._id));
                                } else {
                                  setSelectedUsers([]);
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">User</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Subscription</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Portfolio</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Last Active</th>
                          <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map((user) => {
                          const statusConfig = getStatusConfig(user.isActive);
                          const StatusIcon = statusConfig.icon;
                          const isSelected = selectedUsers.includes(user._id);

                          return (
                            <tr
                              key={user._id}
                              className={`hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''
                                }`}
                            >
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedUsers(prev => [...prev, user._id]);
                                    } else {
                                      setSelectedUsers(prev => prev.filter(id => id !== user._id));
                                    }
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {user.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : 'No Name'}
                                    </div>
                                    <div className="text-sm text-gray-500">@{user.username}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg border text-xs font-medium ${statusConfig.color}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  <span>{statusConfig.label}</span>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${getSubscriptionBadge(user.subscriptionType)}`}>
                                  {user.subscriptionType?.charAt(0).toUpperCase() + user.subscriptionType?.slice(1)}
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className={`text-sm font-medium ${user.portfolioDeployed ? 'text-green-600' : 'text-gray-500'}`}>
                                  {user.portfolioDeployed ? 'Live' : 'Draft'}
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                                </div>
                              </td>

                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowUserModal(true);
                                    }}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                    title="View Details"
                                  >
                                    <User className="w-4 h-4" />
                                  </button>

                                  {user.status === 'active' ? (
                                    <button
                                      onClick={() => updateUserStatus(user._id, 'suspend')}
                                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                      title="Suspend User"
                                    >
                                      <Ban className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => updateUserStatus(user._id, 'activate')}
                                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                      title="Activate User"
                                    >
                                      <UserCheck className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* User Detail Modal */}
      <UserModal
        user={selectedUser}
        isOpen={showUserModal}
        getStatusConfig={getStatusConfig}
        getSubscriptionBadge={getSubscriptionBadge}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
};

export default UserManagement;