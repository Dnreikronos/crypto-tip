package unit_test

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

func setupDonationTestDB() *gorm.DB {
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	_ = db.AutoMigrate(&models.User{}, &models.Project{}, &models.Donation{})
	return db
}

func createDonationRequestBody(projectID uuid.UUID) []byte {
	donation := models.DonationInput{
		Amount:     100.0,
		CryptoType: "ETH",
		TxHash:     "0x123",
		FromAddr:   "0xabc",
		Message:    "Test donation",
		ProjectID:  projectID,
		Anonymous:  false,
	}
	body, _ := json.Marshal(donation)
	return body
}

func TestCreateDonationHandler_Success(t *testing.T) {
	db := setupDonationTestDB()

	user := models.User{ID: uuid.New(), Name: "Test User", Email: "test@example.com"}
	project := models.Project{
		ID:         uuid.New(),
		Title:      "Test Project",
		Goal:       1000.0,
		WalletAddr: "0xdef",
		UserID:     user.ID,
	}
	db.Create(&user)
	db.Create(&project)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request, _ = http.NewRequest("POST", "/donations", bytes.NewBuffer(createDonationRequestBody(project.ID)))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("userID", user.ID.String())
	c.Set("db", db)

	handlers.CreateDonationHandler(c)

	assert.Equal(t, http.StatusCreated, w.Code)
}

func TestCreateDonationHandler_InvalidJSON(t *testing.T) {
	db := setupDonationTestDB()

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request, _ = http.NewRequest("POST", "/donations", bytes.NewBufferString("invalid json"))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("db", db)

	handlers.CreateDonationHandler(c)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestCreateDonationHandler_Unauthorized(t *testing.T) {
	db := setupDonationTestDB()
	project := models.Project{ID: uuid.New(), Title: "Test Project", WalletAddr: "0xdef"}
	db.Create(&project)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request, _ = http.NewRequest("POST", "/donations", bytes.NewBuffer(createDonationRequestBody(project.ID)))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("db", db)

	handlers.CreateDonationHandler(c)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestCreateDonationHandler_ProjectNotFound(t *testing.T) {
	db := setupDonationTestDB()
	user := models.User{ID: uuid.New(), Name: "Test User", Email: "test@example.com"}
	db.Create(&user)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request, _ = http.NewRequest("POST", "/donations", bytes.NewBuffer(createDonationRequestBody(uuid.New())))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("userID", user.ID.String())
	c.Set("db", db)

	handlers.CreateDonationHandler(c)

	assert.Equal(t, http.StatusNotFound, w.Code)
}
func TestGetProjectDonationsHandler_Success(t *testing.T) {
	db := setupDonationTestDB()
	user := models.User{ID: uuid.New(), Name: "Test User", Email: "test@example.com"}
	project := models.Project{
		ID:         uuid.New(),
		Title:      "Test Project",
		Goal:       1000.0,
		WalletAddr: "0xdef",
		UserID:     user.ID,
	}
	db.Create(&user)
	db.Create(&project)

	donation := models.Donation{
		ID:         uuid.New(),
		Amount:     100.0,
		CryptoType: "ETH",
		ProjectID:  project.ID,
		DonorID:    user.ID,
	}
	db.Create(&donation)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/projects/"+project.ID.String()+"/donations", nil)
	c.Params = gin.Params{{Key: "id", Value: project.ID.String()}}
	c.Set("db", db)

	handlers.GetProjectDonationsHandler(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response []models.DonationInfo
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Len(t, response, 1)
}

func TestGetUserDonationsHandler_Success(t *testing.T) {
	db := setupDonationTestDB()
	user := models.User{ID: uuid.New(), Name: "Test User", Email: "test@example.com"}
	project := models.Project{
		ID:         uuid.New(),
		Title:      "Test Project",
		Goal:       1000.0,
		WalletAddr: "0xdef",
		UserID:     user.ID,
	}
	db.Create(&user)
	db.Create(&project)

	donation := models.Donation{
		ID:         uuid.New(),
		Amount:     100.0,
		CryptoType: "ETH",
		ProjectID:  project.ID,
		DonorID:    user.ID,
	}
	db.Create(&donation)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/user/donations", nil)
	c.Set("userID", user.ID.String())
	c.Set("db", db)

	handlers.GetUserDonationsHandler(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response []models.Donation
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Len(t, response, 1)
}
