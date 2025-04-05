func setupRouter(t *testing.T) (*gin.Engine, *gorm.DB) {
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
	router.POST("/create", handlers.CreateUserHandler)
	router.POST("/login", handlers.LoginHandler)
	router.GET("/profile", handlers.AuthMiddleware(), handlers.ProfileHandler)

	return router, db
}
func createTestUser(t *testing.T, db *gorm.DB, email, password string, verified bool) {
	t.Helper()

	hashedPassword, err := handlers.HashPassword(password)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	user := models.User{Email: email, Password: hashedPassword, Verified: verified}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create test user: %v", err)
	}
}
func loginUser(t *testing.T, router *gin.Engine, email, password string) string {
	t.Helper()

	loginInput := models.SignInInput{Email: email, Password: password}
	body, err := json.Marshal(loginInput)
	if err != nil {
		t.Fatalf("failed to marshal login input: %v", err)
	}

	req, err := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
	if err != nil {
		t.Fatalf("failed to create login request: %v", err)
	}

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("login failed with code %d", w.Code)
	}

	var resp map[string]string
	err = json.Unmarshal(w.Body.Bytes(), &resp)
	if err != nil {
		t.Fatalf("failed to parse login response: %v", err)
	}

	return resp["token"]
}
