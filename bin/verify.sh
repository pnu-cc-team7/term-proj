#!/bin/bash

# bin/verify.sh
# 로컬에서 빌드 및 테스트를 한꺼번에 수행하여 원격 배포 실패를 방지합니다.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "------------------------------------------------"
echo " 🚀 Team 7 Local Verification Script"
echo "------------------------------------------------"

# 1. Backend Build Check
echo -e "\n[1/3] Checking Backend Build... ☕"
cd implementations/server
./gradlew build -x test
cd ../..
echo -e "${GREEN}✅ Backend Build Successful${NC}"

# 2. Frontend Build Check
echo -e "\n[2/3] Checking Frontend Build... 📦"
cd implementations/client
npm install
npm run build
cd ../..
echo -e "${GREEN}✅ Frontend Build Successful${NC}"

# 3. E2E Test Check
echo -e "\n[3/3] Running E2E Tests (with Mocking)... 🧪"
cd implementations/client
# Note: Requires playwright browsers to be installed
# npx playwright install chromium
VITE_ENABLE_MOCKING=true npm run test:e2e
cd ../..
echo -e "${GREEN}✅ E2E Tests Passed${NC}"

echo -e "\n------------------------------------------------"
echo -e " 🎉 ${GREEN}All checks passed! You are safe to push.${NC}"
echo "------------------------------------------------"
