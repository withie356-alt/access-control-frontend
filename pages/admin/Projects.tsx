
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Project, Department, Manager } from '../../types';

const ProjectModal: React.FC<{
  project: Project | null;
  onClose: () => void;
  onSave: (project: Project | Omit<Project, 'id'>) => void;
}> = ({ project, onClose, onSave }) => {
  const [formData, setFormData] = useState<Project | Omit<Project, 'id'>>({
    name: '',
    startDate: '',
    endDate: '',
    manager: '',
    department: '',
    description: '',
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);

  useEffect(() => {
    api.getDepartments().then(setDepartments);
  }, []);

  useEffect(() => {
    if (project) {
      setFormData(project);
    } else {
      setFormData({ name: '', startDate: '', endDate: '', manager: '', department: '', description: '' });
    }
  }, [project]);

  useEffect(() => {
    // 부서가 선택되면 해당 부서의 매니저만 필터링
    const dept = departments.find(d => d.name === formData.department);
    setManagers(dept ? dept.managers : []);
    // 부서가 바뀌면 담당자도 초기화
    setFormData(prev => ({ ...prev, manager: '' }));
    // eslint-disable-next-line
  }, [formData.department, departments]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) {
      alert('공사명, 시작일, 종료일은 필수입니다.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{project ? '공사 정보 수정' : '새 공사 등록'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">공사명 *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">시작일 *</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3" required/>
            </div>
            <div>
              <label className="block text-sm font-medium">종료일 *</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3" required/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">담당부서</label>
            <select name="department" value={formData.department || ''} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3">
              <option value="">담당부서를 선택하세요</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">담당자</label>
            <select name="manager" value={formData.manager || ''} onChange={handleChange} className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3" disabled={!formData.department}>
              <option value="">{formData.department ? '담당자를 선택하세요' : '담당부서를 먼저 선택하세요'}</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.name}>{manager.name} ({manager.role === 'general' ? '일반' : manager.role === 'safety' ? '안전관리자' : '관리자'})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">공사 내용</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full mt-1 border-gray-300 rounded-md shadow-sm py-2 px-3"></textarea>
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
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Planned' | 'InProgress' | 'Completed'>('All');

  const projectCounts = React.useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Ignore time for date comparison

    let planned = 0;
    let inProgress = 0;
    let completed = 0;

    projects.forEach(project => {
      const startDate = new Date(project.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(project.endDate);
      endDate.setHours(0, 0, 0, 0);

      if (startDate > now) {
        planned++;
      } else if (startDate <= now && endDate >= now) {
        inProgress++;
      } else if (endDate < now) {
        completed++;
      }
    });

    return {
      Planned: planned,
      InProgress: inProgress,
      Completed: completed,
      Total: projects.length,
    };
  }, [projects]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = React.useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.department && project.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (project.manager && project.manager.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterStatus === 'All') return true;

      const startDate = new Date(project.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(project.endDate);
      endDate.setHours(0, 0, 0, 0);

      if (filterStatus === 'Planned') {
        return startDate > now;
      } else if (filterStatus === 'InProgress') {
        return startDate <= now && endDate >= now;
      } else if (filterStatus === 'Completed') {
        return endDate < now;
      }
      return false;
    });
  }, [projects, searchTerm, filterStatus]);

  const handleSave = async (projectData: Project | Omit<Project, 'id'>) => {
    try {
        if ('id' in projectData) {
            await api.updateProject(projectData);
        } else {
            await api.addProject(projectData);
        }
        fetchProjects();
        setIsModalOpen(false);
        setEditingProject(null);
    } catch(err) {
        alert("저장에 실패했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('정말로 이 공사 정보를 삭제하시겠습니까?')) {
        try {
            await api.deleteProject(id);
            fetchProjects();
        } catch(err) {
            alert('삭제에 실패했습니다.');
        }
    }
  }

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

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-base font-medium text-blue-800">공사 계획</div>
            <div className="text-xl font-bold text-blue-600">{projectCounts.Planned}건</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-base font-medium text-yellow-800">공사 중</div>
            <div className="text-xl font-bold text-yellow-600">{projectCounts.InProgress}건</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-base font-medium text-green-800">공사 완료</div>
            <div className="text-xl font-bold text-green-600">{projectCounts.Completed}건</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-base font-medium text-gray-800">전체</div>
            <div className="text-xl font-bold text-gray-600">{projectCounts.Total}건</div>
          </div>
        </div>
      </div>

      {/* 카드형 UI */}
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
                {project.startDate} ~ {project.endDate}
              </div>
            </div>
            <div className="text-sm text-gray-600">담당부서: <span className="font-medium text-gray-800">{project.department || '-'}</span></div>
            <div className="text-sm text-gray-600">담당자: <span className="font-medium text-gray-800">{project.manager || '-'}</span></div>
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
      
      {isModalOpen && <ProjectModal project={editingProject} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
    </div>
  );
};

export default ProjectsPage;
