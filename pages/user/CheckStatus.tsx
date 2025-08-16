import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';
import { AccessApplication, ApplicationStatus } from '../../types';
import { useLocation, useNavigate } from 'react-router-dom';

const CheckStatusPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<AccessApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [editingApp, setEditingApp] = useState<AccessApplication | null>(null);

  const handleSearch = useCallback(async () => {
    if (!name || !phone) {
      setError('이름과 전화번호를 모두 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSearched(true);

    try {
      const results = await api.getApplicationsByNameAndPhone(name, phone);
      const sortedResults = results.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setApplications(sortedResults);

    } catch (err) {
      setError('신청 내역을 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [name, phone]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  }

  const handleReset = () => {
    setName('');
    setPhone('');
    setApplications([]);
    setSearched(false);
    setError('');
  };

  useEffect(() => {
    const state = location.state as { name?: string; phone?: string; autoSearch?: boolean } | null;
    if (state?.name && state?.phone) {
      setName(state.name);
      setPhone(state.phone);
      // Clear the state from location to prevent re-triggering on refresh
      navigate(location.pathname, { replace: true, state: { ...state, name: undefined, phone: undefined, autoSearch: true } });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    // Automatically search only if directed from Apply page
    if (name && phone && location.state?.autoSearch) {
      handleSearch();
      // Clear the autoSearch flag
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [name, phone, location.state, handleSearch, navigate]);


  const handleUpdate = async (updatedApp: AccessApplication) => {
    if (!updatedApp) return;
    setIsLoading(true);
    try {
        await api.updateApplication(updatedApp.id, updatedApp);
        alert('신청 정보가 수정되었습니다.');
        setEditingApp(null);
        // Refresh list after update
        const results = await api.getApplicationsByNameAndPhone(name, phone);
        setApplications(results);
    } catch(err) {
        setError('수정에 실패했습니다.');
    } finally {
        setIsLoading(false);
    }
  }

  const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusClasses = {
      [ApplicationStatus.Pending]: "bg-yellow-100 text-yellow-800",
      [ApplicationStatus.Approved]: "bg-green-100 text-green-800",
      [ApplicationStatus.Rejected]: "bg-red-100 text-red-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
  };

  if (editingApp) {
    return (
        <EditApplicationModal 
            application={editingApp}
            onClose={() => setEditingApp(null)}
            onSave={handleUpdate}
        />
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md mb-6">
        {searched && !isLoading && applications.length > 0 ? (
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold">{name}님, 환영합니다.</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 whitespace-nowrap"
            >
              조회정보 초기화
            </button>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 sm:text-sm py-2 px-3 bg-gray-100"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="전화번호를 입력하세요 ('-'없이 입력해주세요)"
              className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 sm:text-sm py-2 px-3 bg-gray-100"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-power-blue-600 text-white rounded-md hover:bg-power-blue-700 disabled:bg-gray-400 whitespace-nowrap"
            >
              {isLoading ? '조회 중...' : '조회'}
            </button>
          </form>
        )}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {searched && !isLoading && (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">조회 결과</h2>
            {applications.length > 0 ? (
                <div className="space-y-6">
                    {applications.map(app => (
                        <div key={app.id} className="border border-gray-200 rounded-lg p-6">
                            <div className="text-right text-sm text-gray-500 mb-2">
                                신청일시: {new Date(app.created_at).toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                            </div>
                            {app.status === ApplicationStatus.Pending ? (
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <p className="font-semibold text-yellow-800">승인 대기중입니다.</p>
                                    <p className="text-sm text-yellow-700">관리자의 승인을 기다려주세요.</p>
                                </div>
                            ) : app.status === ApplicationStatus.Rejected ? (
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <p className="font-semibold text-red-800">신청이 반려되었습니다.</p>
                                    <p className="text-sm text-red-700">자세한 내용은 관리자에게 문의해주세요.</p>
                                </div>
                            ) : (
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <p className="font-semibold text-green-800 mb-2">출입 QR 코드</p>
                                    {app.qrid ? (
                                        <div className="flex justify-center p-2 border border-gray-300 rounded-md">
                                            <QRCodeSVG value={app.qrid} size={256} level="H" includeMargin={true} />
                                        </div>
                                    ) : (
                                        <p className="text-sm text-red-700">QR 코드를 생성할 수 없습니다. (QR ID 없음)</p>
                                    )}
                                    {app.projectStartDate && app.projectEndDate && (
                                        <p className="text-sm text-gray-700 mt-2">
                                            출입 가능일: {new Date(app.projectStartDate).toLocaleDateString('ko-KR')} ~ {new Date(app.projectEndDate).toLocaleDateString('ko-KR')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center py-8 text-gray-500">해당 정보로 등록된 신청 내역이 없습니다.</p>
            )}
        </div>
      )}
    </div>
  );
};

// Full-featured Edit Modal Component
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 m-4">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-bold text-gray-800">신청 정보 수정</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="신청자명" name="name" value={formData.name} onChange={handleChange} required />
                <InputField label="연락처" name="phone" value={formData.phone} onChange={handleChange} required />
                <InputField label="업체명" name="company" value={formData.company} onChange={handleChange} required />
                <InputField label="공사명" name="projectName" value={formData.projectName} onChange={handleChange} required />
                <InputField label="차량번호" name="vehicleNumber" value={formData.vehicleNumber || ''} onChange={handleChange} />
                <InputField label="차량종류" name="vehicleType" value={formData.vehicleType || ''} onChange={handleChange} />
                <InputField label="성별" name="gender" value={formData.gender || ''} onChange={handleChange} />
                <InputField label="국적" name="nationality" value={formData.nationality || ''} onChange={handleChange} />
                {formData.nationality !== '한국' && 
                    <InputField label="여권번호" name="passportNumber" value={formData.passportNumber || ''} onChange={handleChange} />
                }
                <InputField label="담당부서" name="department" value={formData.department || ''} onChange={handleChange} />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                취소
                </button>
                <button type="submit" className="px-4 py-2 bg-power-blue-600 text-white rounded-md hover:bg-power-blue-700">
                저장
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

const InputField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}> = ({ label, name, value, onChange, required }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input 
            type="text" 
            name={name} 
            value={value} 
            onChange={onChange} 
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm py-2 px-3" 
            required={required} 
        />
    </div>
);

export default CheckStatusPage;