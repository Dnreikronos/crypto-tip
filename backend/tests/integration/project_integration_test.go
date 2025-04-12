func setupRouterIntegration(t *testing.T) (*gin.Engine, *gorm.DB) {
	t.Helper()

	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open DB: %v", err)
	}

	err = db.AutoMigrate(&models.User{})
	if err != nil {
		t.Fatalf("failed to migrate DB: %v", err)
	}

	router := gin.Default()
	router.Use(func(c *gin.Context) {
		c.Set("db", db)
	})
	router.POST("/register", handlers.CreateUserHandler)
	router.POST("/login", handlers.LoginHandler)
	router.GET("/projects", handlers.GetAllProjectHandler)
	router.GET("/projects/:id", handlers.GetProjectByIDHandler)

	authorized := router.Group("/")
	authorized.Use(handlers.AuthMiddleware())
	{
		authorized.GET("/profile", handlers.ProfileHandler)

		authorized.POST("/projects", handlers.CreateProjectHandler)
		authorized.PUT("/projects/:id", handlers.UpdateProjectHandler)
		authorized.DELETE("/projects/:id", handlers.DeleteProjectHandler)
		authorized.GET("/user/projects", handlers.GetUserProjectsHandler)
	}

	return router, db
}
