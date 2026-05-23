# Makefile

.PHONY: help api-gen clean gen-ts-axios gen-dart-dio gen-java gen-ts-nestjs gen-python-fastapi gen-go-server gen-custom

# 도움말
help: ## 명령어 도움말 보기
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

api-gen: ## 어떤 언어로 코드를 생성할지 선택합니다 (대화형)
	@echo "------------------------------------------------"
	@echo " 🚀 어떤 환경을 위한 코드를 생성할까요? (번호 선택)"
	@echo " 1) TypeScript (Axios) - 프론트엔드/Web"
	@echo " 2) Dart (Dio) - 프론트엔드/Flutter"
	@echo " 3) Java (Spring Boot) - 백엔드/Java"
	@echo " 4) TypeScript (NestJS) - 백엔드/NestJS"
	@echo " 5) Python (FastAPI) - 백엔드/Python"
	@echo " 6) Go (Golang) - 백엔드/Go"
	@echo " 7) 기타 (직접 Generator 이름 입력)"
	@echo "------------------------------------------------"
	@read -p " 선택 (1-7): " CHOICE; \
	if [ "$$CHOICE" = "1" ]; then \
		$(MAKE) gen-ts-axios; \
	elif [ "$$CHOICE" = "2" ]; then \
		$(MAKE) gen-dart-dio; \
	elif [ "$$CHOICE" = "3" ]; then \
		$(MAKE) gen-java; \
	elif [ "$$CHOICE" = "4" ]; then \
		$(MAKE) gen-ts-nestjs; \
	elif [ "$$CHOICE" = "5" ]; then \
		$(MAKE) gen-python-fastapi; \
	elif [ "$$CHOICE" = "6" ]; then \
		$(MAKE) gen-go-server; \
	elif [ "$$CHOICE" = "7" ]; then \
		read -p "Generator 이름 (예: go, python, dart-dio): " GEN_NAME; \
		read -p "저장할 경로 (예: implementations/server/sdk): " GEN_DEST; \
		$(MAKE) gen-custom GEN=$$GEN_NAME DEST=$$GEN_DEST; \
	else \
		echo "❌ 올바른 번호를 선택해 주세요."; \
	fi

# --- 내부 실행 타겟들 (Docker 기반) ---

list-generators: ## 사용 가능한 모든 Generator 목록을 출력합니다. (RAW 데이터)
	@echo "🔍 사용 가능한 모든 Generator 목록을 불러오는 중..."
	docker run --rm openapitools/openapi-generator-cli list

gen-ts-axios:
	@echo "📦 TypeScript (Axios) 코드를 생성합니다..."
	docker run --rm -v "$(shell pwd):/local" openapitools/openapi-generator-cli generate \
		-i /local/specs/api/openapi.yaml -g typescript-axios -o /local/implementations/client/src/api

gen-dart-dio:
	@echo "🎯 Dart (Dio) 코드를 생성합니다..."
	docker run --rm -v "$(shell pwd):/local" openapitools/openapi-generator-cli generate \
		-i /local/specs/api/openapi.yaml -g dart-dio -o /local/implementations/client/src/api-dart

gen-java:
	@echo "☕ Java (Spring Boot) 인터페이스를 생성합니다..."
	docker run --rm -v "$(shell pwd):/local" openapitools/openapi-generator-cli generate \
		-i /local/specs/api/openapi.yaml -g spring -o /local/implementations/server \
		--additional-properties=interfaceOnly=true,apiPackage=com.example.api,modelPackage=com.example.model

gen-ts-nestjs:
	@echo "🐱 NestJS 서버 코드를 생성합니다..."
	docker run --rm -v "$(shell pwd):/local" openapitools/openapi-generator-cli generate \
		-i /local/specs/api/openapi.yaml -g typescript-nestjs -o /local/implementations/server/src/api-sdk

gen-python-fastapi:
	@echo "🐍 Python (FastAPI) 코드를 생성합니다..."
	docker run --rm -v "$(shell pwd):/local" openapitools/openapi-generator-cli generate \
		-i /local/specs/api/openapi.yaml -g python-fastapi -o /local/implementations/server/src/api-python

gen-go-server:
	@echo "🐹 Go (Golang) 서버 코드를 생성합니다..."
	docker run --rm -v "$(shell pwd):/local" openapitools/openapi-generator-cli generate \
		-i /local/specs/api/openapi.yaml -g go-server -o /local/implementations/server/src/api-go

gen-custom:
	@echo "🛠️ 사용자 정의 설정($(GEN))으로 생성합니다..."
	docker run --rm -v "$(shell pwd):/local" openapitools/openapi-generator-cli generate 
		-i /local/specs/api/openapi.yaml -g $(GEN) -o /local/$(DEST)

clean: ## 생성된 모든 API 코드 삭제 (초기화)
	rm -rf implementations/client/src/api/*
	rm -rf implementations/client/src/api-dart/*
	rm -rf implementations/server/src/api-sdk/*
	rm -rf implementations/server/src/api-python/*
	rm -rf implementations/server/src/api-go/*
	@echo "🧹 생성된 코드들이 모두 삭제되었습니다."
