
# 작업 내역 및 계획 (TODOs)

이 문서는 프로젝트의 개발 작업 내역과 향후 계획을 관리합니다.

## Phase 1 (MVP) - 현재 구현 범위

### 프론트엔드 (UI/UX)
- [x] React + TypeScript + Tailwind CSS 프로젝트 구조 설정
- [x] `react-router-dom`을 사용한 HashRouter 기반 라우팅 설정
- [x] Power Automate 스타일의 디자인 시스템 구축 (색상, 컴포넌트)
- [x] 사용자 랜딩 페이지 (`/`)
- [x] 사용자 출입 신청 페이지 (`/apply`)
  - [x] 이용 약관 동의 UI
  - [x] 전자 서명 캔버스 구현
  - [x] 신청 정보 입력 폼
- [x] 사용자 신청 내역 조회 페이지 (`/check`)
  - [x] 전화번호 기반 조회
  - [x] 신청 상태에 따른 UI 분기 처리 (수정/QR코드 보기)
- [x] 사용자 안전 관리 페이지 (`/safety`)
- [x] 관리자 레이아웃 (사이드바 네비게이션 포함)
- [x] 관리자 대시보드 (`/admin/dashboard`)
  - [x] `recharts`를 사용한 통계 차트 시각화
- [x] 관리자 출입 승인 관리 페이지 (`/admin/approvals`)
  - [x] 신청 목록 테이블
  - [x] 검색 및 필터링 UI
  - [x] 개별/일괄 승인 및 반려 기능
- [x] 관리자 공사 관리 페이지 (`/admin/projects`)
- [x] 관리자 업체 관리 페이지 (`/admin/companies`)

### 백엔드 (Mock API)
- [x] `services/api.ts`에 Mock 데이터 및 API 함수 구현
- [x] `setTimeout`을 사용한 비동기 통신 시뮬레이션
- [x] 출입 신청, 조회, 승인/반려 로직 구현
- [x] 공사/업체 데이터 CRUD 로직 구현
- [x] 대시보드 통계 데이터 제공 로직 구현

## 향후 구현 계획 (Post-MVP)

### 테스트
- [ ] 사용자 스토리 기반 테스트 케이스 작성 (Jest, React Testing Library)
- [ ] 관리자 스토리 기반 테스트 케이스 작성
- [ ] 컴포넌트 단위 테스트
- [ ] E2E 테스트 (Cypress/Playwright)

### 데이터베이스 (Supabase 연동)
- [ ] Supabase 프로젝트 생성 및 스키마 설계
  - [ ] `출입자관리Table` (access_requests)
  - [ ] `업체관리Table` (companies)
  - [ ] `공사관리Table` (projects)
  - [ ] `관리자Table` (admins)
- [ ] `services/api.ts`의 Mock API를 실제 Supabase Client API 호출로 교체
- [ ] RLS (Row Level Security) 정책 설정으로 데이터 접근 제어

### 외부 API 및 서비스 연동
- [ ] **QR 코드 생성**: Supabase Edge Function을 사용하여 QR 코드 생성 및 Storage에 저장하는 로직 구현
- [ ] **파일 저장소**: 관리자가 업로드하는 MSDS, 안전 교육 자료를 Supabase Storage에 업로드/다운로드하는 기능 구현
- [ ] **인증**: Supabase Auth를 사용한 관리자 로그인 기능 구현
- [ ] **협업 도구 연동**:
    - [ ] **Microsoft Teams**: 출입 승인/반려 시 Teams 채널로 알림 전송 (Power Automate 또는 Webhook 사용)
    - [ ] **Power Apps/Automate**: 보고서 생성 및 전송 자동화 연동 설계

### 기능 고도화
- [ ] 보고서(CSV/PDF) 다운로드 기능 구현
- [ ] 실시간 현장 출입 현황 업데이트 (Supabase Realtime Subscriptions 활용)
- [ ] 사용자/관리자 알림 기능 (Email/SMS)
- [ ] 다국어 지원

### PWA (Progressive Web App) 전환
- [ ] `vite-plugin-pwa` 플러그인 설치 및 설정
- [ ] 웹 앱 매니페스트 (manifest.json) 파일 작성 및 적용
- [ ] 서비스 워커 (Service Worker) 등록 및 오프라인 지원 구성
- [ ] 푸시 알림 기능 구현
  - [ ] 사용자에게 알림 권한 요청 UI 추가
  - [ ] 백엔드와 푸시 구독 정보 연동 (Supabase Edge Function 활용)
  - [ ] 관리자 페이지에서 특정 사용자 또는 전체에게 알림 발송 기능 추가
