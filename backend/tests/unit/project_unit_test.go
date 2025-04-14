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
