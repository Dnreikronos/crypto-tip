package integration

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Dnreikronos/crypto-tip/internal/handlers"
	"github.com/Dnreikronos/crypto-tip/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupDonationTestRouter(t *testing.T, testUserID uuid.UUID) (*gin.Engine, *gorm.DB) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open DB: %v", err)
	}

	err = db.AutoMigrate(&models.User{}, &models.Project{}, &models.Donation{})
	if err != nil {
		t.Fatalf("failed to migrate DB: %v", err)
	}

	router := gin.Default()
	router.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Set("userID", testUserID.String())
	})

	router.POST("/donations", handlers.CreateDonationHandler)
	router.GET("/projects/:id/donations", handlers.GetProjectDonationsHandler)
	router.GET("/donations/:id", handlers.GetDonationByIDHandler)
	router.GET("/user/donations", handlers.GetUserDonationsHandler)

	return router, db
}

func TestCreateDonationHandler_Success(t *testing.T) {
	testUserID := uuid.New()
	router, db := setupDonationTestRouter(t, testUserID)

	user := models.User{ID: testUserID, Name: "Test User", Email: "test@example.com"}
	project := models.Project{
		ID:         uuid.New(),
		Title:      "Test Project",
		Goal:       1000.0,
		WalletAddr: "0xdef",
		UserID:     testUserID,
	}
	db.Create(&user)
	db.Create(&project)

	donationInput := models.DonationInput{
		Amount:     100.0,
		CryptoType: "ETH",
		TxHash:     "0x123",
		FromAddr:   "0xabc",
		Message:    "Test donation",
		ProjectID:  project.ID,
		Anonymous:  false,
	}

	body, _ := json.Marshal(donationInput)
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/donations", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer test-token")

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var response models.Donation
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, donationInput.Amount, response.Amount)
	assert.Equal(t, donationInput.CryptoType, response.CryptoType)
}

