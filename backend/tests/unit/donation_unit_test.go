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
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupDonationTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)
	require.NoError(t, db.AutoMigrate(&models.User{}, &models.Project{}, &models.Donation{}))
	return db
}

func createDonationRequestBody(t *testing.T, projectID uuid.UUID) []byte {
	donation := models.DonationInput{
		Amount:     100.0,
		CryptoType: "ETH",
		TxHash:     "0x123",
		FromAddr:   "0xabc",
		Message:    "Test donation",
		ProjectID:  projectID,
		Anonymous:  false,
	}
	body, err := json.Marshal(donation)
	require.NoError(t, err)
	return body
}

func TestCreateDonationHandler_Success(t *testing.T) {
	db := setupDonationTestDB(t)

	user := models.User{ID: uuid.New(), Name: "Test User", Email: "test@example.com"}
	project := models.Project{ID: uuid.New(), Title: "Test Project", Goal: 1000.0, WalletAddr: "0xdef", UserID: user.ID}
	require.NoError(t, db.Create(&user).Error)
	require.NoError(t, db.Create(&project).Error)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request, _ = http.NewRequest("POST", "/donations", bytes.NewBuffer(createDonationRequestBody(t, project.ID)))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("userID", user.ID.String())
	c.Set("db", db)

	handlers.CreateDonationHandler(c)
	require.Equal(t, http.StatusCreated, w.Code, "unexpected response: %s", w.Body.String())
}

func TestCreateDonationHandler_InvalidJSON(t *testing.T) {
	db := setupDonationTestDB(t)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request, _ = http.NewRequest("POST", "/donations", bytes.NewBufferString("invalid json"))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("db", db)

	handlers.CreateDonationHandler(c)
	require.Equal(t, http.StatusBadRequest, w.Code, "unexpected response: %s", w.Body.String())
}

func TestCreateDonationHandler_ProjectNotFound(t *testing.T) {
	db := setupDonationTestDB(t)
	user := models.User{ID: uuid.New(), Name: "Test User", Email: "test@example.com"}
	require.NoError(t, db.Create(&user).Error)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request, _ = http.NewRequest("POST", "/donations", bytes.NewBuffer(createDonationRequestBody(t, uuid.New())))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("userID", user.ID.String())
	c.Set("db", db)

	handlers.CreateDonationHandler(c)
	require.Equal(t, http.StatusNotFound, w.Code, "unexpected response: %s", w.Body.String())
}

func TestGetProjectDonationsHandler_Success(t *testing.T) {
	db := setupDonationTestDB(t)
	user := models.User{ID: uuid.New(), Name: "Test User", Email: "test@example.com"}
	project := models.Project{ID: uuid.New(), Title: "Test Project", Goal: 1000.0, WalletAddr: "0xdef", UserID: user.ID}
	require.NoError(t, db.Create(&user).Error)
	require.NoError(t, db.Create(&project).Error)

	donation := models.Donation{ID: uuid.New(), Amount: 100.0, CryptoType: "ETH", ProjectID: project.ID}
	require.NoError(t, db.Create(&donation).Error)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/projects/"+project.ID.String()+"/donations", nil)
	c.Params = gin.Params{gin.Param{Key: "id", Value: project.ID.String()}}
	c.Set("db", db)

	handlers.GetProjectDonationsHandler(c)
	require.Equal(t, http.StatusOK, w.Code, "unexpected response: %s", w.Body.String())

	var response []models.DonationInfo
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Len(t, response, 1)
}

func TestGetUserDonationsHandler_Success(t *testing.T) {
	db := setupDonationTestDB(t)
	user := models.User{ID: uuid.New(), Name: "Test User", Email: "test@example.com"}
	project := models.Project{ID: uuid.New(), Title: "Test Project", Goal: 1000.0, WalletAddr: "0xdef", UserID: user.ID}
	require.NoError(t, db.Create(&user).Error)
	require.NoError(t, db.Create(&project).Error)

	donation := models.Donation{ID: uuid.New(), Amount: 100.0, CryptoType: "ETH", ProjectID: project.ID, FromAddr: user.ID.String()}
	require.NoError(t, db.Create(&donation).Error)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/user/donations", nil)
	c.Set("userID", user.ID.String())
	c.Set("db", db)

	handlers.GetUserDonationsHandler(c)
	require.Equal(t, http.StatusOK, w.Code, "unexpected response: %s", w.Body.String())

	var response []models.Donation
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Len(t, response, 1)
}

func TestGetUserDonationsHandler_Unauthorized(t *testing.T) {
	db := setupDonationTestDB(t)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/user/donations", nil)
	c.Set("db", db)

	handlers.GetUserDonationsHandler(c)
	require.Equal(t, http.StatusUnauthorized, w.Code, "unexpected response: %s", w.Body.String())
}

func TestGetDonationByIDHandler_Success(t *testing.T) {
	db := setupDonationTestDB(t)
	user := models.User{ID: uuid.New(), Name: "Test User", Email: "test@example.com"}
	project := models.Project{ID: uuid.New(), Title: "Test Project", Goal: 1000.0, WalletAddr: "0xdef", UserID: user.ID}
	require.NoError(t, db.Create(&user).Error)
	require.NoError(t, db.Create(&project).Error)

	donation := models.Donation{ID: uuid.New(), Amount: 100.0, CryptoType: "ETH", ProjectID: project.ID}
	//, DonorID: user.ID
	require.NoError(t, db.Create(&donation).Error)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/donations/"+donation.ID.String(), nil)
	c.Params = gin.Params{gin.Param{Key: "id", Value: donation.ID.String()}}
	c.Set("db", db)

	handlers.GetDonationByIDHandler(c)
	require.Equal(t, http.StatusOK, w.Code, "unexpected response: %s", w.Body.String())

	var response models.Donation
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Equal(t, donation.ID, response.ID)
}

func TestGetDonationByIDHandler_NotFound(t *testing.T) {
	db := setupDonationTestDB(t)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/donations/"+uuid.New().String(), nil)
	c.Params = gin.Params{gin.Param{Key: "id", Value: uuid.New().String()}}
	c.Set("db", db)

	handlers.GetDonationByIDHandler(c)
	require.Equal(t, http.StatusNotFound, w.Code, "unexpected response: %s", w.Body.String())
}
