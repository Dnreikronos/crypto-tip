build:
	@go build -o bin/crypto-tip/backend cmd/main.go

run:
	@./bin/crypto-tip/backend

test-integration:
	@go test -v ./tests/integration/...

test-unit:
	@go test -v ./tests/unit/...

test-all:
	@go test -v ./tests/...