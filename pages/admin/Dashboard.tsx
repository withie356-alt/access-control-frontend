import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { DailyStats } from '../../types';

import { AccessApplication, DailyStats } from '../../types';

// Person 타입
interface Person extends AccessApplication {
  checkInTime: string;
  checkOutTime: string;
  qrId: string;
  constructionDetails: string;
  companyInfo: string;
  companyContactPerson: string; // Add this line
}

interface DashboardStats {
  dailyStats: DailyStats[];
  onSiteNow: number;
  exitedToday: number;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const dummyPeople: Person[] = [
    {
      id: '1',
      name: '홍길동',
      phone: '010-1234-5678',
      gender: '남',
      isSiteRepresentative: true,
      vehicleOwner: true,
      vehicleOwnerName: '홍길동',
      vehicleNumber: '12가 3456',
      vehicleType: '승용차',
      checkInTime: '08:00',
      checkOutTime: '',
      qrId: 'QR12345',
      constructionDetails: 'A동 내부 마감 공사',
      companyInfo: 'ABC 건설',
      company: 'ABC 건설',
      projectName: 'A동 신축 공사',
      agreedOn: new Date('2024-08-08T10:00:00Z').toISOString(),
      signature: 'base64string',
      status: '대기',
      createdAt: new Date('2024-08-08T10:00:00Z').toISOString(),
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      department: '건설부',
      projectManager: '박영수',
      companyContactPerson: '김대표',
    },
    {
      id: '2',
      name: '김영희',
      phone: '010-9876-5432',
      gender: '여',
      isSiteRepresentative: false,
      vehicleOwner: false,
      checkInTime: '09:00',
      checkOutTime: '18:00',
      qrId: 'QR67890',
      constructionDetails: 'B동 전기 설비 점검',
      companyInfo: 'XYZ 엔지니어링',
      company: 'XYZ 엔지니어링',
      projectName: 'B동 리모델링',
      agreedOn: new Date('2024-08-07T09:00:00Z').toISOString(),
      signature: 'base64string',
      status: '완료',
      createdAt: new Date('2024-08-07T09:00:00Z').toISOString(),
      startDate: '2024-03-15',
      endDate: '2024-06-30',
      department: '전기부',
      projectManager: '최지영',
      companyContactPerson: '이부장',
    },
    {
      id: '3',
      name: '이철수',
      phone: '010-5555-1111',
      gender: '남',
      isSiteRepresentative: true,
      vehicleOwner: true,
      vehicleOwnerName: '이철수',
      vehicleNumber: '34다 5678',
      vehicleType: '화물차',
      checkInTime: '07:30',
      checkOutTime: '17:30',
      qrId: 'QR11223',
      constructionDetails: '전체 현장 안전 점검',
      companyInfo: '안전제일 컨설팅',
      company: '안전제일 컨설팅',
      projectName: '안전 점검',
      agreedOn: new Date('2024-08-06T07:30:00Z').toISOString(),
      signature: 'base64string',
      status: '반려',
      createdAt: new Date('2024-08-06T07:30:00Z').toISOString(),
      startDate: '2024-07-01',
      endDate: '2024-07-15',
      department: '안전관리부',
      projectManager: '강민준',
      companyContactPerson: '박팀장',
    },
    {
      id: '4',
      name: '박민수',
      phone: '010-2222-3333',
      gender: '남',
      isSiteRepresentative: false,
      vehicleOwner: false,
      checkInTime: '08:30',
      checkOutTime: '',
      qrId: 'QR44556',
      constructionDetails: 'C동 내부 도장 공사',
      companyInfo: '도장 전문',
      company: '도장 전문',
      projectName: 'C동 리모델링',
      agreedOn: new Date('2024-08-08T08:30:00Z').toISOString(),
      signature: 'base64string',
      status: '대기',
      createdAt: new Date('2024-08-08T08:30:00Z').toISOString(),
      startDate: '2024-08-01',
      endDate: '2024-09-30',
      department: '도장부',
      projectManager: '이수진',
      companyContactPerson: '최과장',
    },
    {
      id: '5',
      name: '최지혜',
      phone: '010-4444-5555',
      gender: '여',
      isSiteRepresentative: true,
      vehicleOwner: true,
      vehicleOwnerName: '최지혜',
      vehicleNumber: '56가 7890',
      vehicleType: '승합차',
      checkInTime: '09:30',
      checkOutTime: '17:00',
      qrId: 'QR77889',
      constructionDetails: 'D동 외부 유리 설치',
      companyInfo: '유리 시공',
      company: '유리 시공',
      projectName: 'D동 신축',
      agreedOn: new Date('2024-08-07T09:30:00Z').toISOString(),
      signature: 'base64string',
      status: '완료',
      createdAt: new Date('2024-08-07T09:30:00Z').toISOString(),
      startDate: '2024-07-01',
      endDate: '2024-08-15',
      department: '외장부',
      projectManager: '김철수',
      companyContactPerson: '정대리',
    },
    {
      id: '6',
      name: '정우성',
      phone: '010-6666-7777',
      gender: '남',
      isSiteRepresentative: false,
      vehicleOwner: false,
      checkInTime: '10:00',
      checkOutTime: '',
      qrId: 'QR10112',
      constructionDetails: 'E동 내부 배관 공사',
      companyInfo: '배관 설비',
      company: '배관 설비',
      projectName: 'E동 증축',
      agreedOn: new Date('2024-08-08T10:00:00Z').toISOString(),
      signature: 'base64string',
      status: '대기',
      createdAt: new Date('2024-08-08T10:00:00Z').toISOString(),
      startDate: '2024-08-10',
      endDate: '2024-09-10',
      department: '설비부',
      projectManager: '박영수',
      companyContactPerson: '김팀장',
    },
    {
      id: '7',
      name: '이지은',
      phone: '010-8888-9999',
      gender: '여',
      isSiteRepresentative: false,
      vehicleOwner: false,
      checkInTime: '11:00',
      checkOutTime: '16:00',
      qrId: 'QR13141',
      constructionDetails: 'F동 조경 공사',
      companyInfo: '조경 디자인',
      company: '조경 디자인',
      projectName: 'F동 신축',
      agreedOn: new Date('2024-08-07T11:00:00Z').toISOString(),
      signature: 'base64string',
      status: '완료',
      createdAt: new Date('2024-08-07T11:00:00Z').toISOString(),
      startDate: '2024-07-20',
      endDate: '2024-08-05',
      department: '조경부',
      projectManager: '최지영',
      companyContactPerson: '이과장',
    },
    {
      id: '8',
      name: '강동원',
      phone: '010-1111-2222',
      gender: '남',
      isSiteRepresentative: true,
      vehicleOwner: true,
      vehicleOwnerName: '강동원',
      vehicleNumber: '90가 1234',
      vehicleType: '승용차',
      checkInTime: '07:00',
      checkOutTime: '18:30',
      qrId: 'QR15161',
      constructionDetails: 'G동 내부 철거',
      companyInfo: '철거 전문',
      company: '철거 전문',
      projectName: 'G동 리모델링',
      agreedOn: new Date('2024-08-06T07:00:00Z').toISOString(),
      signature: 'base64string',
      status: '완료',
      createdAt: new Date('2024-08-06T07:00:00Z').toISOString(),
      startDate: '2024-06-01',
      endDate: '2024-06-30',
      department: '철거부',
      projectManager: '강민준',
      companyContactPerson: '박부장',
    },
    {
      id: '9',
      name: '신민아',
      phone: '010-3333-4444',
      gender: '여',
      isSiteRepresentative: false,
      vehicleOwner: false,
      checkInTime: '08:45',
      checkOutTime: '',
      qrId: 'QR17181',
      constructionDetails: 'H동 전기 배선',
      companyInfo: '전기 공사',
      company: '전기 공사',
      projectName: 'H동 신축',
      agreedOn: new Date('2024-08-08T08:45:00Z').toISOString(),
      signature: 'base64string',
      status: '대기',
      createdAt: new Date('2024-08-08T08:45:00Z').toISOString(),
      startDate: '2024-08-05',
      endDate: '2024-09-15',
      department: '전기부',
      projectManager: '이수진',
      companyContactPerson: '최팀장',
    },
    {
      id: '10',
      name: '유재석',
      phone: '010-5555-6666',
      gender: '남',
      isSiteRepresentative: false,
      vehicleOwner: false,
      checkInTime: '09:15',
      checkOutTime: '17:45',
      qrId: 'QR19202',
      constructionDetails: 'I동 소방 설비',
      companyInfo: '소방 안전',
      company: '소방 안전',
      projectName: 'I동 증축',
      agreedOn: new Date('2024-08-07T09:15:00Z').toISOString(),
      signature: 'base64string',
      status: '완료',
      createdAt: new Date('2024-08-07T09:15:00Z').toISOString(),
      startDate: '2024-07-10',
      endDate: '2024-07-30',
      department: '소방부',
      projectManager: '김철수',
      companyContactPerson: '정대리',
    },
    {
      id: '11',
      name: '이효리',
      phone: '010-7777-8888',
      gender: '여',
      isSiteRepresentative: true,
      vehicleOwner: true,
      vehicleOwnerName: '이효리',
      vehicleNumber: '00가 0000',
      vehicleType: '승용차',
      checkInTime: '08:00',
      checkOutTime: '',
      qrId: 'QR21223',
      constructionDetails: 'J동 내부 마감 공사',
      companyInfo: '마감 전문',
      company: '마감 전문',
      projectName: 'J동 신축',
      agreedOn: new Date('2024-08-08T08:00:00Z').toISOString(),
      signature: 'base64string',
      status: '대기',
      createdAt: new Date('2024-08-08T08:00:00Z').toISOString(),
      startDate: '2024-08-01',
      endDate: '2024-09-30',
      department: '마감부',
      projectManager: '박영수',
      companyContactPerson: '이부장',
    },
  ];

  // Sort dummyPeople by createdAt in ascending order
  const sortedPeople = [...dummyPeople].sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Get current posts
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPeople = sortedPeople.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(sortedPeople.length / itemsPerPage);

  const handleDetailClick = (person: Person) => {
    setSelectedPerson(person);
    setShowDetailModal(true);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats({
          dailyStats: Array.isArray(data?.dailyStats) ? data.dailyStats : [],
          onSiteNow: Number(data?.onSiteNow ?? 0),
          exitedToday: Number(data?.exitedToday ?? 0),
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        setStats({ dailyStats: [], onSiteNow: 0, exitedToday: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg">로딩 중...</div>;
  }

  if (!stats) {
    return <div className="flex items-center justify-center min-h-screen text-lg text-red-600">데이터를 불러오는데 실패했습니다.</div>;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-6">
        <StatCard title="현재 현장 인원" value={stats.onSiteNow} unit="명" />
        <StatCard title="금일 퇴근 인원" value={stats.exitedToday} unit="명" />
      </div>

      {/* Access Status Management Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">출입현황관리</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
                <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">출입상태</th>
                <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">성명</th>
                <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">차량번호</th>
                <th className="relative px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">상세보기</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPeople.map((person) => {
                const status =
                  person.checkInTime && !person.checkOutTime ? '출근' : person.checkInTime && person.checkOutTime ? '퇴근' : '미출근';
                const badge =
                  status === '출근'
                    ? 'bg-emerald-500'
                    : status === '퇴근'
                    ? 'bg-gray-500'
                    : 'bg-slate-400';

                const time = status === '출근' ? person.checkInTime : person.checkOutTime;
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                const formattedDate = `${yyyy}-${mm}-${dd}`;
                const displayTime = time ? `${formattedDate} ${time}` : '';

                return (
                  <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-1 py-4 whitespace-nowrap text-center text-sm text-gray-500">{displayTime}</td>
                    <td className="px-1 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full ${badge} text-white text-xs font-semibold`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-1 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">{person.name}</td>
                    <td className="px-1 py-4 whitespace-nowrap text-center text-sm text-gray-500">{person.vehicleNumber}</td>
                    <td className="px-1 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleDetailClick(person)}
                        className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              이전
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                  currentPage === index + 1 ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : ''
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              다음
            </button>
          </nav>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">일자별 출입 현황</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="entered" fill="#38bdf8" name="출입" />
              <Bar dataKey="exited" fill="#fbbf24" name="퇴근" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPerson && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="relative p-8 bg-white w-96 max-w-md mx-auto rounded-xl shadow-2xl border max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-gray-800">출입자 상세 정보</h3>
            <div className="space-y-4 text-sm text-gray-700">
              {/* 출근/퇴근 시간 */}
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">출근/퇴근 시간</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-600">출근시간:</p>
                    <p className="text-gray-800">{selectedPerson.checkInTime}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">퇴근시간:</p>
                    <p className="text-gray-800">{selectedPerson.checkOutTime || '미퇴근'}</p>
                  </div>
                </div>
              </div>

              {/* 기본 정보 */}
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">기본 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-600">성명:</p>
                    <p className="text-gray-800">{selectedPerson.name}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">연락처:</p>
                    <p className="text-gray-800">{selectedPerson.phone}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">성별:</p>
                    <p className="text-gray-800">{selectedPerson.gender}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">국적:</p>
                    <p className="text-gray-800">{selectedPerson.nationality}</p>
                  </div>
                  
                </div>
              </div>

              {/* 역할 정보 */}
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">역할 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedPerson.isSiteRepresentative && (
                    <div className="col-span-2">
                      <p className="text-gray-800">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          현장대리인
                        </span>
                      </p>
                    </div>
                  )}
                  {selectedPerson.vehicleOwner && (
                    <div className="col-span-2">
                      <p className="text-gray-800">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          차량소유자
                        </span>
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-2 p-2 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-600">차량번호:</p>
                          <p className="text-gray-800">{selectedPerson.vehicleNumber}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-600">차량종류:</p>
                          <p className="text-gray-800">{selectedPerson.vehicleType}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 공사 정보 */}
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">공사 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-600">공사명:</p>
                    <p className="text-gray-800">{selectedPerson.projectName}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">공사 내용:</p>
                    <p className="text-gray-800">{selectedPerson.constructionDetails}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">공사 기간:</p>
                    <p className="text-gray-800">{selectedPerson.startDate} ~ <br />{selectedPerson.endDate}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">담당 부서:</p>
                    <p className="text-gray-800">{selectedPerson.department}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">담당자:</p>
                    <p className="text-gray-800">{selectedPerson.projectManager}</p>
                  </div>
                </div>
              </div>

              {/* 업체 정보 */}
              <div className="bg-white p-4 rounded-lg shadow-md border border-ray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">업체 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-600">업체명:</p>
                    <p className="text-gray-800">{selectedPerson.company}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">담당부서:</p>
                    <p className="text-gray-800">{selectedPerson.department}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">담당자:</p>
                    <p className="text-gray-800">{selectedPerson.companyContactPerson}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-md"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  unit: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit }) => (
  <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-gray-800 mt-2">
      {value.toLocaleString()} <span className="text-xl font-medium text-gray-600">{unit}</span>
    </p>
  </div>
);
export default DashboardPage;