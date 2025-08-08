
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { DailyStats, StatusStats, ApplicationStatus } from '../../types';

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<{
        dailyStats: DailyStats[];
        onSiteNow: number;
        exitedToday: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (!stats) {
        return <div>데이터를 불러오는데 실패했습니다.</div>;
    }
    
    

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">대시보드</h1>
            
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
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">성명</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">성별</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">출근시간</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">퇴근시간</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">상세</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* 임시 데이터 */}
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">홍길동</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">010-1234-5678</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">남</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">작업자</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">08:00</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">17:00</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900">🔍</button>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">김영희</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">010-9876-5432</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">여</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">관리자</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">09:00</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">18:00</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900">🔍</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Access Chart */}
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
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: number;
    unit: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 mt-2">
            {value.toLocaleString()} <span className="text-xl font-medium">{unit}</span>
        </p>
    </div>
);


export default DashboardPage;
