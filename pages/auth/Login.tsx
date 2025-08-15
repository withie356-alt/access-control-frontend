import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>(''); // Changed from id to email
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => { // Made async
    e.preventDefault();
    setError('');
    const result = await login(email, password); // Await the login call

    if (result.success) {
      // 로그인 성공 후 user 객체에서 role을 가져와 리다이렉션
      if (user) { // user 객체가 존재하는지 확인
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'guardroom') {
          navigate('/guardroom/dashboard');
        } else {
          navigate('/'); // 기본적으로 홈으로 이동 (일반 사용자 등)
        }
      } else {
        navigate('/'); // user 객체가 없으면 기본적으로 홈으로 이동
      }
    } else {
      setError(result.error || '아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="flex justify-center bg-gray-100 pt-20">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center text-power-blue-800 mb-4">로그인</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block font-medium mb-1" htmlFor="email">이메일</label> {/* Changed from id to email */}
              <input
                type="email" // Changed type to email
                placeholder="이메일" // Changed placeholder
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-power-blue-600"
                id="email" // Changed id to email
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block font-medium mb-1" htmlFor="password">비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-power-blue-600"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="flex items-baseline justify-between">
              <button
                type="submit"
                className="px-6 py-2 mt-4 text-white bg-power-blue-700 rounded-lg hover:bg-power-blue-800 transition-colors"
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 mt-4 text-power-blue-600 border border-power-blue-600 rounded-lg hover:bg-power-blue-100 transition-colors"
              >
                뒤로가기
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;