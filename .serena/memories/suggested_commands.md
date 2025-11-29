# 주요 명령어

## 패키지 관리

### 의존성 설치
```bash
npm install
```

### 패키지 추가
```bash
npm install <package-name>
npm install -D <package-name>  # devDependency
```

## 개발 서버

### 개발 서버 실행
```bash
npm run dev
```
- 포트: `http://localhost:5173`
- 자동으로 브라우저 열림 (vite.config.js 설정)
- HMR (Hot Module Replacement) 지원

### 프로덕션 빌드
```bash
npm run build
```
- 결과물: `dist/` 디렉토리

### 빌드 미리보기
```bash
npm run preview
```
- 프로덕션 빌드 결과를 로컬에서 미리보기

## Git 명령어

### 상태 확인
```bash
git status
```

### 변경사항 추가 및 커밋
```bash
git add .
git commit -m "commit message"
```

### 푸시
```bash
git push origin <branch-name>
```

## 파일 시스템 (Linux/WSL)

### 디렉토리 탐색
```bash
ls          # 파일 목록
ls -la      # 상세 목록 (숨김 파일 포함)
cd <dir>    # 디렉토리 이동
pwd         # 현재 경로 출력
```

### 파일 찾기
```bash
find . -name "*.vue"           # Vue 파일 찾기
grep -r "pattern" src/         # 패턴 검색
```

### 파일 읽기
```bash
cat <file>      # 파일 내용 출력
head <file>     # 앞부분 출력
tail <file>     # 뒷부분 출력
```

## Tailwind CSS

### CSS 빌드 (수동, 필요시)
```bash
npx tailwindcss -i ./src/assets/css/input.css -o ./src/assets/css/output.css --watch
```
- 일반적으로 Vite가 자동 처리하므로 수동 실행 불필요

## 추가 유틸리티

### 포트 확인/종료 (포트 충돌 시)
```bash
lsof -i :5173           # 포트 5173 사용 프로세스 확인
kill -9 <PID>           # 프로세스 종료
```

### 캐시 정리
```bash
rm -rf node_modules
rm package-lock.json
npm install             # 재설치
```

## 현재 프로젝트에는 없는 명령어
- **테스트**: 테스트 프레임워크 미설치 (Jest, Vitest 등 향후 추가 가능)
- **린팅**: ESLint 설정 없음
- **포매팅**: Prettier 설정 없음
- **타입 체크**: TypeScript 미사용 (JavaScript 프로젝트)

## PowerShell 관련 (Windows 환경)
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser  # npm 실행 권한 문제 해결
```
