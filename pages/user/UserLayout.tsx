
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { HomeIcon, ChevronRightIcon, Bars3Icon, XMarkIcon } from '../../components/icons';

const UserLayout: React.FC = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbMap: { [key: string]: string } = {
        apply: '출입 신청',
        check: '신청 내역 조회',
        safety: '안전 정보'
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <nav className="container mx-auto px-2 sm:px-4 lg:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        <Link to="/" className="flex items-center space-x-2">
                            <img src="/with-incheon-energy-icon.png" alt="위드인천에너지 로고" className="h-6 sm:h-8 w-6 sm:w-8" />
                            <span className="text-base sm:text-xl font-bold text-power-blue-800 truncate">현장 출입 관리</span>
                        </Link>
                        
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
                           <Link to="/apply" className={`px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname.includes('/apply') ? 'text-power-blue-700 bg-power-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}>출입 신청</Link>
                           <Link to="/check" className={`px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname.includes('/check') ? 'text-power-blue-700 bg-power-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}>신청 조회</Link>
                           <Link to="/safety" className={`px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname.includes('/safety') ? 'text-power-blue-700 bg-power-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}>안전 정보</Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="h-6 w-6" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" />
                            )}
                        </button>
                    </div>

                    {/* Mobile Navigation Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden border-t border-gray-200 bg-white">
                            <div className="py-2 space-y-1">
                                <Link 
                                    to="/apply" 
                                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${location.pathname.includes('/apply') ? 'text-power-blue-700 bg-power-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    출입 신청
                                </Link>
                                <Link 
                                    to="/check" 
                                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${location.pathname.includes('/check') ? 'text-power-blue-700 bg-power-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    신청 조회
                                </Link>
                                <Link 
                                    to="/safety" 
                                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${location.pathname.includes('/safety') ? 'text-power-blue-700 bg-power-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    안전 정보
                                </Link>
                            </div>
                        </div>
                    )}
                </nav>
            </header>
             <div className="bg-gray-50 border-b border-gray-200">
                <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-3">
                    <ol className="flex items-center space-x-3 text-base sm:text-lg text-gray-500">
                        <li>
                            <Link to="/" className="hover:text-power-blue-600 flex items-center space-x-1">
                                <HomeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                <span className="font-semibold">홈</span>
                            </Link>
                        </li>
                        {pathnames.map((value, index) => {
                            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                            const isLast = index === pathnames.length - 1;
                            return (
                                <li key={to} className="flex items-center space-x-3">
                                    <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                                    {isLast ? (
                                        <span className="font-bold text-gray-700 text-base sm:text-lg">{breadcrumbMap[value]}</span>
                                    ) : (
                                        <Link to={to} className="hover:text-power-blue-600 font-semibold text-base sm:text-lg">{breadcrumbMap[value]}</Link>
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

export default UserLayout;
