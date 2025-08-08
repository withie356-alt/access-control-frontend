
import React from 'react';
import { ShieldCheckIcon } from '../../components/icons';

const SafetyInfoPage: React.FC = () => {
    
  const safetyMaterials = [
    { name: '일반 안전 수칙 (v1.2)', url: '#' },
    { name: '물질안전보건자료 (MSDS) - 페인트', url: '#' },
    { name: '물질안전보건자료 (MSDS) - 시멘트', url: '#' },
    { name: '고소작업 안전 가이드라인', url: '#' },
  ];
  
  const handleDownload = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    alert('실제 환경에서는 파일이 다운로드됩니다.');
    console.log(`Downloading from ${url}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <ShieldCheckIcon className="w-8 h-8 mr-3 text-power-blue-600" />
            현장 안전 정보
        </h1>
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
        <h2 className="text-xl font-semibold mb-4">안전 교육 이수</h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-shrink-0">
             <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=safety-training" alt="Safety Training QR Code" className="w-36 h-36 rounded-lg" />
          </div>
          <div>
            <p className="text-gray-700">
              현장 출입 전, 위의 QR 코드를 스캔하여 온라인 안전 교육을 이수해야 합니다.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              교육은 약 10분 정도 소요되며, 이수 완료 후 출입이 가능합니다.
            </p>
            <button className="mt-4 px-4 py-2 bg-power-blue-600 text-white rounded-md hover:bg-power-blue-700">
              안전 교육 바로가기
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">안전 관련 자료</h2>
        <div className="space-y-3">
          {safetyMaterials.map((material, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
              <span className="text-gray-800">{material.name}</span>
              <a 
                href={material.url}
                onClick={(e) => handleDownload(e, material.url)}
                className="text-sm text-power-blue-600 hover:underline font-medium"
              >
                다운로드
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafetyInfoPage;
