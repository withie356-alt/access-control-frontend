
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Project, ApplicationStatus, Company } from '../../types';

const ApplyPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    company: '',
    projectName: '',
    gender: '',
    nationality: '한국',
    passportNumber: '',
    isSiteRepresentative: false,
    vehicleOwner: false,
    vehicleOwnerName: '',
    vehicleNumber: '',
    vehicleType: '',
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [newCompanyData, setNewCompanyData] = useState({ name: '', department: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProjects, fetchedCompanies] = await Promise.all([
          api.getProjects(),
          api.getCompanies()
        ]);
        setProjects(fetchedProjects);
        setCompanies(fetchedCompanies);
        if (fetchedProjects.length > 0) {
          setFormData(prev => ({ ...prev, projectName: fetchedProjects[0].name }));
        }
      } catch (err) {
        setError('데이터를 불러오는 데 실패했습니다.');
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSiteRepresentativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, isSiteRepresentative: e.target.checked }));
  };

  const handleVehicleOwnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      vehicleOwner: e.target.checked,
      // 차량 소유자 체크 해제 시 차량 정보 초기화
      ...(e.target.checked ? {} : { vehicleOwnerName: '', vehicleNumber: '', vehicleType: '' }),
    }));
  };

  const handleProjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectName = e.target.value;
    const project = projects.find(p => p.name === projectName) || null;
    setSelectedProject(project);
    setFormData(prev => ({ ...prev, projectName }));
  };

  const handleCompanySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setCompanySearchTerm(searchTerm);
    
    if (searchTerm.trim()) {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
      setShowCompanyDropdown(true);
      setShowNewCompanyForm(filtered.length === 0);
    } else {
      setShowCompanyDropdown(false);
      setShowNewCompanyForm(false);
      setSelectedCompany(null);
      setFormData(prev => ({ ...prev, company: '' }));
    }
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setCompanySearchTerm(company.name);
    setFormData(prev => ({ ...prev, company: company.name }));
    setShowCompanyDropdown(false);
    setShowNewCompanyForm(false);
  };

  const handleNewCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCompanyData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewCompany = () => {
    if (newCompanyData.name.trim()) {
      const newCompany: Company = {
        id: Date.now().toString(),
        name: newCompanyData.name,
        department: newCompanyData.department || undefined
      };
      
      // 새 업체를 목록에 추가
      setCompanies(prev => [...prev, newCompany]);
      setSelectedCompany(newCompany);
      setCompanySearchTerm(newCompany.name);
      setFormData(prev => ({ ...prev, company: newCompany.name }));
      setShowNewCompanyForm(false);
      setShowCompanyDropdown(false);
      setNewCompanyData({ name: '', department: '' });
    }
  };

  const validateStep2 = () => {
    return formData.name && formData.phone && formData.dateOfBirth && formData.company && formData.projectName && formData.gender && formData.nationality && (!formData.vehicleOwner || (formData.vehicleOwnerName && formData.vehicleNumber && formData.vehicleType));
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const submissionData = {
        ...formData,
        agreedOn: new Date().toISOString(),
      };
      await api.submitApplication(submissionData);
      alert('출입 신청이 성공적으로 완료되었습니다. 신청 내역 조회 페이지로 이동합니다.');
      navigate('/check');
    } catch (err) {
      setError('신청 제출에 실패했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md">
      
      
      <div className="w-full mb-6 sm:mb-8">
        <div className="flex justify-between items-center">
          <div className={`flex-1 text-center ${step >= 1 ? 'text-power-blue-600' : 'text-gray-400'}`}>
            <div className="mx-auto w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center bg-white text-sm sm:text-base font-semibold">1</div>
            <p className="text-xs sm:text-sm mt-1">약관 동의</p>
          </div>
          <div className="flex-1 border-t-2 mx-2"></div>
          <div className={`flex-1 text-center ${step >= 2 ? 'text-power-blue-600' : 'text-gray-400'}`}>
            <div className="mx-auto w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center bg-white text-sm sm:text-base font-semibold">2</div>
            <p className="text-xs sm:text-sm mt-1">정보 입력</p>
          </div>
          <div className="flex-1 border-t-2 mx-2"></div>
           <div className={`flex-1 text-center ${step >= 3 ? 'text-power-blue-600' : 'text-gray-400'}`}>
            <div className="mx-auto w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center bg-white text-sm sm:text-base font-semibold">3</div>
            <p className="text-xs sm:text-sm mt-1">신청 완료</p>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">이용 약관 및 개인정보 처리방침</h2>
            <div className="h-40 sm:h-48 overflow-y-scroll border p-3 sm:p-4 bg-gray-50 rounded-md text-xs sm:text-sm text-gray-600">
              <p><strong>제1조 (목적)</strong></p>
              <p>본 약관은 현장 출입 관리 시스템의 이용 조건 및 절차, 이용자와 회사의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
              <p className="mt-2"><strong>제2조 (개인정보 수집 및 이용)</strong></p>
              <p>회사는 원활한 출입 관리를 위해 다음의 개인정보를 수집합니다: 성명, 연락처, 소속, 차량번호. 수집된 정보는 출입 관리 목적 외에는 사용되지 않으며, 관련 법령에 따라 안전하게 보관 및 파기됩니다.</p>
              <p className="mt-4">이용자는 위 내용에 동의함으로써 서비스를 이용할 수 있습니다.</p>
            </div>
            <div className="mt-3 sm:mt-4 flex items-start">
              <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="h-4 w-4 text-power-blue-600 border-gray-300 rounded focus:ring-power-blue-500 mt-0.5 flex-shrink-0" />
              <label htmlFor="agree" className="ml-2 block text-xs sm:text-sm text-gray-900 leading-relaxed">
                위 이용 약관 및 개인정보 처리방침에 모두 동의합니다.
              </label>
            </div>
            <div className="mt-4 sm:mt-6 flex justify-center sm:justify-end">
              <button type="button" onClick={() => setStep(2)} disabled={!agreed} className="w-full sm:w-auto px-6 py-2 sm:py-3 bg-power-blue-600 text-white text-sm sm:text-base rounded-md hover:bg-power-blue-700 disabled:bg-gray-400 font-medium">
                다음
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            {/* 공사계획 선택 섹션 */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-blue-800">공사계획 선택</h2>
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">공사계획을 선택해주세요 *</label>
                <select 
                  name="projectName" 
                  id="projectName" 
                  value={formData.projectName} 
                  onChange={handleProjectSelect} 
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm sm:text-base py-3 px-4" 
                  required
                >
                  <option value="">공사계획을 선택하세요</option>
                  {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>

              {/* 선택된 공사 정보 표시 */}
              {selectedProject && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">선택된 공사 정보</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div>
                      <span className="font-medium text-gray-600">공사명:</span>
                      <p className="text-gray-800 mt-1">{selectedProject.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">관리자:</span>
                      <p className="text-gray-800 mt-1">{selectedProject.manager}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">시작일:</span>
                      <p className="text-gray-800 mt-1">{new Date(selectedProject.startDate).toLocaleDateString('ko-KR')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">종료일:</span>
                      <p className="text-gray-800 mt-1">{new Date(selectedProject.endDate).toLocaleDateString('ko-KR')}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-medium text-gray-600">공사내용:</span>
                      <p className="text-gray-800 mt-1 leading-relaxed">{selectedProject.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 소속업체 선택 섹션 */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-green-800">소속업체 선택</h2>
              <div className="relative">
                <label htmlFor="companySearch" className="block text-sm font-medium text-gray-700 mb-2">업체명을 입력하세요 *</label>
                <input 
                  type="text" 
                  id="companySearch"
                  value={companySearchTerm} 
                  onChange={handleCompanySearch}
                  placeholder="업체명을 입력하면 검색됩니다..."
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm sm:text-base py-3 px-4" 
                  required 
                />
                
                {/* 검색 결과 드롭다운 */}
                {showCompanyDropdown && filteredCompanies.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCompanies.map(company => (
                      <div
                        key={company.id}
                        onClick={() => handleCompanySelect(company)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{company.name}</div>
                        {company.department && (
                          <div className="text-xs text-gray-500">담당부서: {company.department}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 선택된 업체 정보 표시 */}
              {selectedCompany && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">선택된 업체 정보</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div>
                      <span className="font-medium text-gray-600">업체명:</span>
                      <p className="text-gray-800 mt-1">{selectedCompany.name}</p>
                    </div>
                    {selectedCompany.department && (
                      <div>
                        <span className="font-medium text-gray-600">담당부서:</span>
                        <p className="text-gray-800 mt-1">{selectedCompany.department}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 새 업체 등록 폼 */}
              {showNewCompanyForm && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="text-sm sm:text-base font-semibold text-yellow-800 mb-3">검색된 업체가 없습니다. 새 업체를 등록하시겠습니까?</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">업체명 *</label>
                      <input 
                        type="text" 
                        name="name"
                        value={newCompanyData.name}
                        onChange={handleNewCompanyChange}
                        placeholder="업체명을 입력하세요"
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm py-3 px-4" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">담당부서 (선택사항)</label>
                      <input 
                        type="text" 
                        name="department"
                        value={newCompanyData.department}
                        onChange={handleNewCompanyChange}
                        placeholder="담당부서를 입력하세요 (선택사항)"
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm py-3 px-4" 
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        type="button"
                        onClick={handleAddNewCompany}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        업체 등록
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowNewCompanyForm(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 기본정보 입력 섹션 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">기본정보</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">성명 *</label>
                  <input 
                    type="text" 
                    name="name" 
                    id="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm sm:text-base py-3 px-4" 
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">연락처 *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    id="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm sm:text-base py-3 px-4" 
                    placeholder="010-0000-0000" 
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">생년월일 *</label>
                  <p className="text-xs text-gray-500 mb-1">예: 860526 (1986년 5월 26일)</p>
                  <input 
                    type="text" 
                    name="dateOfBirth" 
                    id="dateOfBirth" 
                    value={formData.dateOfBirth} 
                    onChange={handleInputChange} 
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm sm:text-base py-3 px-4" 
                    placeholder="YYMMDD" 
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">성별 *</label>
                  <select 
                    name="gender" 
                    id="gender" 
                    value={formData.gender} 
                    onChange={handleInputChange} 
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm sm:text-base py-3 px-4" 
                    required
                  >
                    <option value="">성별을 선택하세요</option>
                    <option value="남성">남성</option>
                    <option value="여성">여성</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">국적 *</label>
                  <select 
                    name="nationality" 
                    id="nationality" 
                    value={formData.nationality} 
                    onChange={handleInputChange} 
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm sm:text-base py-3 px-4" 
                    required
                  >
                    <option value="한국">한국</option>
                    <option value="미국">미국</option>
                    <option value="중국">중국</option>
                    <option value="일본">일본</option>
                    <option value="베트남">베트남</option>
                    <option value="태국">태국</option>
                    <option value="필리핀">필리핀</option>
                    <option value="인도네시아">인도네시아</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                {formData.nationality !== '한국' && (
                  <div className="sm:col-span-2">
                    <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700 mb-2">여권번호 *</label>
                    <input 
                      type="text" 
                      name="passportNumber" 
                      id="passportNumber" 
                      value={formData.passportNumber} 
                      onChange={handleInputChange} 
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm sm:text-base py-3 px-4" 
                      placeholder="여권번호를 입력하세요"
                      required 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 역할선택 섹션 */}
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-purple-800">역할선택</h2>
              <p className="text-sm text-gray-600 mb-4">해당하는 역할을 선택해주세요 (선택사항)</p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <input 
                    type="checkbox" 
                    id="isSiteRepresentative" 
                    checked={formData.isSiteRepresentative}
                    onChange={handleSiteRepresentativeChange}
                    className="h-5 w-5 text-power-blue-600 border-gray-300 rounded focus:ring-power-blue-500 mt-0.5 flex-shrink-0" 
                  />
                  <label htmlFor="isSiteRepresentative" className="ml-3 block text-sm text-gray-900">
                    <span className="font-medium">현장대리인</span>
                    <span className="text-gray-500 text-xs block mt-1">현장관리 및 감독업무</span>
                  </label>
                </div>
                <div className="flex items-start">
                  <input 
                    type="checkbox" 
                    id="vehicleOwner" 
                    checked={formData.vehicleOwner}
                    onChange={handleVehicleOwnerChange}
                    className="h-5 w-5 text-power-blue-600 border-gray-300 rounded focus:ring-power-blue-500 mt-0.5 flex-shrink-0" 
                  />
                  <label htmlFor="vehicleOwner" className="ml-3 block text-sm text-gray-900">
                    <span className="font-medium">차량소유자</span>
                    <span className="text-gray-500 text-xs block mt-1">차량 운행 및 관리</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 차량정보 입력 섹션 */}
            {formData.vehicleOwner && (
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-orange-800">차량정보</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vehicleOwnerName" className="block text-sm font-medium text-gray-700 mb-2">차량 소유자 이름 *</label>
                    <input 
                      type="text" 
                      name="vehicleOwnerName" 
                      id="vehicleOwnerName" 
                      value={formData.vehicleOwnerName} 
                      onChange={handleInputChange} 
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm sm:text-base py-3 px-4" 
                      placeholder="차량 소유자 이름을 입력하세요"
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-2">차량번호 *</label>
                    <input 
                      type="text" 
                      name="vehicleNumber" 
                      id="vehicleNumber" 
                      value={formData.vehicleNumber} 
                      onChange={handleInputChange} 
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm sm:text-base py-3 px-4" 
                      placeholder="예: 12가 3456"
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-2">차량종류 *</label>
                    <select 
                      name="vehicleType" 
                      id="vehicleType" 
                      value={formData.vehicleType} 
                      onChange={handleInputChange} 
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-power-blue-500 focus:ring-power-blue-500 text-sm sm:text-base py-3 px-4" 
                      required
                    >
                      <option value="">차량종류를 선택하세요</option>
                      <option value="승용차">승용차</option>
                      <option value="승합차">승합차</option>
                      <option value="화물차">화물차</option>
                      <option value="특수차">특수차</option>
                      <option value="이륜차">이륜차</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 버튼 영역 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between">
              <button type="button" onClick={() => setStep(1)} className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 text-sm sm:text-base rounded-lg hover:bg-gray-300 font-medium">
                이전
              </button>
              <button type="submit" disabled={isLoading || !validateStep2()} onClick={() => setStep(3)} className="w-full sm:w-auto px-6 py-3 bg-power-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-power-blue-700 disabled:bg-gray-400 font-medium">
                {isLoading ? '제출 중...' : '신청 완료'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ApplyPage;
