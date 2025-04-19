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

func setupProjectTestDB() *gorm.DB {
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	_ = db.AutoMigrate(&models.Project{}, &models.User{}, &models.Donation{})
	return db
}

func createProjectRequestBody() []byte {
	project := models.ProjectInput{
		Title:       "Test Project",
		Description: "This is a test project",
		Goal:        100.0,
		WalletAddr:  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
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

func TestCreateProjectHandler_Unauthorized(t *testing.T) {
	db := setupProjectTestDB()

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request, _ = http.NewRequest("POST", "/projects", bytes.NewBuffer(createProjectRequestBody()))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("db", db)

	handlers.CreateProjectHandler(c)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestUpdateProjectHandler(t *testing.T) {
	db := setupProjectTestDB()
	userID := uuid.New()
	project := models.Project{
		ID:          uuid.New(),
		Title:       "Old Title",
		Description: "Old Desc",
		Goal:        100,
		WalletAddr:  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
		UserID:      userID,
	}
	db.Create(&project)

	update := models.ProjectUpdate{
		Title:       "New Title",
		Description: "New Desc",
		Goal:        200,
		WalletAddr:  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
	}
	body, _ := json.Marshal(update)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("PUT", "/projects/"+project.ID.String(), bytes.NewBuffer(body))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("UserID", userID)
	c.Set("db", db)
	c.Params = gin.Params{{Key: "id", Value: project.ID.String()}}

	handlers.UpdateProjectHandler(c)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestUpdateProjectHandler_NotFound(t *testing.T) {
	db := setupProjectTestDB()

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("PUT", "/projects/invalid-id", nil)
	c.Set("UserID", uuid.New())
	c.Set("db", db)
	c.Params = gin.Params{{Key: "id", Value: uuid.New().String()}}

	handlers.UpdateProjectHandler(c)
	assert.Equal(t, http.StatusNotFound, w.Code)
}

func TestDeleteProjectHandler_Success(t *testing.T) {
	db := setupProjectTestDB()
	userID := uuid.New()
	project := models.Project{
		ID:         uuid.New(),
		Title:      "To be deleted",
		UserID:     userID,
		WalletAddr: "0xabc",
	}
	db.Create(&project)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("DELETE", "/projects/"+project.ID.String(), nil)
	c.Set("UserID", userID)
	c.Set("db", db)
	c.Params = gin.Params{{Key: "id", Value: project.ID.String()}}

	handlers.DeleteProjectHandler(c)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestDeleteProjectHandler_NotFound(t *testing.T) {
	db := setupProjectTestDB()

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("DELETE", "/projects/invalid-id", nil)
	c.Set("UserID", uuid.New())
	c.Set("db", db)
	c.Params = gin.Params{{Key: "id", Value: uuid.New().String()}}

	handlers.DeleteProjectHandler(c)
	assert.Equal(t, http.StatusNotFound, w.Code)
}

func TestGetAllProjectHandler_Success(t *testing.T) {
	db := setupProjectTestDB()
	db.Create(&models.Project{ID: uuid.New(), Title: "P1", WalletAddr: "0xabc", Goal: 100})
	db.Create(&models.Project{ID: uuid.New(), Title: "P2", WalletAddr: "0xdef", Goal: 200})

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/projects", nil)
	c.Set("db", db)

	handlers.GetAllProjectHandler(c)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestGetProjectByIDHandler_Success(t *testing.T) {
	db := setupProjectTestDB()
	project := models.Project{
		ID:         uuid.New(),
		Title:      "Single Project",
		WalletAddr: "0x123",
	}
	db.Create(&project)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/projects/"+project.ID.String(), nil)
	c.Set("db", db)
	c.Params = gin.Params{{Key: "id", Value: project.ID.String()}}

	handlers.GetProjectByIDHandler(c)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestGetProjectByIDHandler_NotFound(t *testing.T) {
	db := setupProjectTestDB()

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/projects/some-id", nil)
	c.Set("db", db)
	c.Params = gin.Params{{Key: "id", Value: uuid.New().String()}}

	handlers.GetProjectByIDHandler(c)
	assert.Equal(t, http.StatusNotFound, w.Code)
}
func TestGetUserProjectsHandler_Success(t *testing.T) {
	db := setupProjectTestDB()
	userID := uuid.New()
	db.Create(&models.Project{ID: uuid.New(), Title: "U1", UserID: userID, WalletAddr: "0xaaa"})
	db.Create(&models.Project{ID: uuid.New(), Title: "U2", UserID: uuid.New(), WalletAddr: "0xbbb"})

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/projects/user", nil)
	c.Set("db", db)
	c.Set("userID", userID)

	handlers.GetUserProjectsHandler(c)
	assert.Equal(t, http.StatusOK, w.Code)
}
