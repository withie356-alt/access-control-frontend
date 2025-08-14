
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../services/api';
import { AccessApplication, ApplicationStatus } from '../../types';
import { ArrowPathIcon } from '../../components/icons';

const ApprovalsPage: React.FC = () => {
  const [applications, setApplications] = useState<AccessApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [detailModal, setDetailModal] = useState<{open: boolean, app: AccessApplication | null}>({open: false, app: null});
  const [editModal, setEditModal] = useState<{open: boolean, app: FullAccessApplication | null}>({open: false, app: null});

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAccessApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      // Optionally, set an error state here
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

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

  const handleDeleteApplication = async (id: string) => {
    if (window.confirm('정말로 이 신청을 삭제하시겠습니까?')) {
      try {
        await api.deleteApplication(id);
        alert('신청이 삭제되었습니다.');
        fetchApplications();
      } catch (error) {
        alert('삭제 중 오류가 발생했습니다.');
      }
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
        app.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
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
    const baseClasses = "px-4 py-2 inline-flex text-base leading-5 font-semibold rounded-full";
    const statusClasses = {
      [ApplicationStatus.Pending]: "bg-yellow-100 text-yellow-800",
      [ApplicationStatus.Approved]: "bg-green-100 text-green-800",
      [ApplicationStatus.Rejected]: "bg-red-100 text-red-800",
    };
    const statusText = {
      [ApplicationStatus.Pending]: "승인 대기",
      [ApplicationStatus.Approved]: "승인 완료",
      [ApplicationStatus.Rejected]: "반려",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{statusText[status]}</span>;
  };

  // 카드형 UI + 모달
  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center mb-6 space-x-4">
          <button
            onClick={() => setShowSearchInput(!showSearchInput)}
            className="w-16 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            검색
          </button>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <option value="all">모든 상태</option>
            <option value={ApplicationStatus.Pending}>승인 대기</option>
            <option value={ApplicationStatus.Approved}>승인 완료</option>
            <option value={ApplicationStatus.Rejected}>반려</option>
          </select>
          <button
            onClick={fetchApplications}
            className="p-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
            title="새로고침"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
      </div>

      {showSearchInput && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <input
            type="text"
            placeholder="이름, 업체명, 공사명 검색..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-3 rounded-lg border-gray-300 shadow-sm"
          />
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-base font-medium text-yellow-800">승인 대기</div>
            <div className="text-xl font-bold text-yellow-600">{applicationCounts.Pending}명</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-base font-medium text-green-800">승인 완료</div>
            <div className="text-xl font-bold text-green-600">{applicationCounts.Approved}명</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-base font-medium text-red-800">반려</div>
            <div className="text-xl font-bold text-red-600">{applicationCounts.Rejected}명</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-base font-medium text-blue-800">전체</div>
            <div className="text-xl font-bold text-blue-600">{applicationCounts.Total}명</div>
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
              <div className="font-bold text-lg text-gray-800">{app.applicant_name}</div>
                  <StatusBadge status={app.status} />
            </div>
            <div className="text-sm text-gray-600">업체: <span className="font-medium text-gray-800">{app.companyName || app.company_name || 'N/A'}</span></div>
            <div className="text-sm text-gray-600">공사명: <span className="font-medium text-gray-800">{app.projectName || 'N/A'}</span></div>
            {app.companyDepartmentName && <div className="text-sm text-gray-600">담당부서: <span className="font-medium text-gray-800">{app.companyDepartmentName}</span></div>}
            <div className="text-xs text-gray-400 mt-1">신청일: {new Date(app.created_at).toLocaleString()}</div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <button onClick={() => setDetailModal({open: true, app})} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50">
                세부정보
              </button>
                  {app.status === ApplicationStatus.Pending && (
                    <>
                  <button onClick={() => handleApprovalAction([app.id], 'approve')} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50">
                    승인
                  </button>
                  <button onClick={() => handleApprovalAction([app.id], 'reject')} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50">
                    반려
                  </button>
                    </>
                  )}
                  {app.status === ApplicationStatus.Approved && (
                    <button onClick={() => handleApprovalAction([app.id], 'reject')} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50">
                      반려
                    </button>
                  )}
                  {app.status === ApplicationStatus.Rejected && (
                    <button onClick={() => handleApprovalAction([app.id], 'approve')} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50">
                      승인
                    </button>
                  )}
            {(app.status === ApplicationStatus.Pending || app.status === ApplicationStatus.Approved || app.status === ApplicationStatus.Rejected) && (
              <button onClick={() => setEditModal({open: true, app})} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50">
                수정
              </button>
            )}
            {(app.status === ApplicationStatus.Approved || app.status === ApplicationStatus.Rejected) && (
              <button onClick={() => handleDeleteApplication(app.id)} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50">
                삭제
              </button>
            )}
            </div>
          </div>
        ))}
      </div>

      {/* 세부정보 모달 */}
      {detailModal.open && detailModal.app && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center"
          onClick={() => setDetailModal({open: false, app: null})}
        >
          <div
            className="relative p-8 bg-white w-96 max-w-md mx-auto rounded-xl shadow-2xl border max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-gray-800">출입자 상세 정보</h3>
            <div className="space-y-4 text-sm text-gray-700">
              {/* 승인상태 */}
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">승인상태</h4>
                <div>
                  <StatusBadge status={detailModal.app.status} />
                </div>
              </div>

              {/* 기본 정보 */}
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">기본 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-600">성명:</p>
                    <p className="text-gray-800">{detailModal.app.applicant_name}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">연락처:</p>
                    <p className="text-gray-800">{detailModal.app.applicant_phone}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">성별:</p>
                    <p className="text-gray-800">{detailModal.app.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">국적:</p>
                    <p className="text-gray-800">{detailModal.app.nationality || 'N/A'}</p>
                  </div>
                  {detailModal.app.passport_number && (
                    <div className="col-span-2">
                      <p className="font-semibold text-gray-600">여권번호:</p>
                      <p className="text-gray-800">{detailModal.app.passport_number}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 역할 정보 */}
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">역할 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  {detailModal.app.is_site_representative && (
                    <div className="col-span-2">
                      <p className="text-gray-800">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          현장대리인
                        </span>
                      </p>
                    </div>
                  )}
                  {detailModal.app.is_vehicle_owner && (
                    <div className="col-span-2">
                      <p className="text-gray-800">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          차량소유자
                        </span>
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-2 p-2 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-600">차량번호:</p>
                          <p className="text-gray-800">{detailModal.app.vehicle_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-600">차량종류:</p>
                          <p className="text-gray-800">{detailModal.app.vehicle_type || 'N/A'}</p>
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
                    <p className="text-gray-800">{detailModal.app.projectName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">공사 내용:</p>
                    <p className="text-gray-800">{detailModal.app.projectDescription || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">공사 기간:</p>
                    <p className="text-gray-800">{detailModal.app.projectStartDate && detailModal.app.projectEndDate ? `${new Date(detailModal.app.projectStartDate).toLocaleDateString('ko-KR')} ~ ${new Date(detailModal.app.projectEndDate).toLocaleDateString('ko-KR')}` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">담당 부서:</p>
                    <p className="text-gray-800">{detailModal.app.projectManagerDepartmentName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">담당자:</p>
                    <p className="text-gray-800">{detailModal.app.projectManagerName || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* 업체 정보 */}
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">업체 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-600">업체명:</p>
                    <p className="text-gray-800">{detailModal.app.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">담당부서:</p>
                    <p className="text-gray-800">{detailModal.app.companyDepartmentName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">담당자:</p>
                    <p className="text-gray-800">{detailModal.app.companyContactPerson || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">연락처:</p>
                    <p className="text-gray-800">{detailModal.app.companyPhoneNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setDetailModal({open: false, app: null})}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-md"
              >
                닫기
              </button>
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
  application: FullAccessApplication;
  onClose: () => void;
  onSave: (app: AccessApplication) => void;
}> = ({ application, onClose, onSave }) => {
  const [formData, setFormData] = useState<AccessApplication>(application);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData: AccessApplication = {
      id: formData.id,
      applicant_name: formData.applicant_name,
      applicant_phone: formData.applicant_phone,
      gender: formData.gender,
      nationality: formData.nationality,
      passport_number: formData.passport_number,
      is_site_representative: formData.is_site_representative,
      is_vehicle_owner: formData.is_vehicle_owner,
      vehicle_number: formData.vehicle_number,
      vehicle_type: formData.vehicle_type,
      // These fields are loaded from tables and not directly editable in this modal
      company_name: formData.company_name, // Keeping for consistency if API expects it, but not user-editable
      project_id: formData.project_id,
      company_id: formData.company_id,
      visit_date: formData.visit_date,
      agreed_on: formData.agreed_on,
      signature: formData.signature,
      qrid: formData.qrid,
      status: formData.status,
      created_at: formData.created_at,
    };
    onSave(updatedData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
        <h2 className="text-xl font-bold mb-4 text-gray-800">신청 정보 수정</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">신청자명</label>
              <input 
                type="text" 
                name="applicant_name" 
                value={formData.applicant_name} 
                onChange={handleChange} 
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm py-2 px-3" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
              <input 
                type="tel" 
                name="applicant_phone" 
                value={formData.applicant_phone} 
                onChange={handleChange} 
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm py-2 px-3" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
              <select 
                name="gender" 
                value={formData.gender || ''} 
                onChange={handleChange} 
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm py-2 px-3"
              >
                <option value="">선택</option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">국적</label>
              <select 
                name="nationality" 
                value={formData.nationality || ''} 
                onChange={handleChange} 
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm py-2 px-3"
              >
                <option value="한국">한국</option>
                <option value="미국">미국</option>
                <option value="중국">중국</option>
                <option value="일본">일본</option>
                <option value="기타">기타</option>
              </select>
            </div>
            {formData.nationality !== '한국' && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">여권번호</label>
                <input 
                  type="text" 
                  name="passport_number" 
                  value={formData.passport_number || ''} 
                  onChange={handleChange} 
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm py-2 px-3"
                />
              </div>
            )}
          </div>

          {/* 역할 정보 */}
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">역할 정보</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">현장대리인</label>
                <input 
                  type="checkbox" 
                  name="is_site_representative" 
                  checked={formData.is_site_representative} 
                  onChange={handleChange} 
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm py-2 px-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">차량소유자</label>
                <input 
                  type="checkbox" 
                  name="is_vehicle_owner" 
                  checked={formData.is_vehicle_owner} 
                  onChange={handleChange} 
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm py-2 px-3"
                />
                {formData.is_vehicle_owner && (
                  <div className="grid grid-cols-2 gap-4 mt-2 p-2 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-700 mb-1">차량번호:</p>
                      <input 
                        type="text" 
                        name="vehicle_number" 
                        value={formData.vehicle_number || ''} 
                        onChange={handleChange} 
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm py-2 px-3"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">차량종류:</p>
                      <input 
                        type="text" 
                        name="vehicle_type" 
                        value={formData.vehicle_type || ''} 
                        onChange={handleChange} 
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm py-2 px-3"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 공사 정보 */}
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">공사 정보</h4>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-base">
              <div className="col-span-2 flex items-center justify-between">
                <div className="flex items-center flex-grow">
                  <p className="font-medium text-gray-700 w-24 flex-shrink-0">공사명:</p>
                  <p className="text-gray-900 font-bold flex-grow">{application.projectName || 'N/A'}</p>
                </div>
                <p className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  {application.projectStartDate && application.projectEndDate
                    ? `(${new Date(application.projectStartDate).toLocaleDateString('ko-KR').replace(/\s/g, '')}~${new Date(application.projectEndDate).toLocaleDateString('ko-KR').replace(/\s/g, '')})`
                    : 'N/A'}
                </p>
              </div>
              <div className="col-span-2 flex items-start">
                <p className="font-medium text-gray-700 w-24 flex-shrink-0">공사 내용:</p>
                <p className="text-gray-800 flex-grow">{application.projectDescription || 'N/A'}</p>
              </div>
              <div className="flex items-center">
                <p className="font-medium text-gray-700 w-24 flex-shrink-0">담당 부서:</p>
                <p className="text-gray-800 flex-grow">{application.projectManagerDepartmentName || 'N/A'}</p>
              </div>
              <div className="flex items-center">
                <p className="font-medium text-gray-700 w-24 flex-shrink-0">담당자:</p>
                <p className="text-gray-800 flex-grow">{application.projectManagerName || 'N/A'}</p>
              </div>
              <div className="col-span-2 flex items-center">
                <p className="font-medium text-gray-700 w-24 flex-shrink-0">연락처:</p>
                <p className="text-gray-800 flex-grow">{application.projectManagerPhone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* 업체 정보 */}
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">업체 정보</h4>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-base">
              <div className="col-span-2 flex items-center">
                <p className="font-medium text-gray-700 w-24 flex-shrink-0">업체명:</p>
                <p className="text-gray-900 font-bold flex-grow">
                  {application.companyName || 'N/A'}
                </p>
              </div>
              <div className="flex items-center">
                <p className="font-medium text-gray-700 w-24 flex-shrink-0">담당부서:</p>
                <p className="text-gray-800 flex-grow">
                  {application.companyDepartmentName || 'N/A'}
                </p>
              </div>
              <div className="flex items-center">
                <p className="font-medium text-gray-700 w-24 flex-shrink-0">담당자:</p>
                <p className="text-gray-800 flex-grow">
                  {application.companyContactPerson || 'N/A'}
                </p>
              </div>
              <div className="col-span-2 flex items-center">
                <p className="font-medium text-gray-700 w-24 flex-shrink-0">연락처:</p>
                <p className="text-gray-800 flex-grow">
                  {application.companyPhoneNumber || 'N/A'}
                </p>
              </div>
            </div>
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
