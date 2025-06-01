package middleware

import (
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/ulule/limiter/v3"
	limiterMiddleware "github.com/ulule/limiter/v3/drivers/middleware/gin"
	redisStore "github.com/ulule/limiter/v3/drivers/store/redis"
)

func RateLimiter() gin.HandlerFunc {
	rdb := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_ADDR"),
		Password: "",
		DB:       0,
	})

	store, err := redisStore.NewStoreWithOptions(rdb, limiter.StoreOptions{
		Prefix:   "rate_limiter",
		MaxRetry: 3,
	})
	if err != nil {
		panic(err)
	}

	rate := limiter.Rate{
		Period: 1 * time.Minute,
		Limit:  10,
	}

	instance := limiter.New(store, rate)

	return limiterMiddleware.NewMiddleware(instance)
}
