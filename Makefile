# Makefile

.PHONY: help api-gen clean gen-ts-axios gen-dart-dio gen-java gen-ts-nestjs gen-python-fastapi gen-go-server gen-custom gen-docs

# 도움말
help: ## 명령어 도움말 보기
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

verify: ## 로컬에서 빌드 및 테스트 검증 (푸시 전 필수)
	@bash bin/verify.sh

api-gen: ## 어떤 언어로 코드를 생성할지 선택합니다 (대화형)
	@echo "------------------------------------------------"
	@echo " 🚀 Team 7 API Code Generator (D-8 Focus)"
	@echo "------------------------------------------------"
	@echo " 1) TypeScript (Axios) - 프론트엔드 SDK"
	@echo " 2) Dart (Dio) - Flutter SDK"
	@echo " 3) HTML Documentation - 팀 공유용 API 문서"
	@echo " 4) Java (Spring Boot) - 백엔드"
	@echo " 5) Python (FastAPI) - 백엔드"
	@echo " 6) Go (Golang) - 백엔드"
	@echo " 7) Clean - 생성된 파일 삭제"
	@echo "------------------------------------------------"
	@read -p " 선택 (1-7): " CHOICE; \
	if [ "$$CHOICE" = "1" ]; then \
		$(MAKE) gen-ts-axios; \
	elif [ "$$CHOICE" = "2" ]; then \
		$(MAKE) gen-dart-dio; \
	elif [ "$$CHOICE" = "3" ]; then \
		$(MAKE) gen-docs; \
	elif [ "$$CHOICE" = "4" ]; then \
		$(MAKE) gen-java; \
	elif [ "$$CHOICE" = "5" ]; then \
		$(MAKE) gen-python-fastapi; \
	elif [ "$$CHOICE" = "6" ]; then \
		$(MAKE) gen-go-server; \
	elif [ "$$CHOICE" = "7" ]; then \
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
