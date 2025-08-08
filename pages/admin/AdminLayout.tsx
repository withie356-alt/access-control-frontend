
import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { HomeIcon, CheckBadgeIcon, BuildingOfficeIcon, ClipboardDocumentListIcon, ChevronRightIcon, Bars3Icon, XMarkIcon, UsersIcon } from '../../components/icons';

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbMap: { [key: string]: string } = {
        admin: '관리자',
        dashboard: '대시보드',
        approvals: '출입 승인 관리',
        projects: '공사 관리',
        companies: '업체 관리',
        departments: '담당부서 관리'
    };


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white text-gray-800 flex-col shadow-lg">
        <div className="h-16 flex items-center justify-center border-b">
           <div className="flex items-center space-x-2">
                <img src="/with-incheon-energy-icon.png" alt="위드인천에너지 로고" className="h-8 w-8" />
                <span className="text-xl font-bold text-power-blue-800">관리자 시스템</span>
            </div>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <SidebarLink to="/admin/dashboard" icon={<HomeIcon className="w-5 h-5" />}>대시보드</SidebarLink>
          <SidebarLink to="/admin/approvals" icon={<CheckBadgeIcon className="w-5 h-5" />}>출입 승인 관리</SidebarLink>
          <SidebarLink to="/admin/projects" icon={<ClipboardDocumentListIcon className="w-5 h-5" />}>공사 관리</SidebarLink>
          <SidebarLink to="/admin/companies" icon={<BuildingOfficeIcon className="w-5 h-5" />}>업체 관리</SidebarLink>
          <SidebarLink to="/admin/departments" icon={<UsersIcon className="w-5 h-5" />}>담당부서 관리</SidebarLink>
        </nav>
        <div className="p-4 border-t">
          <NavLink to="/" className="text-sm text-gray-600 hover:text-power-blue-700">사용자 홈으로</NavLink>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative flex w-64 bg-white text-gray-800 flex-col shadow-lg">
            <div className="h-16 flex items-center justify-between px-4 border-b">
               <div className="flex items-center space-x-2">
                    <img src="/with-incheon-energy-icon.png" alt="위드인천에너지 로고" className="h-6 w-6" />
                    <span className="text-lg font-bold text-power-blue-800">관리자 시스템</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
              <MobileSidebarLink to="/admin/dashboard" icon={<HomeIcon className="w-5 h-5" />} onClick={() => setIsMobileMenuOpen(false)}>대시보드</MobileSidebarLink>
              <MobileSidebarLink to="/admin/approvals" icon={<CheckBadgeIcon className="w-5 h-5" />} onClick={() => setIsMobileMenuOpen(false)}>출입 승인 관리</MobileSidebarLink>
              <MobileSidebarLink to="/admin/projects" icon={<ClipboardDocumentListIcon className="w-5 h-5" />} onClick={() => setIsMobileMenuOpen(false)}>공사 관리</MobileSidebarLink>
              <MobileSidebarLink to="/admin/companies" icon={<BuildingOfficeIcon className="w-5 h-5" />} onClick={() => setIsMobileMenuOpen(false)}>업체 관리</MobileSidebarLink>
              <MobileSidebarLink to="/admin/departments" icon={<UsersIcon className="w-5 h-5" />} onClick={() => setIsMobileMenuOpen(false)}>담당부서 관리</MobileSidebarLink>
            </nav>
            <div className="p-4 border-t">
              <NavLink to="/" className="text-sm text-gray-600 hover:text-power-blue-700" onClick={() => setIsMobileMenuOpen(false)}>사용자 홈으로</NavLink>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 sm:h-16 bg-white border-b flex justify-between items-center px-2 sm:px-4 lg:px-6">
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
            
            {/* Desktop Breadcrumb */}
            <div className="hidden sm:block">
                 <ol className="flex items-center space-x-2 text-sm text-gray-500">
                     <li>
                         <NavLink to="/admin" className="hover:text-power-blue-600">
                             <HomeIcon className="h-4 w-4" />
                         </NavLink>
                     </li>
                     {pathnames.slice(1).map((value, index) => {
                         const to = `/admin/${pathnames.slice(1, index + 2).join('/')}`;
                         const isLast = index === pathnames.length - 2;
                         return (
                             <li key={to} className="flex items-center space-x-2">
                                 <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                                 {isLast ? (
                                     <span className="font-medium text-gray-700">{breadcrumbMap[value]}</span>
                                 ) : (
                                     <NavLink to={to} className="hover:text-power-blue-600">{breadcrumbMap[value]}</NavLink>
                                 )}
                             </li>
                         );
                     })}
                 </ol>
            </div>
            
            {/* Mobile Page Title */}
            <div className="sm:hidden flex-1 text-center">
              <span className="text-lg font-semibold text-gray-800">
                {breadcrumbMap[pathnames[pathnames.length - 1]] || '관리자'}
              </span>
            </div>
            
            <div>
                {/* User profile, notifications, etc. */}
            </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-2 sm:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, children }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
          isActive
            ? 'bg-power-blue-100 text-power-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      {children}
    </NavLink>
  );
};

interface MobileSidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}

const MobileSidebarLink: React.FC<MobileSidebarLinkProps> = ({ to, icon, children, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ${
          isActive
            ? 'bg-power-blue-100 text-power-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      {children}
    </NavLink>
  );
};

export default AdminLayout;
