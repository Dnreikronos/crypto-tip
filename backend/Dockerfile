# ── Build Stage ───────────────────────────────────────────────────────────────
FROM golang:1.24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o /bin/crypto-tip ./cmd/main.go

# ── Runtime Stage ─────────────────────────────────────────────────────────────
FROM alpine:3.18
COPY --from=builder /bin/crypto-tip /bin/crypto-tip

EXPOSE 9090
ENTRYPOINT ["/bin/crypto-tip"]

