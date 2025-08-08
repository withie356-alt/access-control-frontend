
import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { AccessApplication, ApplicationStatus } from '../../types';

const ApprovalsPage: React.FC = () => {
  const [applications, setApplications] = useState<AccessApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [detailModal, setDetailModal] = useState<{open: boolean, app: AccessApplication | null}>({open: false, app: null});
  const [editModal, setEditModal] = useState<{open: boolean, app: AccessApplication | null}>({open: false, app: null});

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await api.getAllApplications();
      setApplications(data);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleSelection = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelected(filteredApplications.map(app => app.id));
    } else {
        setSelected([]);
    }
  }

  const handleApprovalAction = async (ids: string[], action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await api.approveApplications(ids);
      } else {
        await api.rejectApplications(ids);
      }
      alert(`${ids.length}건의 신청이 처리되었습니다.`);
      setSelected([]);
      fetchApplications();
    } catch (error) {
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  const handleEditApplication = async (updatedApp: AccessApplication) => {
    try {
      await api.updateApplication(updatedApp.id, updatedApp);
      alert('신청 정보가 수정되었습니다.');
      setEditModal({open: false, app: null});
      fetchApplications();
    } catch (error) {
      alert('수정 중 오류가 발생했습니다.');
    }
  };
  
  const filteredApplications = useMemo(() => {
    return applications
      .filter(app => statusFilter === 'all' || app.status === statusFilter)
      .filter(app => 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.projectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [applications, searchTerm, statusFilter]);

  const applicationCounts = useMemo(() => {
    const counts = {
      Pending: 0,
      Approved: 0,
      Rejected: 0,
      Total: applications.length,
    };
    applications.forEach(app => {
      if (app.status === ApplicationStatus.Pending) {
        counts.Pending++;
      } else if (app.status === ApplicationStatus.Approved) {
        counts.Approved++;
      } else if (app.status === ApplicationStatus.Rejected) {
        counts.Rejected++;
      }
    });
    return counts;
  }, [applications]);

  const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusClasses = {
      [ApplicationStatus.Pending]: "bg-yellow-100 text-yellow-800",
      [ApplicationStatus.Approved]: "bg-green-100 text-green-800",
      [ApplicationStatus.Rejected]: "bg-red-100 text-red-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
  };

  // 카드형 UI + 모달
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">출입 승인 관리</h1>

      {/* New container for search and filter */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="이름, 업체명, 공사명 검색..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-3 rounded-lg border-gray-300 shadow-sm"
          />
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="w-full p-3 rounded-lg border-gray-300 shadow-sm"
          >
            <option value="all">모든 상태</option>
            <option value={ApplicationStatus.Pending}>승인 대기</option>
            <option value={ApplicationStatus.Approved}>승인 완료</option>
            <option value={ApplicationStatus.Rejected}>반려</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 p-3 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-800">승인 대기</span>
            <span className="text-xl font-bold text-yellow-600">{applicationCounts.Pending}</span>
          </div>
          <div className="bg-green-50 p-3 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-green-800">승인 완료</span>
            <span className="text-xl font-bold text-green-600">{applicationCounts.Approved}</span>
          </div>
          <div className="bg-red-50 p-3 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-red-800">반려</span>
            <span className="text-xl font-bold text-red-600">{applicationCounts.Rejected}</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">전체</span>
            <span className="text-xl font-bold text-blue-600">{applicationCounts.Total}</span>
          </div>
        </div>
      </div>

      {/* 카드형 UI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
          <div className="col-span-full text-center py-8">로딩 중...</div>
        ) : filteredApplications.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">신청 내역이 없습니다.</div>
            ) : filteredApplications.map(app => (
          <div key={app.id} className="rounded-xl shadow-md bg-white p-5 flex flex-col gap-2 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-lg text-gray-800">{app.name}</div>
                  <StatusBadge status={app.status} />
            </div>
            <div className="text-sm text-gray-600">업체: <span className="font-medium text-gray-800">{app.company}</span></div>
            <div className="text-sm text-gray-600">공사명: <span className="font-medium text-gray-800">{app.projectName}</span></div>
            {app.department && <div className="text-sm text-gray-600">담당부서: <span className="font-medium text-gray-800">{app.department}</span></div>}
            <div className="text-xs text-gray-400 mt-1">신청일: {new Date(app.createdAt).toLocaleString()}</div>
            
            <div className="flex gap-2 mt-3">
              <button onClick={() => setDetailModal({open: true, app})} className="flex-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200">
                세부정보
              </button>
                  {app.status === ApplicationStatus.Pending && (
                    <>
                  <button onClick={() => handleApprovalAction([app.id], 'approve')} className="flex-1 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700">
                    승인
                  </button>
                  <button onClick={() => handleApprovalAction([app.id], 'reject')} className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">
                    반려
                  </button>
                    </>
                  )}
            </div>
            {(app.status === ApplicationStatus.Pending || app.status === ApplicationStatus.Approved) && (
              <button onClick={() => setEditModal({open: true, app})} className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 mt-2">
                수정
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 세부정보 모달 */}
      {detailModal.open && detailModal.app && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fade-in">
            <button onClick={() => setDetailModal({open: false, app: null})} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">출입신청 세부정보</h2>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium text-gray-600">신청자:</span> {detailModal.app.name}</div>
              <div><span className="font-medium text-gray-600">연락처:</span> {detailModal.app.phone}</div>
              <div><span className="font-medium text-gray-600">성별:</span> {detailModal.app.gender || '-'}</div>
              <div><span className="font-medium text-gray-600">국적:</span> {detailModal.app.nationality || '-'}</div>
              {detailModal.app.nationality && detailModal.app.nationality !== '한국' && (
                <div><span className="font-medium text-gray-600">여권번호:</span> {detailModal.app.passportNumber || '-'}</div>
              )}
              <div><span className="font-medium text-gray-600">업체명:</span> {detailModal.app.company}</div>
              {detailModal.app.department && <div><span className="font-medium text-gray-600">담당부서:</span> {detailModal.app.department}</div>}
              <div><span className="font-medium text-gray-600">공사명:</span> {detailModal.app.projectName}</div>
              <div><span className="font-medium text-gray-600">차량번호:</span> {detailModal.app.vehicleNumber || '-'}</div>
              <div><span className="font-medium text-gray-600">차량종류:</span> {detailModal.app.vehicleType || '-'}</div>
              <div><span className="font-medium text-gray-600">역할:</span> {detailModal.app.roles && detailModal.app.roles.length > 0 ? detailModal.app.roles.join(', ') : '-'}</div>
              <div><span className="font-medium text-gray-600">신청일:</span> {new Date(detailModal.app.createdAt).toLocaleString()}</div>
              <div><span className="font-medium text-gray-600">상태:</span> <StatusBadge status={detailModal.app.status} /></div>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {editModal.open && editModal.app && (
        <EditApplicationModal 
          application={editModal.app} 
          onClose={() => setEditModal({open: false, app: null})} 
          onSave={handleEditApplication} 
        />
      )}
    </div>
  );
};

// 수정 모달 컴포넌트
const EditApplicationModal: React.FC<{
  application: AccessApplication;
  onClose: () => void;
  onSave: (app: AccessApplication) => void;
}> = ({ application, onClose, onSave }) => {
  const [formData, setFormData] = useState<AccessApplication>(application);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
        <h2 className="text-xl font-bold mb-4 text-gray-800">신청 정보 수정</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">신청자명</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm py-2 px-3" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm py-2 px-3" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">업체명</label>
            <input 
              type="text" 
              name="company" 
              value={formData.company} 
              onChange={handleChange} 
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm py-2 px-3" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">차량번호</label>
            <input 
              type="text" 
              name="vehicleNumber" 
              value={formData.vehicleNumber || ''} 
              onChange={handleChange} 
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm py-2 px-3" 
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
              취소
            </button>
            <button type="submit" className="px-4 py-2 bg-power-blue-600 text-white rounded-lg hover:bg-power-blue-700">
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApprovalsPage;
