#!/bin/bash
# Azure App Service F1 Tier 성능 최적화를 위한 설정 스크립트

echo "--- Azure App Service Optimization ---"

# 1. Spring Boot Lazy Initialization 활성화 (애플리케이션 시작 시 모든 빈을 생성하지 않음 -> CPU 절약)
echo "Setting SPRING_MAIN_LAZY_INITIALIZATION=true"
# (이것은 Azure Portal의 Configuration -> App Settings에 추가해야 함)

# 2. JVM 옵션 최적화 (F1 티어의 1GB 램을 고려)
# -Xms128m -Xmx512m: 힙 메모리 제한
# -XX:+UseSerialGC: 저사양 환경에서 효율적인 GC 사용
JAVA_OPTS="-Xms128m -Xmx512m -XX:+UseSerialGC"
echo "Recommended JAVA_OPTS: $JAVA_OPTS"

# 3. Azure SQL DB Auto-Pause 대비
# 애플리케이션 시작 시 DB 연결 확인 로직이 필요할 수 있음
