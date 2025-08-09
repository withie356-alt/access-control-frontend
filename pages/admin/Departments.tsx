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
    departmentId: departmentId,
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
        <h2 className="text-xl font-bold mb-4">{manager ? '관리자 수정' : '관리자 추가'}</h2>
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
            <label className="block text-sm font-medium">휴대전화번호 *</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3" 
              placeholder="010-1234-5678"
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
    managers: department?.managers || [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const departmentData = {
      id: department?.id || Date.now().toString(),
      name: formData.name || '',
      managers: formData.managers || [],
    } as Department;
    onSave(departmentData);
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
            
            {/* 관리자 목록 */}
            <div>
              <label className="block text-sm font-medium mb-2">관리자 목록</label>
              <div className="space-y-3">
                {formData.managers?.map((manager, index) => (
                  <div key={manager.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">이름 *</label>
                        <input 
                          type="text" 
                          value={manager.name} 
                          onChange={(e) => {
                            const updatedManagers = [...(formData.managers || [])];
                            updatedManagers[index] = { ...manager, name: e.target.value };
                            setFormData({ ...formData, managers: updatedManagers });
                          }}
                          className="w-full mt-1 border-gray-300 rounded-md shadow-sm text-sm py-2 px-3" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">이메일 *</label>
                        <input 
                          type="email" 
                          value={manager.email} 
                          onChange={(e) => {
                            const updatedManagers = [...(formData.managers || [])];
                            updatedManagers[index] = { ...manager, email: e.target.value };
                            setFormData({ ...formData, managers: updatedManagers });
                          }}
                          className="w-full mt-1 border-gray-300 rounded-md shadow-sm text-sm py-2 px-3" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">전화번호 *</label>
                        <input 
                          type="tel" 
                          value={manager.phone} 
                          onChange={(e) => {
                            const updatedManagers = [...(formData.managers || [])];
                            updatedManagers[index] = { ...manager, phone: e.target.value };
                            setFormData({ ...formData, managers: updatedManagers });
                          }}
                          className="w-full mt-1 border-gray-300 rounded-md shadow-sm text-sm py-2 px-3" 
                          placeholder="010-1234-5678"
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">역할 *</label>
                        <select 
                          value={manager.role} 
                          onChange={(e) => {
                            const updatedManagers = [...(formData.managers || [])];
                            updatedManagers[index] = { ...manager, role: e.target.value as 'general' | 'safety' | 'admin' };
                            setFormData({ ...formData, managers: updatedManagers });
                          }}
                          className="w-full mt-1 border-gray-300 rounded-md shadow-sm text-sm py-2 px-3" 
                          required
                        >
                          <option value="general">일반</option>
                          <option value="safety">안전관리자</option>
                          <option value="admin">관리자</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedManagers = formData.managers?.filter((_, i) => i !== index) || [];
                        setFormData({ ...formData, managers: updatedManagers });
                      }}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                ))}
                
                {/* 관리자 추가 버튼 */}
                <button
                  type="button"
                  onClick={() => {
                    const newManager: Manager = {
                      id: Date.now().toString(),
                      name: '',
                      email: '',
                      phone: '',
                      role: 'general',
                      departmentId: department?.id || '',
                    };
                    setFormData({ 
                      ...formData, 
                      managers: [...(formData.managers || []), newManager] 
                    });
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center"
                >
                  <span className="text-xl mr-2">+</span>
                  관리자 추가
                </button>
              </div>
            </div>
            
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
      const mockDepartments: Department[] = [
        {
          id: 'dept-1',
          name: '안전관리부',
          companyId: 'comp-1',
          managers: [
            { id: 'manager-1', name: '김안전', email: 'safety.kim@example.com', phone: '010-1111-1111', role: 'safety', departmentId: 'dept-1' },
            { id: 'manager-2', name: '이안전', email: 'safety.lee@example.com', phone: '010-2222-2222', role: 'safety', departmentId: 'dept-1' },
          ],
        },
        {
          id: 'dept-2',
          name: 'IT지원부',
          companyId: 'comp-1',
          managers: [
            { id: 'manager-3', name: '박지원', email: 'support.park@example.com', phone: '010-3333-3333', role: 'admin', departmentId: 'dept-2' },
            { id: 'manager-4', name: '최지원', email: 'support.choi@example.com', phone: '010-4444-4444', role: 'general', departmentId: 'dept-2' },
          ],
        },
        {
          id: 'dept-3',
          name: '시설관리부',
          companyId: 'comp-2',
          managers: [
              { id: 'manager-5', name: '정시설', email: 'facility.jung@example.com', phone: '010-5555-5555', role: 'general', departmentId: 'dept-3' },
          ]
        }
      ];
      setDepartments(mockDepartments);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveDepartment = (departmentData: Department) => {
    // 실제로는 API 호출
    if (editingDepartment) {
      setDepartments(prev => prev.map(d => d.id === departmentData.id ? departmentData : d));
    } else {
      setDepartments(prev => [...prev, departmentData]);
    }
    setIsDeptModalOpen(false);
    setEditingDepartment(null);
  };

  const handleSaveManager = (managerData: Manager) => {
    setDepartments(prev => prev.map(dept => {
      if (dept.id === selectedDepartmentId) {
        const updatedManagers = editingManager 
          ? dept.managers.map(m => m.id === managerData.id ? managerData : m)
          : [...dept.managers, managerData];
        return { ...dept, managers: updatedManagers };
      }
      return dept;
    }));
    setIsManagerModalOpen(false);
    setEditingManager(null);
    setSelectedDepartmentId('');
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">담당부서 관리</h1>
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
                      <p className="text-xs text-gray-400">관리자 {dept.managers.length}명</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => { setEditingDepartment(dept); setIsDeptModalOpen(true); }}
                      className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                    >
                      수정
                    </button>
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-4">
                  {dept.managers.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">등록된 관리자가 없습니다.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dept.managers.map(manager => (
                        <div key={manager.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{manager.name}</h4>
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {roleLabels[manager.role]}
                              </span>
                            </div>
                            <button
                              onClick={() => { setSelectedDepartmentId(dept.id); setEditingManager(manager); setIsManagerModalOpen(true); }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              수정
                            </button>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>📧 {manager.email}</p>
                            <p>📱 {manager.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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