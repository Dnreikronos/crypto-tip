func setupProjectTestDB() *gorm.DB {
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	_ = db.AutoMigrate(&models.Project{}, &models.User{})
	return db
}

func createProjectRequestBody() []byte {
	project := models.ProjectInput{
		Title:       "Test Project",
		Description: "This is a test project",
		Goal:        100.0,
		WalletAddr:  "0x123456",
	}
	body, _ := json.Marshal(project)
	return body
}
func TestCreateProjectHandler_Success(t *testing.T) {
	db := setupProjectTestDB()

	userID := uuid.New()

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request, _ = http.NewRequest("POST", "/projects", bytes.NewBuffer(createProjectRequestBody()))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("userID", userID)
	c.Set("db", db)

	handlers.CreateProjectHandler(c)

	assert.Equal(t, http.StatusCreated, w.Code)
}
func TestCreateProjectHandler_InvalidJSON(t *testing.T) {
	db := setupProjectTestDB()

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request, _ = http.NewRequest("POST", "/projects", bytes.NewBufferString("invalid json"))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("db", db)

	handlers.CreateProjectHandler(c)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

