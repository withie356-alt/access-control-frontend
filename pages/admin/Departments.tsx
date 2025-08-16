import React, { useState, useEffect } from 'react';
import { Department, Manager } from '../../types';
import api from '../../services/api';

const ManagerModal: React.FC<{
  manager: Manager | null;
  departmentId: string;
  onClose: () => void;
  onSave: (manager: Manager) => void;
}> = ({ manager, departmentId, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Manager>>({
    name: manager?.name || '',
    email: manager?.email || '',
    phone: manager?.phone || '',
    role: manager?.role || 'general',
    department_id: departmentId, // department_id로 변경
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const managerData = {
      id: manager?.id || Date.now().toString(),
      ...formData,
    } as Manager;
    onSave(managerData);
  };

  const roleLabels = {
    general: '일반',
    safety: '안전관리자',
    admin: '관리자'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{manager ? '관리자 수정' : <>관리자 추가 <span className="text-base">(승인요청 알림 발송)</span></>}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">이름 *</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">이메일주소 *</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">연락처 *</label>
            <p className="text-xs text-gray-500 mb-1">'-'없이 입력해주세요</p>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3" 
              placeholder="01000000000"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">역할 *</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3" 
              required
            >
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">취소</button>
            <button type="submit" className="px-4 py-2 bg-power-blue-600 text-white rounded-md">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DepartmentModal: React.FC<{
  department: Department | null;
  onClose: () => void;
  onSave: (department: Department) => void;
}> = ({ department, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Department>>({
    name: department?.name || '',
    // managers 필드는 departments 테이블의 실제 컬럼이 아니므로 초기화에서 제외
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // managers 필드는 데이터베이스에 직접 저장되지 않으므로 제거
    const { managers, ...departmentData } = formData;
    onSave({ 
      id: department?.id || crypto.randomUUID(), // UUID 생성 사용
      name: departmentData.name || '',
      created_at: department?.created_at || new Date().toISOString(), // 기존값이 없으면 현재 시간 사용
      managers: [], // managers 필드는 저장 시 빈 배열로 설정하거나 제거 (여기서는 제거된 것으로 간주)
    } as Department);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <h2 className="text-xl font-bold mb-4 flex-shrink-0">{department ? '담당부서 수정' : '담당부서 추가'}</h2>
        <div className="flex-grow overflow-y-auto pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">부서명 *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3" 
                required 
              />
            </div>
            
            {/* 관리자 목록 - DepartmentModal에서 직접 관리자 추가/수정 로직 제거 */}
            {/* 이 부분은 DepartmentModal의 역할이 아니므로, DepartmentsPage에서 ManagerModal을 통해 처리합니다. */}
            
            <div className="flex justify-end space-x-2 pt-4 flex-shrink-0">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">취소</button>
              <button type="submit" className="px-4 py-2 bg-power-blue-600 text-white rounded-md">저장</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [showSearchInput, setShowSearchInput] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 실제 API 호출로 변경
      const data = await api.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveDepartment = async (departmentData: Department) => {
    try {
      if (editingDepartment) {
        await api.updateDepartment(departmentData);
      } else {
        await api.addDepartment(departmentData);
      }
      fetchData(); // 데이터 새로고침
    } catch (error) {
      console.error("Failed to save department:", error);
    } finally {
      setIsDeptModalOpen(false);
      setEditingDepartment(null);
    }
  };

  const handleSaveManager = async (managerData: Manager) => {
    try {
      if (editingManager) {
        await api.updateManager(managerData);
      } else {
        // 새로운 관리자 추가 시, id와 created_at 필드를 제거하고 API 호출
        const { id, created_at, ...dataToSave } = managerData;
        await api.addManager(dataToSave as Omit<Manager, 'id' | 'created_at'>);
      }
      fetchData(); // 데이터 새로고침
    } catch (error) {
      console.error("Failed to save manager:", error);
      alert('관리자 저장에 실패했습니다.');
    } finally {
      setIsManagerModalOpen(false);
      setEditingManager(null);
      setSelectedDepartmentId('');
    }
  };

  const toggleDepartment = (deptId: string) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepts(newExpanded);
  };

  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleLabels = {
    general: '일반',
    safety: '안전관리자',
    admin: '관리자'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowSearchInput(!showSearchInput)}
            className="w-16 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            검색
          </button>
          <button
            onClick={() => { setEditingDepartment(null); setIsDeptModalOpen(true); }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            부서 추가
          </button>
        </div>
      </div>
      
      {showSearchInput && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <input
            type="text"
            placeholder="부서명 검색..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-3 rounded-lg border-gray-300 shadow-sm"
          />
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : filteredDepartments.map(dept => {
          const isExpanded = expandedDepts.has(dept.id);
          
          return (
            <div key={dept.id} className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleDepartment(dept.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                      <p className="text-xs text-gray-400">관리자 {dept.managers?.length || 0}명</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => { setEditingDepartment(dept); setIsDeptModalOpen(true); }}
                      className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                    >
                      수정
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('정말로 이 부서를 삭제하시겠습니까? 관련 관리자도 삭제됩니다.')) {
                          try {
                            // 부서 삭제 전, 해당 부서의 모든 관리자 삭제 (Supabase RLS 및 FK 설정에 따라 다를 수 있음)
                            // 여기서는 직접 삭제 로직을 추가하지 않고, Supabase의 cascade delete 또는 RLS 정책을 신뢰합니다.
                            await api.deleteDepartment(dept.id);
                            fetchData(); // 데이터 새로고침
                          } catch (error) {
                            console.error("Failed to delete department:", error);
                            alert('부서 삭제에 실패했습니다. 관련 데이터가 있을 수 있습니다.');
                          }
                        }
                      }}
                      className="px-3 py-1 border border-red-300 text-red-700 text-sm rounded-md hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-4">
                  {dept.managers?.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">등록된 관리자가 없습니다.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dept.managers?.map(manager => (
                        <div key={manager.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{manager.name}</h4>
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {roleLabels[manager.role || 'general']}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => { setSelectedDepartmentId(dept.id); setEditingManager(manager); setIsManagerModalOpen(true); }}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200"
                              >
                                수정
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('정말로 이 관리자를 삭제하시겠습니까?')) {
                                    try {
                                      await api.deleteManager(manager.id);
                                      fetchData(); // 데이터 새로고침
                                    } catch (error) {
                                      console.error("Failed to delete manager:", error);
                                      alert('관리자 삭제에 실패했습니다.');
                                    }
                                  }
                                }}
                                className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full hover:bg-red-200"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>📧 {manager.email}</p>
                            <p>📱 {manager.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => { setSelectedDepartmentId(dept.id); setEditingManager(null); setIsManagerModalOpen(true); }}
                    className="w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center"
                  >
                    <span className="text-xl mr-2">+</span>
                    관리자 추가
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isDeptModalOpen && (
        <DepartmentModal 
          department={editingDepartment} 
          onClose={() => setIsDeptModalOpen(false)} 
          onSave={handleSaveDepartment} 
        />
      )}
      
      {isManagerModalOpen && (
        <ManagerModal 
          manager={editingManager} 
          departmentId={selectedDepartmentId}
          onClose={() => setIsManagerModalOpen(false)} 
          onSave={handleSaveManager} 
        />
      )}
    </div>
  );
};

export default DepartmentsPage;