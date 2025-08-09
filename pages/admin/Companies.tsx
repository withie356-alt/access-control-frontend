
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Company, Department, Manager } from '../../types';

const CompanyModal: React.FC<{
  company: Company | null;
  departments: Department[];
  onClose: () => void;
  onSave: (company: Company) => void;
}> = ({ company, departments, onClose, onSave }) => {
  const [formData, setFormData] = useState<Company | null>(company);
  const [managers, setManagers] = useState<Manager[]>([]);

  useEffect(() => {
    setFormData(company);
  }, [company]);

  useEffect(() => {
    if (formData?.department) {
      const selectedDept = departments.find(d => d.name === formData.department);
      setManagers(selectedDept ? selectedDept.managers : []);
    } else {
      setManagers([]);
    }
  }, [formData?.department, departments]);

  if (!formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'department') {
        setFormData({ ...formData, department: value, manager: '' }); // Reset manager when department changes
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">업체 정보 수정</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">업체명</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3" required />
          </div>
          <div>
            <label className="block text-sm font-medium">담당부서</label>
            <select 
              name="department" 
              value={formData.department || ''} 
              onChange={handleChange}
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="">담당부서를 선택하세요</option>
              {departments.map(department => (
                <option key={department.id} value={department.name}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">담당자</label>
            <select 
              name="manager" 
              value={formData.manager || ''} 
              onChange={handleChange}
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3"
              disabled={!formData.department}
            >
              <option value="">{formData.department ? '담당자를 선택하세요' : '담당부서를 먼저 선택하세요'}</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.name}>
                  {manager.name} ({manager.role === 'general' ? '일반' : manager.role === 'safety' ? '안전관리자' : '관리자'})
                </option>
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

const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [companiesData, departmentsData] = await Promise.all([
        api.getCompanies(),
        api.getDepartments?.() || Promise.resolve([])
      ]);
      setCompanies(companiesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (companyData: Company) => {
     try {
        await api.updateCompany(companyData);
        fetchData();
        setIsModalOpen(false);
        setEditingCompany(null);
    } catch(err) {
        alert("저장에 실패했습니다.");
    }
  }

  const handleDelete = async (id: string) => {
    if(window.confirm('정말로 이 업체 정보를 삭제하시겠습니까?')) {
        try {
            await api.deleteCompany(id);
            fetchData();
        } catch(err) {
            alert('삭제에 실패했습니다.');
        }
    }
  }
  
  const filteredCompanies = React.useMemo(() => {
    return companies.filter(company => {
      const lowercasedFilter = searchTerm.toLowerCase();
      const matchesName = company.name.toLowerCase().includes(lowercasedFilter);
      const matchesDepartment = company.department?.toLowerCase().includes(lowercasedFilter) || false;
      const matchesManager = company.manager?.toLowerCase().includes(lowercasedFilter) || false;
      
      return matchesName || matchesDepartment || matchesManager;
    });
  }, [companies, searchTerm]);

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
        </div>
      </div>

      {showSearchInput && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <input
            type="text"
            placeholder="업체명, 담당부서, 담당자 검색..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-3 rounded-lg border-gray-300 shadow-sm"
          />
        </div>
      )}
      
      

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">업체명</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">담당부서</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">담당자</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-4">로딩 중...</td></tr>
            ) : filteredCompanies.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 text-gray-500">검색 결과가 없습니다.</td></tr>
            ) : filteredCompanies.map(c => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{c.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {c.department ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {c.department}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{c.manager || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                  <button onClick={() => { setEditingCompany(c); setIsModalOpen(true); }} className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">수정</button>
                  <button onClick={() => handleDelete(c.id)} className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <CompanyModal 
          company={editingCompany} 
          departments={departments}
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};

export default CompaniesPage;
