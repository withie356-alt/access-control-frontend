import React from 'react';
import { ShieldCheckIcon } from '../../components/icons';

const SafetyInfoPage: React.FC = () => {
    
  const safetyMaterials = [
    { name: '01.화기작업 안전', url: '/01.화기작업 안전.pdf' },
    { name: '02.밀폐공간작업안전', url: '/02.밀폐공간작업안전.pdf' },
    { name: '03.정전작업 안전', url: '/03.정전작업 안전.pdf' },
    { name: '04.굴착작업 안전', url: '/04.굴착작업 안전.pdf' },
    { name: '05-1. 고소작업자 추락방지장치 점검', url: '/05-1. 고소작업자 추락방지장치 점검.pdf' },
    { name: '05-2. 하역운반(고소작업대)', url: '/05-2. 하역운반(고소작업대).pdf' },
    { name: '06-1. 천장 크레인 안전작업', url: '/06-1. 천장 크레인 안전작업.pdf' },
    { name: '06-2. 이동식 크레인', url: '/06-2. 이동식 크레인.pdf' },
    { name: 'MSDS', url: '/MSDS.pdf' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        
        <p className="text-gray-600">
            모든 현장 인원의 안전을 위해 아래 내용을 반드시 숙지해주시기 바랍니다.
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">현장 안전 시설 위치</h2>
           <div className="w-full h-80 bg-gray-200 rounded-md flex items-center justify-center">
              <p className="text-gray-500">현장 안전 지도 (이미지)</p>
           </div>
           <ul className="mt-4 list-disc list-inside text-gray-700 space-y-1">
               <li><strong>소화전:</strong> 각 동 입구 및 지하주차장 C3 구역</li>
               <li><strong>비상 대피로:</strong> 각 동 중앙 계단 및 비상구 참조</li>
               <li><strong>제세동기(AED):</strong> 현장 사무실 및 A동 1층 로비</li>
               <li><strong>안전보호구함:</strong> 각 작업 구역 입구</li>
           </ul>
      </div>

      
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">안전 관련 자료</h2>
        <div className="space-y-3">
          {safetyMaterials.map((material, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
              <span className="text-gray-800">{material.name}</span>
              <div>
                <a
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-power-blue-600 hover:underline font-medium mr-4"
                >
                  보기
                </a>
                <a 
                  href={material.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-power-blue-600 hover:underline font-medium"
                >
                  다운로드
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafetyInfoPage;