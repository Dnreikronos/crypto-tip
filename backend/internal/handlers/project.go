package handlers

import (
	"net/http"

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
		UserID:      userID.(uuid.UUID),
	}

	db := c.MustGet("db").(*gorm.DB)
	if err := db.Create(&newProject).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project"})
		return
	}

	c.JSON(http.StatusCreated, models.ProjectToResponse(newProject, false))
}

func DeleteProjectHandler(c *gin.Context) {
	userID, exists := c.Get("UserID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	id := c.Param("id")
	db := c.MustGet("db").(gorm.DB)

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
