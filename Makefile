# Makefile
# Gourmet Social - Team 7 Final Project

.PHONY: help api-gen clean gen-ts-axios gen-docs verify

# 도움말
help: ## 프로젝트 주요 명령어 도움말 보기
	@echo "------------------------------------------------"
	@echo " 🍽️  Gourmet Social (Team 7) Project Makefile"
	@echo "------------------------------------------------"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

verify: ## 전체 시스템 빌드 및 테스트 검증 (로컬)
	@bash bin/verify.sh

api-gen: ## API 명세 기반 코드 및 문서 생성 (대화형)
	@echo "------------------------------------------------"
	@echo " 🚀 Team 7 API Code Generator"
	@echo "------------------------------------------------"
	@echo " 1) TypeScript (Axios) - 프론트엔드 API 클라이언트 생성"
	@echo " 2) HTML Documentation - 팀 공유용 정적 API 문서 생성"
	@echo " 3) Clean - 생성된 모든 자동화 코드 삭제"
	@echo "------------------------------------------------"
	@read -p " 선택 (1-3): " CHOICE; \
	if [ "$$CHOICE" = "1" ]; then \
		$(MAKE) gen-ts-axios; \
	elif [ "$$CHOICE" = "2" ]; then \
		$(MAKE) gen-docs; \
	elif [ "$$CHOICE" = "3" ]; then \
		$(MAKE) clean; \
	else \
		echo "❌ 올바른 번호를 선택해 주세요."; \
	fi

# --- 내부 실행 타겟들 (Docker 기반) ---

gen-docs: ## API 문서 (HTML) 생성
	@echo "🚀 Generating API Documentation (HTML)..."
	@mkdir -p docs/api
	docker run --rm -v "$(shell pwd):/local" openapitools/openapi-generator-cli generate \
		-i /local/specs/api/final_openapi.yaml -g html2 -o /local/docs/api
	@echo "✅ Done! docs/api/index.html"

gen-ts-axios:
	@echo "📦 TypeScript (Axios) 코드를 생성합니다..."
	docker run --rm -v "$(shell pwd):/local" openapitools/openapi-generator-cli generate \
		-i /local/specs/api/final_openapi.yaml -g typescript-axios -o /local/implementations/client/src/api

gen-dart-dio:
	@echo "🎯 Dart (Dio) 코드를 생성합니다..."
	docker run --rm -v "$(shell pwd):/local" openapitools/openapi-generator-cli generate \
		-i /local/specs/api/final_openapi.yaml -g dart-dio -o /local/implementations/client/src/api-dart

gen-java:
	@echo "☕ Java (Spring Boot) 인터페이스를 생성합니다..."
	docker run --rm -v "$(shell pwd):/local" openapitools/openapi-generator-cli generate \
		-i /local/specs/api/final_openapi.yaml -g spring -o /local/implementations/server \
		--additional-properties=interfaceOnly=true,apiPackage=com.example.api,modelPackage=com.example.model

gen-python-fastapi:
	@echo "🐍 Python (FastAPI) 코드를 생성합니다..."
	docker run --rm -v "$(shell pwd):/local" openapitools/openapi-generator-cli generate \
		-i /local/specs/api/final_openapi.yaml -g python-fastapi -o /local/implementations/server/src/api-python

gen-go-server:
	@echo "🐹 Go (Golang) 서버 코드를 생성합니다..."
	docker run --rm -v "$(shell pwd):/local" openapitools/openapi-generator-cli generate \
		-i /local/specs/api/final_openapi.yaml -g go-server -o /local/implementations/server/src/api-go

clean: ## 생성된 모든 API 코드 삭제 (초기화)
	rm -rf implementations/client/src/api/*
	rm -rf implementations/client/src/api-dart/*
	rm -rf docs/api/*
