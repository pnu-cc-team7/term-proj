# 🌐 Staging Server Nginx & HTTPS Setup Guide

오라클 클라우드 스테이징 서버에 Nginx를 설정하고 Certbot을 통해 HTTPS를 적용하는 가이드입니다.

## 1. Nginx 설치 및 기본 설정

서버에 접속하여 Nginx를 설치합니다.

```bash
sudo apt update
sudo apt install nginx -y
```

## 2. Nginx 설정 파일 작성

`/etc/nginx/sites-available/term-proj` 파일을 생성하고 아래 내용을 작성합니다.
(기존 `default` 설정은 `sudo rm /etc/nginx/sites-enabled/default`로 삭제하는 것이 좋습니다.)

```nginx
server {
    listen 80;
    server_name pnu-team7-stage.duckdns.org;

    # Frontend Static Files
    root /home/ubuntu/term-proj-staging/implementations/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /auth/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /votes/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

설정 활성화 및 재시작:
```bash
sudo ln -s /etc/nginx/sites-available/term-proj /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 3. Certbot을 이용한 HTTPS 적용

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d pnu-team7-stage.duckdns.org
```

*   실행 중 이메일 입력 및 약관 동의가 필요합니다.
*   `Redirect HTTP to HTTPS` 옵션을 선택(2번)하면 자동으로 모든 요청이 HTTPS로 리다이렉트됩니다.

## 4. 카카오 설정 업데이트

HTTPS 적용 후 [카카오 개발자 센터](https://developers.kakao.com/)에서 아래 주소를 추가해야 합니다.

1.  **내 애플리케이션 > 플랫폼 > Web**:
    *   `https://pnu-team7-stage.duckdns.org` 추가
2.  **내 애플리케이션 > 제품 설정 > 카카오 로그인 > Redirect URI**:
    *   `https://pnu-team7-stage.duckdns.org` 추가 (인가 코드를 받을 경로)

---
**주의**: 백엔드(Spring Boot) 실행 시 `application.yaml` 등에서 쿠키 설정(`SameSite=None; Secure`)이 되어 있는지 확인하세요. HTTPS 환경에서는 Secure 플래그가 필수입니다.
