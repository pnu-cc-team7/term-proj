# Makefile

.PHONY: help api-gen clean gen-ts-axios gen-java gen-ts-nestjs gen-custom

# 도움말
help: ## 명령어 도움말 보기
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

api-gen: ## 어떤 언어로 코드를 생성할지 선택합니다 (대화형)
	@echo "------------------------------------------------"
	@echo " 🚀 어떤 환경을 위한 코드를 생성할까요? (번호 선택)"
	@echo " 1) TypeScript (Axios) - 프론트엔드/Web"
	@echo " 2) Java (Spring Boot) - 백엔드/Java"
	@echo " 3) TypeScript (NestJS) - 백엔드/NestJS"
	@echo " 4) 기타 (직접 Generator 이름 입력)"
	@echo " 5) 추천 Generator 가이드 보기 (도움말)"
	@echo "------------------------------------------------"
	@read -p " 선택 (1-5): " CHOICE; \
	if [ "$$CHOICE" = "1" ]; then \
		$(MAKE) gen-ts-axios; \
	elif [ "$$CHOICE" = "2" ]; then \
		$(MAKE) gen-java; \
	elif [ "$$CHOICE" = "3" ]; then \
		$(MAKE) gen-ts-nestjs; \
	elif [ "$$CHOICE" = "4" ]; then \
		read -p "Generator 이름 (예: go, python, dart-dio): " GEN_NAME; \
		read -p "저장할 경로 (예: implementations/server/sdk): " GEN_DEST; \
		$(MAKE) gen-custom GEN=$$GEN_NAME DEST=$$GEN_DEST; \
	elif [ "$$CHOICE" = "5" ]; then \
		$(MAKE) show-generator-guide; \
	else \
		echo "❌ 올바른 번호를 선택해 주세요."; \
	fi

# --- 내부 실행 타겟들 (Docker 기반) ---

show-generator-guide: ## 주요 기술 스택별 추천 Generator를 안내합니다.
	@echo ""
	@echo "💡 \033[1m추천 OpenAPI Generator 목록\033[0m"
	@echo "------------------------------------------------"
	@echo " \033[36m[Frontend]\033[0m"
	@echo "  - \033[1mtypescript-axios\033[0m : React, Vue, Next.js (가장 추천)"
	@echo "  - \033[1mdart-dio\033[0m         : Flutter 앱 개발"
	@echo ""
	@echo " \033[36m[Backend]\033[0m"
	@echo "  - \033[1mspring\033[0m           : Java Spring Boot (interfaceOnly 옵션 권장)"
	@echo "  - \033[1mtypescript-nestjs\033[0m : NestJS 서버"
	@echo "  - \033[1mpython-fastapi\033[0m    : Python FastAPI 서버"
	@echo "  - \033[1mgo-server\033[0m        : Go (Golang) 서버"
	@echo "------------------------------------------------"
	@echo " ※ 전체 목록을 보려면 \033[33mmake list-generators\033[0m를 실행하세요."
	@echo " ※ 상세 가이드는 \033[32mdocs/generator_overview.md\033[0m에 있습니다."
	@echo ""

list-generators: ## 사용 가능한 모든 Generator 목록을 출력합니다. (RAW 데이터)
	@echo "🔍 사용 가능한 모든 Generator 목록을 불러오는 중..."
	docker run --rm openapitools/openapi-generator-cli list

gen-ts-axios:
	@echo "📦 TypeScript (Axios) 코드를 생성합니다..."
	docker run --rm -v "$(shell pwd):/local" openapitools/openapi-generator-cli generate \
		-i /local/specs/api/openapi.yaml -g typescript-axios -o /local/implementations/client/src/api

gen-java:
	@echo "☕ Java (Spring Boot) 인터페이스를 생성합니다..."
	docker run --rm -v "$(shell pwd):/local" openapitools/openapi-generator-cli generate \
		-i /local/specs/api/openapi.yaml -g spring -o /local/implementations/server \
		--additional-properties=interfaceOnly=true,apiPackage=com.example.api,modelPackage=com.example.model

gen-ts-nestjs:
	@echo "🐱 NestJS 서버 코드를 생성합니다..."
	docker run --rm -v "$(shell pwd):/local" openapitools/openapi-generator-cli generate \
		-i /local/specs/api/openapi.yaml -g typescript-nestjs -o /local/implementations/server/src/api-sdk

gen-custom:
	@echo "🛠️ 사용자 정의 설정($(GEN))으로 생성합니다..."
	docker run --rm -v "$(shell pwd):/local" openapitools/openapi-generator-cli generate \
		-i /local/specs/api/openapi.yaml -g $(GEN) -o /local/$(DEST)

clean: ## 생성된 모든 API 코드 삭제 (초기화)
	rm -rf implementations/client/src/api/*
	rm -rf implementations/server/src/api-sdk/*
	@echo "🧹 생성된 코드들이 모두 삭제되었습니다."
