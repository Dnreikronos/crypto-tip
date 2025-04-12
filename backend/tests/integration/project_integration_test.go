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

func CreateLoginTest(t *testing.T, router *gin.Engine) string {
	user := models.SignInInput{Email: "project@example.com", Password: "123456"}
	registerBody, _ := json.Marshal(user)
	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(registerBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	loginBody, _ := json.Marshal(user)
	req = httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(loginBody))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	var resp map[string]string

	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	return resp["token"]
}
