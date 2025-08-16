
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Company, Department, Manager } from '../../types';

const CompanyModal: React.FC<{
  company: Company | null;
  departments: Department[]; // Department 데이터 추가
  allManagers: Manager[];    // Manager 데이터 추가
  onClose: () => void;
  onSave: (company: Company) => void;
}> = ({ company, departments, allManagers, onClose, onSave }) => {
  const [formData, setFormData] = useState<Company>(
    company || {
      id: crypto.randomUUID(),
      name: '',
      contact_person: '',
      phone_number: '',
      department_id: '',
      manager_id: '',
      created_at: new Date().toISOString(),
    }
  );

  // 선택된 부서에 해당하는 관리자들만 필터링
  const filteredManagers = allManagers.filter(
    (manager) => manager.department_id === formData.department_id
  );

  useEffect(() => {
    setFormData(
      company || {
        id: crypto.randomUUID(),
        name: '',
        contact_person: '',
        phone_number: '',
        department_id: '',
        manager_id: '',
        created_at: new Date().toISOString(),
      }
    );
  }, [company]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'manager_id') {
      const selectedManager = allManagers.find((manager) => manager.id === value);
      setFormData({
        ...formData,
        [name]: value,
        contact_person: selectedManager?.name || '',
        phone_number: selectedManager?.phone || '',
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // id와 created_at은 DB에서 자동 생성되므로 제외하고 전달
    const { id, created_at, ...dataToSave } = formData;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{company ? '업체 정보 수정' : '새 업체 등록'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">업체명 *</label>
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
            <label className="block text-sm font-medium">담당 부서</label>
            <select
              name="department_id"
              value={formData.department_id || ''}
              onChange={(e) => {
                setFormData({ ...formData, department_id: e.target.value, manager_id: '' }); // 부서 변경 시 관리자 초기화
              }}
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="">선택</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">담당 관리자</label>
            <select
              name="manager_id"
              value={formData.manager_id || ''}
              onChange={handleChange}
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3"
              disabled={!formData.department_id}
            >
              <option value="">선택</option>
              {filteredManagers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
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
  const [departments, setDepartments] = useState<Department[]>([]); // Department 상태 유지
  const [allManagers, setAllManagers] = useState<Manager[]>([]); // 모든 Manager 상태 추가
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [companiesData, departmentsData, managersData] = await Promise.all([
        api.getCompanies(),
        api.getDepartments(),
        api.getManagers(),
      ]);
      setCompanies(companiesData);
      setDepartments(departmentsData);
      setAllManagers(managersData);
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
      if (editingCompany) {
        await api.updateCompany(companyData);
      } else {
        // 새 업체 등록 시, id와 created_at 필드를 제거하고 API 호출
        const { id, created_at, ...dataToSave } = companyData;
        await api.addCompany(dataToSave as Omit<Company, 'id' | 'created_at'>);
      }
      fetchData(); // 데이터 새로고침
      setIsModalOpen(false);
      setEditingCompany(null);
    } catch (err) {
      console.error("Failed to save company:", err);
      alert("저장에 실패했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말로 이 업체 정보를 삭제하시겠습니까?')) {
      try {
        await api.deleteCompany(id);
        fetchData();
      } catch (err) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const getDepartmentName = (deptId: string | undefined) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : '-';
  };

  const getManagerName = (managerId: string | undefined) => {
    const manager = allManagers.find(m => m.id === managerId);
    return manager ? manager.name : '-';
  };

  const filteredCompanies = React.useMemo(() => {
    return companies.filter((company) => {
      const lowercasedFilter = searchTerm.toLowerCase();
      const matchesName = company.name.toLowerCase().includes(lowercasedFilter);
      const matchesContactPerson = company.contact_person?.toLowerCase().includes(lowercasedFilter) || false;
      const matchesDepartmentName = getDepartmentName(company.department_id).toLowerCase().includes(lowercasedFilter);
      const matchesManagerName = getManagerName(company.manager_id).toLowerCase().includes(lowercasedFilter);

      return (
        matchesName ||
        matchesContactPerson ||
        matchesDepartmentName ||
        matchesManagerName
      );
    });
  }, [companies, searchTerm, departments, allManagers]);

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
            onClick={() => { setIsModalOpen(true); setEditingCompany(null); }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            새 업체 등록
          </button>
        </div>
      </div>

      {showSearchInput && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <input
            type="text"
            placeholder="업체명, 담당부서, 담당자 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              <tr>
                <td colSpan={5} className="text-center py-4">로딩 중...</td>
              </tr>
            ) : filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">검색 결과가 없습니다.</td>
              </tr>
            ) : filteredCompanies.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{c.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getDepartmentName(c.department_id)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{getManagerName(c.manager_id)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                  <button
                    onClick={() => { setEditingCompany(c); setIsModalOpen(true); }}
                    className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                  >
                    삭제
                  </button>
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
          allManagers={allManagers}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default CompaniesPage;
