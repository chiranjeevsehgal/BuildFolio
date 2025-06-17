import React, { useState, useEffect } from 'react';
import {
  Menu, Bell, Search, User, ChevronDown, Database, X,
  CheckCircle, AlertCircle, Settings, LogOut, Users, 
  Activity, Globe, Layout, TrendingUp, BarChart3, 
  Shield, MessageSquare, Download, RefreshCw, Grid, 
  List, Filter, Edit3, Ban, UserCheck, Send, ExternalLink,
  Mail, Calendar, MapPin, Clock, Briefcase, Eye,
  Zap
} from 'lucide-react';

// Sidebar Component
const Sidebar = ({ 
  isOpen, 
  onClose, 
  currentPage, 
  onPageChange,
  isMobile = false 
}) => {
  
  const sidebarItems = [
    // { 
    //   id: 'dashboard', 
    //   icon: BarChart3, 
    //   label: 'Dashboard', 
    //   description: 'Overview & Analytics' 
    // },
    { 
      id: 'users', 
      icon: Users, 
      label: 'Users', 
      description: 'Manage Users' 
    },
    // { 
    //   id: 'deployments', 
    //   icon: Globe, 
    //   label: 'Deployments', 
    //   description: 'Portfolio Deployments' 
    // },
    // { 
    //   id: 'templates', 
    //   icon: Layout, 
    //   label: 'Templates', 
    //   description: 'Manage Templates' 
    // },
    // { 
    //   id: 'notifications', 
    //   icon: Bell, 
    //   label: 'Notifications', 
    //   description: 'Send Messages' 
    // },
    // { 
    //   id: 'analytics', 
    //   icon: TrendingUp, 
    //   label: 'Analytics', 
    //   description: 'Platform Insights' 
    // },
    // { 
    //   id: 'settings', 
    //   icon: Settings, 
    //   label: 'Settings', 
    //   description: 'System Configuration' 
    // }
  ];

  const handleItemClick = (itemId) => {
    onPageChange(itemId);
    if (isMobile) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl border-r border-gray-200/60 shadow-2xl transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:z-40`}>
        
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="relative p-6 border-b border-gray-200/60">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  BuildFolio
                </h2>
                <p className="text-sm text-gray-500 font-medium">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="mb-6">
              
              
              {sidebarItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`group w-full flex items-center cursor-pointer justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/25 scale-105'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`relative ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Sidebar;