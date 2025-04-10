func CreateProjectHandler(c *gin.Context) {
	var input models.ProjectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	newProject := models.Project{
		Title:       input.Title,
		Description: input.Description,
		Goal:        input.Goal,
		WalletAddr:  input.WalletAddr,
		UserID:      userID.(uuid.UUID),
	}

	db := c.MustGet("db").(*gorm.DB)
	if err := db.Create(&newProject).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project"})
		return
	}

	c.JSON(http.StatusCreated, models.ProjectToResponse(newProject, false))
}
