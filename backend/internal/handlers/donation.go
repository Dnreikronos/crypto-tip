package handlers

import (
	"log"
	"net/http"

	"github.com/Dnreikronos/crypto-tip/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func CreateDonationHandler(c *gin.Context) {
	var input models.DonationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("error binding input json, %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	db := c.MustGet("db").(*gorm.DB)

	var project models.Project
	if err := db.First(&project, "id = ?", input.ProjectID).Error; err != nil {
		log.Printf("Error trying to GET project, %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	donation := models.Donation{
		Amount:     input.Amount,
		CryptoType: input.CryptoType,
		TxHash:     input.TxHash,
		FromAddr:   input.FromAddr,
		Message:    input.Message,
		ProjectID:  input.ProjectID,
		DonorID:    uuid.MustParse(userID.(string)),
		Anonymous:  input.Anonymous,
	}

	if err := db.Create(&donation).Error; err != nil {
		log.Printf("error creating donation, %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create donation"})
		return
	}

	if err := db.Model(&project).Update("raised", project.Raised+donation.Amount).Error; err != nil {
		log.Printf("Failed to updated the raised value of project with the dontion values", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update project's raised amount"})
		return
	}

	c.JSON(http.StatusCreated, donation)
}

func GetProjectDonationsHandler(c *gin.Context) {
	projectID := c.Param("id")
	db := c.MustGet("db").(*gorm.DB)

	var donations []models.Donation
	if err := db.Preload("Donor").Where("project_id = ?", projectID).Find(&donations).Error; err != nil {
		log.Printf("error trying to get the donation of the project, %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch donations"})
		return
	}

	donationInfos := make([]models.DonationInfo, 0, len(donations))
	for _, donation := range donations {
		donationInfo := models.DonationInfo{
			ID:         donation.ID,
			Amount:     donation.Amount,
			CryptoType: donation.CryptoType,
			FromAddr:   donation.FromAddr,
			Message:    donation.Message,
			CreatedAt:  donation.CreatedAt,
		}

		if !donation.Anonymous && donation.DonorID != uuid.Nil {
			userResponse := models.FilteredResponse(donation.Donor)
			donationInfo.Donor = &userResponse
		}

		donationInfos = append(donationInfos, donationInfo)
	}

	c.JSON(http.StatusOK, donationInfos)
}

func GetUserDonationsHandler(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	db := c.MustGet("db").(*gorm.DB)

	var donations []models.Donation
	if err := db.Preload("Project").Where("donor_id = ?", userID).Find(&donations).Error; err != nil {
		log.Printf("error trying to get the donations of the specific user, %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch donations"})
		return
	}

	c.JSON(http.StatusOK, donations)
}

func GetDonationByIDHandler(c *gin.Context) {
	donationID := c.Param("id")
	db := c.MustGet("db").(*gorm.DB)

	var donation models.Donation
	if err := db.Preload("Donor").Preload("Project").First(&donation, "id = ?", donationID).Error; err != nil {
		log.Printf("error trying to get the specific donation, %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Donation not found"})
		return
	}

	c.JSON(http.StatusOK, donation)
}
