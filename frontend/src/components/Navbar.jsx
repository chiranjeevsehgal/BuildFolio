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
  ExternalLink
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    profilePhoto: null,
    selectedTemplate: 'creative-portfolio',
    portfolioDeployed: true,
    portfolioUrl: 'https://mysite.com/johndoe'
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsProfileOpen(false);
      setIsMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: false },
    { name: 'Profile', href: '/profile', icon: User, current: false },
    { name: 'Templates', href: '/templates', icon: Palette, current: true },
    { name: 'Portfolio', href: '/portfolio', icon: Globe, current: false },
  ];

  const userNavigation = [
    { name: 'Edit Profile', href: '/profile', icon: Edit3 },
    { name: 'View Portfolio', href: currentUser.portfolioUrl, icon: Eye, external: true },
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
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  PortfolioPro
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      item.current
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {item.name}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right side - User menu and actions */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {/* Portfolio Status */}
            {currentUser.portfolioDeployed && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            )}

            {/* Notifications */}
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            {/* Quick Deploy Button */}
            <a
              href="/portfolio"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium text-sm flex items-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span>Deploy</span>
            </a>

            {/* Profile dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  {currentUser.profilePhoto ? (
                    <img
                      src={currentUser.profilePhoto}
                      alt={`${currentUser.firstName} ${currentUser.lastName}`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {currentUser.firstName[0]}{currentUser.lastName[0]}
                    </span>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-900">
                    {currentUser.firstName} {currentUser.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate max-w-32">
                    {currentUser.email}
                  </p>
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
                        {currentUser.profilePhoto ? (
                          <img
                            src={currentUser.profilePhoto}
                            alt={`${currentUser.firstName} ${currentUser.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-medium">
                            {currentUser.firstName[0]}{currentUser.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {currentUser.firstName} {currentUser.lastName}
                        </p>
                        <p className="text-sm text-slate-500">{currentUser.email}</p>
                        {currentUser.selectedTemplate && (
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            {currentUser.selectedTemplate.replace('-', ' ')}
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
          <div className="sm:hidden flex items-center">
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
        <div className="sm:hidden bg-white border-t border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    item.current
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  {item.name}
                </a>
              );
            })}
          </div>

          {/* Mobile user section */}
          <div className="pt-4 pb-3 border-t border-slate-200">
            <div className="flex items-center px-4 space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                {currentUser.profilePhoto ? (
                  <img
                    src={currentUser.profilePhoto}
                    alt={`${currentUser.firstName} ${currentUser.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-medium">
                    {currentUser.firstName[0]}{currentUser.lastName[0]}
                  </span>
                )}
              </div>
              <div>
                <div className="text-base font-medium text-slate-900">
                  {currentUser.firstName} {currentUser.lastName}
                </div>
                <div className="text-sm text-slate-500">{currentUser.email}</div>
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
    </nav>
  );
};

export default Navbar;