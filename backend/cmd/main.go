package cmd

import (
	"fmt"
	"net/http"

	"github.com/Dnreikronos/crypto-tip/internal/config"
	"github.com/Dnreikronos/crypto-tip/internal/storage/connection"
	"github.com/Dnreikronos/crypto-tip/internal/storage/migration"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		panic(err)
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

	r.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	r.POST("/register", handlers.CreateUserHandler)
	r.POST("/login", handlers.LoginHandler)
	authorized := r.Group("/", handlers.AuthMiddleware())
	{
		authorized.GET("/profile", handlers.ProfileHandler)
	}

	http.ListenAndServe(fmt.Sprintf(":%s", config.GetServerPort()), r)
}
