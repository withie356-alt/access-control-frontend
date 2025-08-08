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
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm" 
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
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm" 
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
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm" 
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
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm" 
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
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{department ? '담당부서 수정' : '담당부서 추가'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">부서명 *</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm" 
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
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm text-sm" 
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
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm text-sm" 
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
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm text-sm" 
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
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm text-sm" 
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
          
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">취소</button>
            <button type="submit" className="px-4 py-2 bg-power-blue-600 text-white rounded-md">저장</button>
          </div>
        </form>
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

  const fetchData = async () => {
    setLoading(true);
    try {
      // 실제로는 API에서 데이터를 가져와야 함
      setDepartments([]);
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
        <button
          onClick={() => { setEditingDepartment(null); setIsDeptModalOpen(true); }}
          className="px-4 py-2 bg-power-blue-600 text-white rounded-md hover:bg-power-blue-700"
        >
          부서 추가
        </button>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="부서명 검색..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 rounded-md border-gray-300 shadow-sm"
        />
      </div>

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
                      onClick={() => { setSelectedDepartmentId(dept.id); setEditingManager(null); setIsManagerModalOpen(true); }}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                    >
                      관리자 추가
                    </button>
                    <button
                      onClick={() => { setEditingDepartment(dept); setIsDeptModalOpen(true); }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
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