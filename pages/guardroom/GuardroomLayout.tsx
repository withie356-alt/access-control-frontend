import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { HomeIcon, ChevronRightIcon } from '../../components/icons';

const GuardroomLayout: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbMap: { [key: string]: string } = {
    'guardroom': '경비실',
    'dashboard': '대시보드',
    'qr-scanner': 'QR입력',
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/with-incheon-energy-icon.png" alt="위드인천에너지 로고" className="h-6 sm:h-8 w-6 sm:w-8" />
              <span className="text-base sm:text-xl font-bold text-power-blue-800 truncate">경비실 시스템</span>
            </Link>

            <div className="flex items-center space-x-1 lg:space-x-2">
              <Link
                to="/guardroom/dashboard"
                className={`px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/guardroom/dashboard' ? 'text-power-blue-700 bg-power-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                대시보드
              </Link>
              <Link
                to="/guardroom/qr-scanner"
                className={`px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/guardroom/qr-scanner' ? 'text-power-blue-700 bg-power-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                QR입력
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <div className="bg-gray-50 border-b border-gray-200 sticky top-14 sm:top-16 z-40">
        <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-3">
          <ol className="flex items-center space-x-3 text-base sm:text-lg text-gray-500">
            <li>
              <Link to="/" className="hover:text-power-blue-600 flex items-center space-x-1">
                <HomeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="font-semibold">홈</span>
              </Link>
            </li>
            {pathnames.length > 0 && pathnames[0] === 'guardroom' && (
              <li className="flex items-center space-x-3">
                <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                {pathnames.length === 1 ? (
                  <span className="font-bold text-gray-700 text-base sm:text-lg">경비실 시스템</span>
                ) : (
                  <Link to="/guardroom/dashboard" className="hover:text-power-blue-600 font-semibold text-base sm:text-lg">경비실 시스템</Link>
                )}
              </li>
            )}
            {pathnames.slice(1).map((value, index) => {
              const to = `/guardroom/${pathnames.slice(1, index + 2).join('/')}`;
              const isLast = index === pathnames.length - 2;
              const breadcrumbName = breadcrumbMap[value] || value;
              return (
                <li key={to} className="flex items-center space-x-3">
                  <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                  {isLast ? (
                    <span className="font-bold text-gray-700 text-base sm:text-lg">{breadcrumbName}</span>
                  ) : (
                    <Link to={to} className="hover:text-power-blue-600 font-semibold text-base sm:text-lg">{breadcrumbName}</Link>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <main className="container mx-auto p-2 sm:p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default GuardroomLayout;