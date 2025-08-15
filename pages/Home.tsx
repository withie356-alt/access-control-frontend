import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlusIcon, MagnifyingGlassIcon, ShieldCheckIcon, CheckBadgeIcon } from '../components/icons';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { isLoggedIn, user } = useAuth(); // Removed logout from useAuth
  const navigate = useNavigate();

  const handleManageClick = () => {
    if (isLoggedIn && user) {
      if (user.role === 'guardroom') {
        navigate('/guardroom/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        alert('접근 권한이 없습니다.');
      }
    } else {
      navigate('/auth/login'); // Redirect to login if not logged in
    }
  };

  // Removed handleLogout function

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-2 sm:p-4">
      {/* 위드인천에너지 로고 - 왼쪽 상부 (모든 화면에서 표시) */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex items-center">
        <img
          src="/with-incheon-energy-logo.png"
          alt="위드인천에너지 로고"
          className="h-8 sm:h-10 w-auto"
        />
      </div>

      {/* 관리 버튼 - 우측 상부 */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center space-x-2">
        <button
          onClick={handleManageClick}
          className="inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 bg-power-blue-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-power-blue-700 transition-colors duration-200 shadow-sm"
        >
          <CheckBadgeIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          관리
        </button>
        {/* Removed conditional rendering for login/logout buttons */}
      </div>

      <header className="text-center mb-8 sm:mb-12 mt-16 sm:mt-0 px-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-power-blue-800">Safepass System</h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-2">위드인천에너지 안전출입 관리시스템</p>
      </header>

      <main className="w-full max-w-2xl px-4">
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md border border-gray-200">
          <div className="space-y-4">
            <HomeCard
              to="/apply"
              icon={<UserPlusIcon className="w-8 h-8 text-white" />}
              title="출입 신청"
              description={
                <>
                  Visitor Registration<br />
                  새로운 출입 신청을 등록하세요
                </>
              }
            />
            <HomeCard
              to="/check"
              icon={<MagnifyingGlassIcon className="w-8 h-8 text-white" />}
              title="신청 내역 조회"
              description={
                <>
                  Status Inquiry & QR Check<br />
                  신청현황 조회 및 출입QR 확인
                </>
              }
            />
            <HomeCard
              to="/safety"
              icon={<ShieldCheckIcon className="w-8 h-8 text-white" />}
              title="안전 정보 확인"
              description={
                <>
                  Safety Education<br />
                  안전교육 자료를 확인하세요
                </>
              }
            />
          </div>
        </div>
      </main>

      <footer className="text-center mt-12 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} 현장 출입 관리 시스템. All rights reserved.</p>
      </footer>
    </div>
  );
};

interface HomeCardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string | React.ReactNode;
}

const HomeCard: React.FC<HomeCardProps> = ({ to, icon, title, description }) => {
  return (
    <Link
      to={to}
      className="flex items-center p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 hover:border-power-blue-500 active:bg-gray-50"
    >
      <div className="p-2 sm:p-3 bg-power-blue-600 rounded-full mr-3 sm:mr-4 flex-shrink-0">
        <div className="w-6 h-6 sm:w-8 sm:h-8">
          {icon}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">{title}</h3>
        <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">{description}</div>
      </div>
    </Link>
  );
};

export default HomePage;