import { Bell, ChevronDown, Database, LogOut, Menu, Settings, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Header({ setSidebarOpen, sidebarOpen, currentPageDetails, setShowNotifications, showNotifications, setShowProfileMenu, showProfileMenu }) {
    const [currentUser, setCurrentUser] = useState();

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    // Set up axios defaults
    useEffect(() => {
        axios.defaults.baseURL = API_BASE_URL;
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        getAdminData();
    }, []);

    const getAdminData = async () => {
        try {
            const response = await axios.get('/auth/profile');

            if (response.data.success && response.data.user) {
                const user = response.data.user;
                console.log(response.data);

                setCurrentUser(user);
            } else {
                throw new Error('Failed to load user data');
            }
        } catch (error) {
            console.error('Error response:', error.response?.data);
        }
    };

    const handleLogout = ()=>{
        localStorage.removeItem('authToken');
        window.location.href = '/signin';
    }

    return (
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm z-30 flex-shrink-0">
            <div className="px-4 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Left Section */}
                    <div className="flex items-center space-x-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Logo for Mobile */}
                        <div className="lg:hidden flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                                <Database className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-gray-800">Portfolio Admin</span>
                        </div>

                        {/* Page Title for Desktop */}
                        <div className="hidden lg:block">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent capitalize">
                                {currentPageDetails.title}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {currentPageDetails.description}
                            </p>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-4">

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                            >
                                <Bell className="w-5 h-5" />
                                {/* <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                                    </div>
                                    <div className="px-4 py-8 text-center text-gray-500">
                                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                        <p>No new notifications</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-800">{currentUser?.firstName || currentUser?.lastName
                                        ? `${currentUser.firstName || ''}${currentUser.lastName ? ` ${currentUser.lastName}` : ''}`.trim()
                                        : 'Admin'} </p>
                                    <p className="text-xs text-gray-500">
                                        {currentUser?.role === 'admin' ? 'Admin' :
                                            currentUser?.role === 'superadmin' ? 'Super Admin' :
                                                currentUser?.role || 'User'}
                                    </p>

                                </div>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {/* Profile Dropdown */}
                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="font-semibold text-gray-800">{currentUser?.firstName || currentUser?.lastName
                                            ? `${currentUser.firstName || ''}${currentUser.lastName ? ` ${currentUser.lastName}` : ''}`.trim()
                                            : 'Admin'
                                        }
                                        </p>
                                        <p className="text-sm text-gray-500">{currentUser?.email || ''}</p>
                                    </div>

                                    <div className="py-2">
                                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                                            <User className="w-4 h-4" />
                                            <span>Profile Settings</span>
                                        </button>
                                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                                            <Settings className="w-4 h-4" />
                                            <span>Preferences</span>
                                        </button>
                                    </div>

                                    <div className="border-t border-gray-100 py-2">
                                        <button 
                                        onClick={handleLogout}
                                        className="w-full cursor-pointer px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                                            
                                            <LogOut className="w-4 h-4" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>

    )
}
export default Header;