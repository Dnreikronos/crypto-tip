package handlers

import (
	"net/http"
	"time"

	"github.com/Dnreikronos/crypto-tip/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

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
		ProjectLink: input.ProjectLink,
		RepoLink:    input.RepoLink,
		UserID:      uuid.MustParse(userID.(string)),
	}

	db := c.MustGet("db").(*gorm.DB)
	if err := db.Create(&newProject).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project"})
		return
	}

	c.JSON(http.StatusCreated, models.ProjectToResponse(newProject, false))
}

func DeleteProjectHandler(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	id := c.Param("id")
	db := c.MustGet("db").(*gorm.DB)

	var project models.Project
	if err := db.First(&project, "id = ? AND user_id = ?", id, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found or not owned by any user"})
		return
	}

	if err := db.Delete(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Project deleted sucessfulyy"})
}

func UpdateProjectHandler(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	id := c.Param("id")
	db := c.MustGet("db").(*gorm.DB)

	var existingProject models.Project
	if err := db.First(&existingProject, "id = ? AND user_id = ?", id, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found or not owned by any user"})
		return
	}

	var input models.ProjectUpdate
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{
		"updated_at": time.Now(),
	}

	if input.Title != "" {
		updates["title"] = input.Title
	}
	if input.Description != "" {
		updates["description"] = input.Description
	}
	if input.WalletAddr != "" {
		updates["wallet_addr"] = input.WalletAddr
	}
	if input.Goal != 0 {
		updates["goal"] = input.Goal
	}
	if input.ProjectLink != "" {
		updates["project_link"] = input.ProjectLink
	}
	if input.RepoLink != "" {
		updates["repo_link"] = input.RepoLink
	}

	if err := db.Model(&existingProject).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update project"})
		return
	}

	c.JSON(http.StatusOK, models.ProjectToResponse(existingProject, false))
}

func GetAllProjectHandler(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)

	var projects []models.Project
	if err := db.Preload("User").Preload("Donations").Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
		return
	}

	response := make([]models.ProjectResponse, 0, len(projects))
	for _, project := range projects {
		response = append(response, models.ProjectToResponse(project, false))
	}

	c.JSON(http.StatusOK, response)
}

func GetProjectByIDHandler(c *gin.Context) {
	projectID := c.Param("id")
	db := c.MustGet("db").(*gorm.DB)

	var project models.Project
	if err := db.Preload("User").Preload("Donations.Donor").
		First(&project, "id = ?", projectID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}
	c.JSON(http.StatusOK, models.ProjectToResponse(project, true))
}

func GetUserProjectsHandler(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	db := c.MustGet("db").(*gorm.DB)

	var projects []models.Project
	if err := db.Preload("User").Preload("Donations").
		Where("user_id = ?", userID).Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch your projects"})
		return
	}

	response := make([]models.ProjectResponse, 0, len(projects))
	for _, project := range projects {
		response = append(response, models.ProjectToResponse(project, false))
	}

	c.JSON(http.StatusOK, response)
}
