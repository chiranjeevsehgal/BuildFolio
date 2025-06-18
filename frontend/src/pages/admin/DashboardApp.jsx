import React, { useState, useEffect } from 'react';
import {
  Menu, Bell, Search, User, ChevronDown, Database, X,
  CheckCircle, AlertCircle, Settings, LogOut, Users, 
  Activity, Globe, Layout, TrendingUp, BarChart3, 
  Shield, MessageSquare, Download, RefreshCw, Grid, 
  List, Filter, Edit3, Ban, UserCheck, Send, ExternalLink,
  Mail, Calendar, MapPin, Clock, Briefcase, Eye
} from 'lucide-react';
import AdminLayout from './AdminDashboardLayout';
import UserManagement from '../../components/admin/UserManagement';

const AdminApp = () => {
  const [currentPage, setCurrentPage] = useState('users');

  const renderPage = () => {
    switch (currentPage) {
      case 'users':
        return <UserManagement />;
      // case 'dashboard':
      //   return (
      //     <div className="text-center py-20">
      //       <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      //       <h3 className="text-xl font-semibold text-gray-600">Dashboard Page</h3>
      //       <p className="text-gray-500">Create your dashboard component here</p>
      //     </div>
      //   );
      default:
        return (
          <div className="text-center py-20">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 capitalize">{currentPage} Page</h3>
            <p className="text-gray-500">Create your {currentPage} component here</p>
          </div>
        );
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </AdminLayout>
  );
};

export default AdminApp;