
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Project, Department, Manager } from '../../types';

const ProjectModal: React.FC<{
  project: Project | null;
  departments: Department[]; // Department 데이터 추가
  allManagers: Manager[];    // Manager 데이터 추가
  onClose: () => void;
  onSave: (project: Project) => void;
}> = ({ project, departments, allManagers, onClose, onSave }) => {
  const [formData, setFormData] = useState<Project>({
    id: project?.id || crypto.randomUUID(),
    name: project?.name || '',
    start_date: project?.start_date || '',
    end_date: project?.end_date || '',
    manager_id: project?.manager_id || '',
    description: project?.description || '',
    created_at: project?.created_at || new Date().toISOString(),
  });

  const filteredManagers = allManagers.filter(
    (manager) => manager.department_id === formData.department_id
  );

  useEffect(() => {
    setFormData(project ? { ...project } : {
      id: crypto.randomUUID(),
      name: '',
      start_date: '',
      end_date: '',
      manager_id: '',
      description: '',
      created_at: new Date().toISOString(),
    });
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.start_date || !formData.end_date) {
      alert('공사명, 시작일, 종료일은 필수 항목입니다.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{project ? '공사 정보 수정' : <>새 공사 등록 <span className="text-base">(시작,종료일은 출입기간입니다)</span></>}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">공사명 *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">시작일 *</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3" required/>
            </div>
            <div>
              <label className="block text-sm font-medium">종료일 *</label>
              <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3" required/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">담당부서</label>
            <select
              name="department_id"
              value={formData.department_id || ''}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, department_id: e.target.value, manager_id: '' }));
              }}
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="">담당부서를 선택하세요</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">담당자</label>
            <select
              name="manager_id"
              value={formData.manager_id || ''}
              onChange={handleChange}
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3"
              disabled={!formData.department_id}
            >
              <option value="">{formData.department_id ? '담당자를 선택하세요' : '담당부서를 먼저 선택하세요'}</option>
              {filteredManagers.map(manager => (
                <option key={manager.id} value={manager.id}>{manager.name} ({manager.role === 'general' ? '일반' : manager.role === 'safety' ? '안전관리자' : '관리자'})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">공사 내용</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3"></textarea>
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

import { ArrowPathIcon } from '../../components/icons';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allManagers, setAllManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Planned' | 'InProgress' | 'Completed'>('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const [projectsData, departmentsData, managersData] = await Promise.all([
        api.getProjects(),
        api.getDepartments(),
        api.getManagers(),
      ]);
      setProjects(projectsData);
      setDepartments(departmentsData);
      setAllManagers(managersData);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSave = async (projectData: Project) => {
    try {
      if (editingProject) {
        await api.updateProject(projectData);
      } else {
        // 새 공사 등록 시, id와 created_at 필드를 제거하고 API 호출
        const { id, created_at, ...dataToSave } = projectData;
        await api.addProject(dataToSave as Omit<Project, 'id' | 'created_at'>);
      }
      fetchProjects(); // 데이터 새로고침
      setIsModalOpen(false);
      setEditingProject(null);
    } catch (err) {
      console.error("Failed to save project:", err);
      console.log("Detailed error object:", err);
      alert("저장에 실패했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말로 이 공사 정보를 삭제하시겠습니까?')) {
      try {
        await api.deleteProject(id);
        fetchProjects();
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

  const filteredProjects = React.useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (getDepartmentName(project.department_id).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (getManagerName(project.manager_id).toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterStatus === 'All') return true;

      const startDate = new Date(project.start_date || '');
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(project.end_date || '');
      endDate.setHours(0, 0, 0, 0);

      switch (filterStatus) {
        case 'Planned':
          return startDate > now;
        case 'InProgress':
          return startDate <= now && endDate >= now;
        case 'Completed':
          return endDate < now;
        default:
          return true;
      }
    });
  }, [projects, searchTerm, filterStatus, departments, allManagers]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center space-x-4">
          <button
            onClick={() => setShowSearchInput(!showSearchInput)}
            className="w-16 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            검색
          </button>
          <button onClick={() => { setEditingProject(null); setIsModalOpen(true); }} className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600">
            새 공사 등록
          </button>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'All' | 'Planned' | 'InProgress' | 'Completed')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <option value="All">전체</option>
            <option value="Planned">공사 계획</option>
            <option value="InProgress">공사 중</option>
            <option value="Completed">공사 완료</option>
          </select>
      </div>

      {showSearchInput && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <input
            type="text"
            placeholder="공사명, 담당부서, 담당자 검색..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-3 rounded-lg border-gray-300 shadow-sm"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-8">로딩 중...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">등록된 공사가 없습니다.</div>
        ) : filteredProjects.map(project => (
          <div key={project.id} className="rounded-xl shadow-md bg-white p-5 flex flex-col gap-2 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-lg text-gray-800">{project.name}</div>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {project.start_date} ~ {project.end_date}
              </div>
            </div>
            <div className="text-sm text-gray-600">담당부서: <span className="font-medium text-gray-800">{getDepartmentName(project.department_id) || '-'}</span></div>
            <div className="text-sm text-gray-600">담당자: <span className="font-medium text-gray-800">{getManagerName(project.manager_id) || '-'}</span></div>
            <div className="text-sm text-gray-500 mt-2 line-clamp-2">{project.description}</div>
            
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setEditingProject(project); setIsModalOpen(true); }} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50">
                수정
              </button>
              <button onClick={() => handleDelete(project.id)} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50">
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {isModalOpen && (
        <ProjectModal
          project={editingProject}
          departments={departments}
          allManagers={allManagers}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
