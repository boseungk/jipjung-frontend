# Nginx 프록시 설정 가이드

## 개요

Nginx를 리버스 프록시로 사용하여 프론트엔드(Vue)와 백엔드(Spring Boot) API를 하나의 도메인에서 서비스합니다.

```
클라이언트 (브라우저)
        │
        ▼
    Nginx (80/443)
        │
        ├──── / ──────────────────> Vue 정적 파일 (dist/)
        │
        └──── /api ───────────────> Spring Boot (8080)
```

---

## Nginx 설정 파일

### 기본 설정 (`/etc/nginx/sites-available/jipjung`)

```nginx
# 업스트림 서버 정의
upstream backend {
    server localhost:8080;  # Spring Boot 서버
    keepalive 32;           # 연결 유지
}

server {
    listen 80;
    server_name jipjung.example.com;  # 도메인 또는 IP

    # Vue 정적 파일 경로
    root /var/www/jipjung/dist;
    index index.html;

    # Gzip 압축
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 요청 프록시
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        # 헤더 설정
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 지원 (필요시)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 타임아웃 설정
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Vue Router History 모드 지원
    # SPA에서 새로고침 시 404 방지
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 에러 페이지
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

---

## HTTPS 설정 (Let's Encrypt)

### SSL 인증서 적용

```nginx
server {
    listen 80;
    server_name jipjung.example.com;
    
    # HTTP를 HTTPS로 리디렉션
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name jipjung.example.com;

    # SSL 인증서 경로
    ssl_certificate /etc/letsencrypt/live/jipjung.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jipjung.example.com/privkey.pem;
    
    # SSL 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000" always;

    # 나머지 설정은 위와 동일...
    root /var/www/jipjung/dist;
    index index.html;

    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 배포 순서

### 1. Vue 빌드

```bash
cd jipjung-frontend
npm run build
```

### 2. 빌드 파일 복사

```bash
sudo cp -r dist/* /var/www/jipjung/dist/
```

### 3. Nginx 설정 활성화

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/jipjung /etc/nginx/sites-enabled/

# 설정 검증
sudo nginx -t

# Nginx 재시작
sudo systemctl reload nginx
```

### 4. Spring Boot 실행

```bash
cd jipjung-backend
java -jar target/jipjung-0.0.1-SNAPSHOT.jar
```

---

## 프론트엔드 설정 (프로덕션용)

### `.env.production`

```properties
# Nginx가 프록시하므로 상대 경로 사용
VITE_API_BASE_URL=/api
```

이렇게 설정하면 프론트엔드에서 `/api/auth/login` 호출 시:
1. 브라우저 → Nginx (443)
2. Nginx → Spring Boot (8080)
3. 응답 역방향으로 전달

---

## Docker Compose (선택사항)

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./dist:/usr/share/nginx/html
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    networks:
      - jipjung-network

  backend:
    image: jipjung-backend:latest
    expose:
      - "8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    networks:
      - jipjung-network

networks:
  jipjung-network:
    driver: bridge
```

---

## 문제 해결

### API 요청이 404로 응답하는 경우

```nginx
# 슬래시 주의! 둘 다 있거나 둘 다 없어야 함
location /api/ {
    proxy_pass http://backend/api/;  # ✅ 둘 다 슬래시 있음
}

# 또는
location /api {
    proxy_pass http://backend;  # ✅ 둘 다 슬래시 없음
}
```

### CORS 에러가 발생하는 경우

Nginx에서 CORS 헤더 추가:

```nginx
location /api/ {
    # CORS 헤더
    add_header Access-Control-Allow-Origin $http_origin always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    add_header Access-Control-Allow-Credentials true always;

    # Preflight 요청 처리
    if ($request_method = OPTIONS) {
        return 204;
    }

    proxy_pass http://backend;
}
```
