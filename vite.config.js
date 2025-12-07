import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        open: true,
        /**
         * 프록시 설정
         * 
         * /api로 시작하는 모든 요청을 백엔드 서버로 포워딩합니다.
         * 개발 환경에서 CORS 문제를 해결합니다.
         * 
         * 사용법:
         * - 프론트엔드: http://localhost:5173/api/auth/login
         * - 실제 요청: http://localhost:8080/api/auth/login
         */
        proxy: {
            '/api': {
                target: 'http://localhost:8080', // 백엔드 서버 주소
                changeOrigin: true,              // Origin 헤더 변경
                secure: false,                   // HTTPS가 아닌 경우
                // rewrite: (path) => path.replace(/^\/api/, '/api'), // 경로 재작성 (필요시)
            },
        },
    },
})
