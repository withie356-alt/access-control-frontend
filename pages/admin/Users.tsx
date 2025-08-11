import React, { useState } from 'react';

// This is mock data. Replace with actual data from your API.
const mockUsers = [
  { id: '1', name: '이성규', email: 'sklee@example.com', role: 'admin', company: '위드인천에너지', department: 'IT', createdAt: '2023-01-15' },
  { id: '2', name: '홍길동', email: 'gdhong@example.com', role: 'user', company: '협력업체A', department: '설비', createdAt: '2023-02-20' },
  { id: '3', name: '김경비', email: 'guardkim@example.com', role: 'guard', company: '위드인천에너지', department: '보안', createdAt: '2023-01-10' },
];

const roleKorean: { [key: string]: string } = {
  admin: '관리자',
  user: '일반사용자',
  guard: '경비실'
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="이름, 이메일, 소속, 부서로 검색..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-3 rounded-lg border-gray-300 shadow-sm"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">이름</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">이메일</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">역할</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">소속</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">부서</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">등록일</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                    user.role === 'guard' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {roleKorean[user.role]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{user.company}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{user.department}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{user.createdAt}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                  <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">수정</button>
                  <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;