import { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/sidebar';
import Header from '../../components/admin/header';


const AdminLayout = ({ children, currentPage, onPageChange }) => {

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Check if mobile screen
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const getPageDetails = (page) => {
        const pages = {
            dashboard: { title: 'Dashboard', description: 'Overview of your platform' },
            users: { title: 'Users', description: 'Manage and monitor users' },
            // deployments: { title: 'Deployments', description: 'Monitor portfolio deployments' },
            // templates: { title: 'Templates', description: 'Manage portfolio templates' },
            // notifications: { title: 'Notifications', description: 'Send notifications to users' },
            // analytics: { title: 'Analytics', description: 'Platform insights and metrics' },
            // settings: { title: 'Settings', description: 'System configuration' }
        };
        return pages[page] || { title: 'Admin', description: 'Admin Panel' };
    };

    const currentPageDetails = getPageDetails(currentPage);

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                currentPage={currentPage}
                onPageChange={onPageChange}
                isMobile={isMobile}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Navigation Bar */}
                <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    currentPageDetails={currentPageDetails}
                    setShowNotifications = {setShowNotifications}
                    showNotifications = {showNotifications}
                    setShowProfileMenu={setShowProfileMenu}
                    showProfileMenu={showProfileMenu}
                />

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>

            {/* Click outside to close dropdowns */}
            {(showNotifications || showProfileMenu) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowNotifications(false);
                        setShowProfileMenu(false);
                    }}
                />
            )}
        </div>
    );
};

export default AdminLayout;