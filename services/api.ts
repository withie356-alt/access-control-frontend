
import { AccessApplication, ApplicationStatus, Company, Project, DailyStats, StatusStats, Department, Manager } from '../types';

let mockApplications: AccessApplication[] = [
  { id: '1', name: '홍길동', phone: '010-1234-5678', company: '삼성물산', projectName: 'A동 신축공사', vehicleNumber: '12가 3456', vehicleType: '승용차', gender: '남성', nationality: '한국', roles: ['현장대리인'], agreedOn: new Date().toISOString(), signature: '', status: ApplicationStatus.Pending, createdAt: '2024-07-28T10:00:00Z', department: '안전관리팀' },
  { id: '2', name: '김철수', phone: '010-2345-6789', company: '현대건설', projectName: 'B동 리모델링', vehicleNumber: '', vehicleType: '', gender: '남성', nationality: '미국', passportNumber: 'M1234567', roles: ['차량소유자'], agreedOn: new Date().toISOString(), signature: '', status: ApplicationStatus.Pending, createdAt: '2024-07-28T11:00:00Z', department: '공사팀' },
  { id: '3', name: '이영희', phone: '010-3456-7890', company: 'GS건설', projectName: '중앙광장 조성', vehicleNumber: '', vehicleType: '', gender: '여성', nationality: '한국', roles: [], agreedOn: new Date().toISOString(), signature: '', status: ApplicationStatus.Approved, createdAt: '2024-07-27T14:00:00Z', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=approved-3', department: '설비팀' },
  { id: '4', name: '박보검', phone: '010-4567-8901', company: '삼성물산', projectName: 'A동 신축공사', vehicleNumber: '', vehicleType: '', gender: '남성', nationality: '한국', roles: ['현장대리인', '차량소유자'], agreedOn: new Date().toISOString(), signature: '', status: ApplicationStatus.Approved, createdAt: '2024-07-27T09:00:00Z', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=approved-4', department: '안전관리팀' },
  { id: '5', name: '송중기', phone: '010-5678-9012', company: '포스코이앤씨', projectName: '지하주차장 증설', vehicleNumber: '', vehicleType: '', gender: '남성', nationality: '한국', roles: [], agreedOn: new Date().toISOString(), signature: '', status: ApplicationStatus.Rejected, createdAt: '2024-07-26T16:00:00Z', department: '공사팀' },
];

let mockProjects: Project[] = [
  { id: '1', name: 'A동 신축공사', startDate: '2024-01-01', endDate: '2024-12-31', manager: '김현장', department: '안전관리팀', description: 'A동 건물 신축' },
  { id: '2', name: 'B동 리모델링', startDate: '2024-03-01', endDate: '2025-02-28', manager: '이안전', department: '공사팀', description: 'B동 내부 및 외부 리모델링' },
  { id: '3', name: '중앙광장 조성', startDate: '2024-06-01', endDate: '2024-09-30', manager: '박조경', department: '설비팀', description: '휴게 공간 및 녹지 조성' },
  { id: '4', name: '지하주차장 증설', startDate: '2024-08-01', endDate: '2025-01-31', manager: '최주차', department: '공사팀', description: '기존 지하주차장 확장 공사' },
];

let mockCompanies: Company[] = [
  { id: '1', name: '삼성물산', contactPerson: '나삼성', contactPhone: '02-111-1111' },
  { id: '2', name: '현대건설', contactPerson: '정현대', contactPhone: '02-222-2222' },
  { id: '3', name: 'GS건설', contactPerson: '허지에스', contactPhone: '02-333-3333' },
  { id: '4', name: '포스코이앤씨', contactPerson: '김포스코', contactPhone: '02-444-4444'},
];

let mockDepartments: Department[] = [
  {
    id: '1',
    name: '안전관리팀',
    managers: [
      {
        id: '1',
        name: '김안전',
        email: 'safety@company.com',
        phone: '010-1111-1111',
        role: 'safety',
        departmentId: '1'
      },
      {
        id: '2',
        name: '이관리',
        email: 'manager@company.com',
        phone: '010-2222-2222',
        role: 'admin',
        departmentId: '1'
      }
    ]
  },
  {
    id: '2',
    name: '시설관리팀',
    managers: [
      {
        id: '3',
        name: '박시설',
        email: 'facility@company.com',
        phone: '010-3333-3333',
        role: 'general',
        departmentId: '2'
      }
    ]
  },
  {
    id: '3',
    name: '공사관리팀',
    managers: [
      {
        id: '4',
        name: '최공사',
        email: 'construction@company.com',
        phone: '010-4444-4444',
        role: 'admin',
        departmentId: '3'
      },
      {
        id: '5',
        name: '정안전',
        email: 'safety2@company.com',
        phone: '010-5555-5555',
        role: 'safety',
        departmentId: '3'
      }
    ]
  }
];

const simulateDelay = <T,>(data: T): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), 500));

const api = {
  getProjects: async (): Promise<Project[]> => {
    console.log('API: Fetching projects');
    return simulateDelay(mockProjects);
  },
  
  submitApplication: async (applicationData: Omit<AccessApplication, 'id' | 'status' | 'createdAt' | 'qrCodeUrl'>): Promise<AccessApplication> => {
    console.log('API: Submitting application', applicationData);
    
    // Auto-register company if not exists
    let company = mockCompanies.find(c => c.name === applicationData.company);
    if (!company) {
      const newCompany: Company = {
        id: (mockCompanies.length + 1).toString(),
        name: applicationData.company
      };
      mockCompanies.push(newCompany);
      console.log('API: Auto-registered new company', newCompany);
    }

    const newApplication: AccessApplication = {
      ...applicationData,
      id: (mockApplications.length + 1).toString(),
      status: ApplicationStatus.Pending,
      createdAt: new Date().toISOString(),
    };
    mockApplications.push(newApplication);
    return simulateDelay(newApplication);
  },

  getApplicationsByPhone: async (phone: string): Promise<AccessApplication[]> => {
    console.log('API: Fetching applications for phone', phone);
    const results = mockApplications.filter(app => app.phone === phone);
    return simulateDelay(results);
  },
  
  updateApplication: async (id: string, data: Partial<AccessApplication>): Promise<AccessApplication> => {
    console.log('API: Updating application', id, data);
    let application = mockApplications.find(app => app.id === id);
    if (application) {
      application = { ...application, ...data };
      mockApplications = mockApplications.map(app => app.id === id ? application! : app);
      return simulateDelay(application);
    }
    throw new Error('Application not found');
  },

  getAllApplications: async (): Promise<AccessApplication[]> => {
    console.log('API: Fetching all applications');
    return simulateDelay([...mockApplications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  },

  approveApplications: async (ids: string[]): Promise<AccessApplication[]> => {
    console.log('API: Approving applications', ids);
    const updated: AccessApplication[] = [];
    mockApplications = mockApplications.map(app => {
      if (ids.includes(app.id)) {
        const newApp = { ...app, status: ApplicationStatus.Approved, qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=approved-${app.id}` };
        updated.push(newApp);
        return newApp;
      }
      return app;
    });
    return simulateDelay(updated);
  },

  rejectApplications: async (ids: string[]): Promise<AccessApplication[]> => {
    console.log('API: Rejecting applications', ids);
    const updated: AccessApplication[] = [];
    mockApplications = mockApplications.map(app => {
      if (ids.includes(app.id)) {
        const newApp = { ...app, status: ApplicationStatus.Rejected, qrCodeUrl: undefined };
        updated.push(newApp);
        return newApp;
      }
      return app;
    });
    return simulateDelay(updated);
  },

  deleteApplication: async (id: string): Promise<{id: string}> => {
    console.log('API: Deleting application', id);
    const initialLength = mockApplications.length;
    mockApplications = mockApplications.filter(app => app.id !== id);
    if (mockApplications.length === initialLength) {
      throw new Error('Application not found');
    }
    return simulateDelay({ id });
  },

  getDashboardStats: async () => {
    console.log('API: Fetching dashboard stats');
    const dailyStats: DailyStats[] = [
      { date: '7/22', entered: 30, exited: 25 },
      { date: '7/23', entered: 45, exited: 40 },
      { date: '7/24', entered: 50, exited: 48 },
      { date: '7/25', entered: 42, exited: 42 },
      { date: '7/26', entered: 60, exited: 55 },
      { date: '7/27', entered: 58, exited: 58 },
      { date: '7/28', entered: 25, exited: 10 },
    ];
    
    const onSiteNow = dailyStats[dailyStats.length - 1].entered - dailyStats[dailyStats.length - 1].exited;
    const exitedToday = dailyStats[dailyStats.length - 1].exited;

    const statusStats: StatusStats[] = [
        { name: ApplicationStatus.Pending, value: mockApplications.filter(a => a.status === ApplicationStatus.Pending).length },
        { name: ApplicationStatus.Approved, value: mockApplications.filter(a => a.status === ApplicationStatus.Approved).length },
        { name: ApplicationStatus.Rejected, value: mockApplications.filter(a => a.status === ApplicationStatus.Rejected).length },
    ];
    
    return simulateDelay({ dailyStats, onSiteNow, exitedToday, statusStats });
  },

  getCompanies: async (): Promise<Company[]> => {
    console.log('API: Fetching companies');
    return simulateDelay(mockCompanies);
  },

  getDepartments: async (): Promise<Department[]> => {
    console.log('API: Fetching departments');
    return simulateDelay(mockDepartments);
  },
  
  addProject: async (projectData: Omit<Project, 'id'>): Promise<Project> => {
      console.log('API: Adding project', projectData);
      const newProject: Project = {
          ...projectData,
          id: (mockProjects.length + 1).toString(),
      };
      mockProjects.push(newProject);
      return simulateDelay(newProject);
  },
  
  updateProject: async(project: Project): Promise<Project> => {
    console.log('API: Updating project', project);
    mockProjects = mockProjects.map(p => p.id === project.id ? project : p);
    return simulateDelay(project);
  },
  
  deleteProject: async (id: string): Promise<{id: string}> => {
    console.log('API: Deleting project', id);
    mockProjects = mockProjects.filter(p => p.id !== id);
    return simulateDelay({ id });
  },
  
  updateCompany: async(company: Company): Promise<Company> => {
    console.log('API: Updating company', company);
    mockCompanies = mockCompanies.map(c => c.id === company.id ? company : c);
    return simulateDelay(company);
  },
  
  deleteCompany: async (id: string): Promise<{id: string}> => {
    console.log('API: Deleting company', id);
    mockCompanies = mockCompanies.filter(c => c.id !== id);
    return simulateDelay({ id });
  }
};

export default api;
