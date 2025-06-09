import React, { useState, useEffect } from 'react';
import {
  User,
  Palette,
  Globe,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Eye,
  Edit3,
  Crown,
  Bell,
  Home,
  FileText,
  Zap,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Check,
  CheckCheck,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import FeedbackModal from './FeedbackModal';

const Navbar = ({ current }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState();

  // Real notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationPage, setNotificationPage] = useState(1);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Set up axios defaults
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    getUserData();
  }, []);

  useEffect(() => {
    console.log(unreadCount);

  }, [unreadCount])

  const getUserData = async () => {
    try {
      const response = await axios.get('/auth/profile');

      if (response.data.success && response.data.user) {
        const user = response.data.user;
        setCurrentUser(user);
        console.log(user);
      } else {
        throw new Error('Failed to load user data');
      }
    } catch (error) {
      console.error('Error response:', error.response?.data);
    }
  };

  // Real notification functions
  const fetchNotifications = async (pageNum = 1, reset = false) => {
    try {
      setNotificationLoading(true);
      const response = await axios.get(`/notifications?page=${pageNum}&limit=10`);

      if (response.data.success) {
        const newNotifications = response.data.data.notifications;

        if (reset) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }
        console.log(response.data);

        setUnreadCount(response.data.data.unreadCount);
        setHasMoreNotifications(response.data.data.pagination.hasNext);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setNotificationLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/notifications/${notificationId}/read`);

      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, isRead: true, readAt: new Date() }
            : notification
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/notifications/read-all');

      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date()
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      default:
        return <Info className={`${iconClass} text-blue-500`} />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const loadMoreNotifications = () => {
    if (!notificationLoading && hasMoreNotifications) {
      const nextPage = notificationPage + 1;
      setNotificationPage(nextPage);
      fetchNotifications(nextPage, false);
    }
  };

  // Initialize notifications
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (isNotificationOpen && notifications.length === 0) {
      fetchNotifications(1, true);
    }
  }, [isNotificationOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsProfileOpen(false);
      setIsMenuOpen(false);
      setIsNotificationOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleFeedbackClick = (e) => {
    e.preventDefault();
    setIsFeedbackModalOpen(true);
  };

  const leftNavigation = [
    // { name: 'Portfolio', href: '/portfolio', icon: Globe, current: current === '/portfolio' },
  ];

  const userNavigation = [
    { name: 'Edit Profile', href: '/profile', icon: Edit3 },
    { name: 'View Portfolio', href: currentUser?.portfolioUrl, icon: Eye, external: true },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Sign out', href: '/logout', icon: LogOut },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Left Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href='/portfolio'>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    PortfolioPro
                  </h1>
                </div>
              </a>
            </div>

            {/* Left Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {leftNavigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${item.current
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {item.name}
                  </a>
                );
              })}

              {/* Portfolio Status */}
              {currentUser?.portfolioDeployed && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Portfolio is Live</span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Actions and User menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Templates Link */}
            <a
              href="/templates"
              className={`inline-flex items-center cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-slate-300 ${current === '/templates'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <Palette className="w-4 h-4 mr-2" />
              Templates
            </a>

            {/* Feedback Link */}
            <button
              onClick={handleFeedbackClick}
              className=" cursor-pointer text-slate-600 border-slate-300 border hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Feedback
            </button>

            {/* Real Notifications */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Real Notifications Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-slate-200 max-h-96 overflow-hidden z-50">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                        >
                          <CheckCheck className="w-4 h-4 mr-1" />
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setIsNotificationOpen(false)}
                        className="cursor-pointer text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">No notifications</p>
                      </div>
                    ) : (
                      <>
                        {notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={() => !notification.isRead && markAsRead(notification._id)}
                            className={`px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-l-4 ${notification.isRead
                              ? 'border-transparent bg-white'
                              : 'border-blue-500 bg-blue-50'
                              }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-slate-900' : 'text-slate-700'
                                      }`}>
                                      {notification.title}
                                    </h4>
                                    <p className="text-sm text-slate-600 mt-1">
                                      {notification.message}
                                    </p>

                                    {/* Action Button */}
                                    {notification.actionUrl && notification.actionText && (
                                      <a
                                        href={notification.actionUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {notification.actionText}
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                      </a>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-2 ml-2">
                                    <span className="text-xs text-slate-500">
                                      {formatTime(notification.createdAt)}
                                    </span>
                                    {!notification.isRead && (
                                      <button
                                        onClick={() => markAsRead(notification._id)}
                                        className="text-blue-600 hover:text-blue-700"
                                        title="Mark as read"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Load More Button */}
                        {hasMoreNotifications && (
                          <div className="p-4 text-center border-t">
                            <button
                              onClick={loadMoreNotifications}
                              disabled={notificationLoading}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center mx-auto"
                            >
                              {notificationLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Loading...
                                </>
                              ) : (
                                'Load more'
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="cursor-pointer flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  {/* Profile photo */}
                  {/* {currentUser?.profilePhoto ? (
                    <img
                      src={currentUser?.profilePhoto}
                      className="w-8 h-8 rounded-full object-cover"
                      alt="Profile"
                    />
                  ) : (
                    <img
                      src="https://res.cloudinary.com/dqwosfxu7/image/upload/v1749364926/Pngtree_avatar_placeholder_abstract_white_blue_6796235_ak8huu.png"
                      className="w-8 h-8 rounded-full object-cover"
                      alt="Default Profile"
                    />
                  )} */}
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {currentUser?.firstName?.[0]?.toUpperCase()}{currentUser?.lastName?.[0]?.toUpperCase()}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        {/* Profile photo */}
                        {/* {currentUser?.profilePhoto ? (
                          <img
                            src={currentUser?.profilePhoto}
                            className="w-10 h-10 rounded-full object-cover"
                            alt="Profile"
                          />
                        ) : (
                          <img
                            src="https://res.cloudinary.com/dqwosfxu7/image/upload/v1749364926/Pngtree_avatar_placeholder_abstract_white_blue_6796235_ak8huu.png"
                            className="w-10 h-10 rounded-full object-cover"
                            alt="Default Profile"
                          />
                        )} */}
                        <span className="text-white font-semibold text-base">
                          {currentUser?.firstName?.[0]?.toUpperCase()}{currentUser?.lastName?.[0]?.toUpperCase()}
                        </span>

                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {currentUser?.firstName} {currentUser?.lastName}
                        </p>
                        <p className="text-sm text-slate-500">{currentUser?.email}</p>
                        {currentUser?.selectedTemplate && (
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            {currentUser?.selectedTemplate.replace('-', ' ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    {userNavigation.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <a
                          key={item.name}
                          href={item.href}
                          target={item.external ? '_blank' : '_self'}
                          rel={item.external ? 'noopener noreferrer' : ''}
                          onClick={item.name === 'Sign out' ? handleLogout : undefined}
                          className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <IconComponent className="w-4 h-4 mr-3 text-slate-400" />
                          {item.name}
                          {item.external && <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Portfolio Link */}
            <a
              href="/portfolio"
              className={`flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors ${current === '/portfolio'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <Globe className="w-5 h-5 mr-3" />
              Portfolio
            </a>

            {/* Templates Link */}
            <a
              href="/templates"
              className={`flex items-center cursor-pointer px-3 py-2 rounded-lg text-base font-medium transition-colors ${current === '/templates'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <Palette className="w-5 h-5 mr-3" />
              Templates
            </a>

            {/* Feedback Link */}
            <button
              onClick={handleFeedbackClick}
              className="flex cursor-pointer items-center px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <FileText className="w-5 h-5 mr-3" />
              Feedback
            </button>

            {/* Notifications - Mobile */}
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="flex cursor-pointer items-center px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors w-full"
            >
              <Bell className="w-5 h-5 mr-3" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Portfolio Status - Mobile */}
          {currentUser?.portfolioDeployed && (
            <div className="px-2 pb-2">
              <div className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Portfolio is Live</span>
              </div>
            </div>
          )}

          {/* Mobile user section */}
          <div className="pt-4 pb-3 border-t border-slate-200">
            <div className="flex items-center px-4 space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                {/* Profile photo */}
                {/* {currentUser?.profilePhoto ? (
                  <img
                    src={currentUser.profilePhoto}
                    className="w-10 h-10 rounded-full object-cover"
                    alt="Profile"
                  />
                ) : (
                  <img
                    src="https://res.cloudinary.com/dqwosfxu7/image/upload/v1749364926/Pngtree_avatar_placeholder_abstract_white_blue_6796235_ak8huu.png"
                    className="w-10 h-10 rounded-full object-cover"
                    alt="Default Profile"
                  />
                )} */}
                <span className="text-white font-semibold text-base">
                  {currentUser?.firstName?.[0]?.toUpperCase()}{currentUser?.lastName?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-base font-medium text-slate-900">
                  {currentUser?.firstName} {currentUser?.lastName}
                </div>
                <div className="text-sm text-slate-500">{currentUser?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {userNavigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target={item.external ? '_blank' : '_self'}
                    rel={item.external ? 'noopener noreferrer' : ''}
                    onClick={item.name === 'Sign out' ? handleLogout : undefined}
                    className="flex items-center px-4 py-2 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  >
                    <IconComponent className="w-5 h-5 mr-3" />
                    {item.name}
                    {item.external && <ExternalLink className="w-4 h-4 ml-auto text-slate-400" />}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;