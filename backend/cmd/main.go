package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/Dnreikronos/crypto-tip/internal/config"
	"github.com/Dnreikronos/crypto-tip/internal/handlers"
	"github.com/Dnreikronos/crypto-tip/internal/middleware"
	"github.com/Dnreikronos/crypto-tip/internal/storage/connection"
	"github.com/Dnreikronos/crypto-tip/internal/storage/migration"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		panic(err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "9090"
	}

	err = config.Load()
	if err != nil {
		panic(fmt.Sprintf("Failed to load configuration: %v", err))
	}

	db, err := connection.OpenConnection()
	if err != nil {
		panic(err)
	}

	migration.RunMigration(db)

	r := gin.Default()

	r.Use(middleware.RateLimiter())

	r.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	corsOrigin := os.Getenv("CORS")

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{corsOrigin},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
			"X-Requested-With",
			"Access-Control-Allow-Headers",
		},
		ExposeHeaders:    []string{"Content-Length", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.POST("/register", handlers.CreateUserHandler)
	r.POST("/login", handlers.LoginHandler)

	r.GET("/projects", handlers.GetAllProjectHandler)
	r.GET("/projects/:id", handlers.GetProjectByIDHandler)
	r.GET("/projects/:id/donations", handlers.GetProjectDonationsHandler)
	r.GET("/donations/:id", handlers.GetDonationByIDHandler)

	authorized := r.Group("/", handlers.AuthMiddleware())
	{
		authorized.GET("/profile", handlers.ProfileHandler)

		authorized.POST("/projects", handlers.CreateProjectHandler)
		authorized.PUT("/projects/:id", handlers.UpdateProjectHandler)
		authorized.DELETE("/projects/:id", handlers.DeleteProjectHandler)
		authorized.GET("/user/projects", handlers.GetUserProjectsHandler)

		authorized.POST("/donations", handlers.CreateDonationHandler)
		authorized.GET("/user/donations", handlers.GetUserDonationsHandler)
	}

	http.ListenAndServe(fmt.Sprintf(":%s", config.GetServerPort()), r)
}
