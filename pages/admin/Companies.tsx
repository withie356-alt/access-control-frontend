
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Company, Department } from '../../types';

const CompanyModal: React.FC<{
  company: Company | null;
  departments: Department[];
  onClose: () => void;
  onSave: (company: Company) => void;
}> = ({ company, departments, onClose, onSave }) => {
  const [formData, setFormData] = useState<Company | null>(company);

  useEffect(() => {
    setFormData(company);
  }, [company]);
  
  if(!formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium">담당부서</label>
            <select 
              name="department" 
              value={formData.department || ''} 
              onChange={handleChange}
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
            >
              <option value="">담당부서를 선택하세요</option>
              {departments.map(department => (
                <option key={department.id} value={department.name}>
                  {department.name}
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
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
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
  
  const filteredCompanies = companies.filter(c => {
    const matchesName = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentSearchTerm || 
      (c.department && c.department.toLowerCase().includes(departmentSearchTerm.toLowerCase()));
    return matchesName && matchesDepartment;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">업체 관리</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">업체명 검색</label>
            <input
              type="text"
              placeholder="업체명을 입력하세요..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">담당부서 검색</label>
            <input
              type="text"
              placeholder="담당부서를 입력하세요..."
              value={departmentSearchTerm}
              onChange={e => setDepartmentSearchTerm(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">출입 신청 시 등록되지 않은 업체는 자동으로 목록에 추가됩니다.</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">업체명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">담당부서</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={3} className="text-center py-4">로딩 중...</td></tr>
            ) : filteredCompanies.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-4 text-gray-500">검색 결과가 없습니다.</td></tr>
            ) : filteredCompanies.map(c => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {c.department ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {c.department}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => { setEditingCompany(c); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-900">수정</button>
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
