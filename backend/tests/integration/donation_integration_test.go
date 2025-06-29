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
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupDonationTestRouter(t *testing.T, testUserID uuid.UUID) (*gin.Engine, *gorm.DB) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err, "failed to open DB")

	err = db.AutoMigrate(&models.User{}, &models.Project{}, &models.Donation{})
	require.NoError(t, err, "failed to migrate DB")

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

	body, err := json.Marshal(donationInput)
	require.NoError(t, err)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/donations", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer test-token")

	router.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Logf("unexpected status: %d, body: %s", w.Code, w.Body.String())
	}
	require.Equal(t, http.StatusCreated, w.Code)

	var response models.Donation
	err = json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Equal(t, donationInput.Amount, response.Amount)
	assert.Equal(t, donationInput.CryptoType, response.CryptoType)
}

func TestGetProjectDonationsHandler_Success(t *testing.T) {
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

	donation := models.Donation{
		ID:         uuid.New(),
		Amount:     100.0,
		CryptoType: "ETH",
		ProjectID:  project.ID,
		//DonorID:    testUserID,
	}
	db.Create(&donation)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/projects/"+project.ID.String()+"/donations", nil)

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Logf("unexpected status: %d, body: %s", w.Code, w.Body.String())
	}
	require.Equal(t, http.StatusOK, w.Code)

	var response []models.DonationInfo
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	require.Len(t, response, 1)
	assert.Equal(t, donation.Amount, response[0].Amount)
}

func TestGetUserDonationsHandler_Success(t *testing.T) {
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

	donation := models.Donation{
		ID:         uuid.New(),
		Amount:     100.0,
		CryptoType: "ETH",
		ProjectID:  project.ID,
		//DonorID:    testUserID,
	}
	db.Create(&donation)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/user/donations", nil)
	req.Header.Set("Authorization", "Bearer test-token")

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Logf("unexpected status: %d, body: %s", w.Code, w.Body.String())
	}
	require.Equal(t, http.StatusOK, w.Code)

	var response []models.Donation
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	require.Len(t, response, 1)
	assert.Equal(t, donation.Amount, response[0].Amount)
}

func TestGetDonationByIDHandler_Success(t *testing.T) {
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

	donation := models.Donation{
		ID:         uuid.New(),
		Amount:     100.0,
		CryptoType: "ETH",
		ProjectID:  project.ID,
		//DonorID:    testUserID,
	}
	db.Create(&donation)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/donations/"+donation.ID.String(), nil)

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Logf("unexpected status: %d, body: %s", w.Code, w.Body.String())
	}
	require.Equal(t, http.StatusOK, w.Code)

	var response models.Donation
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Equal(t, donation.ID, response.ID)
	assert.Equal(t, donation.Amount, response.Amount)
}
