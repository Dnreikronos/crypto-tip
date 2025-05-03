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
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupProjectTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)
	require.NoError(t, db.AutoMigrate(&models.Project{}, &models.User{}))
	return db
}

func createProjectRequestBody(t *testing.T) []byte {
	project := models.ProjectInput{
		Title:       "Test Project",
		Description: "This is a test project",
		Goal:        100.0,
		WalletAddr:  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
		ProjectLink: "github/test",
	}
	body, err := json.Marshal(project)
	require.NoError(t, err)
	return body
}

func TestCreateProjectHandler_Success(t *testing.T) {
	db := setupProjectTestDB(t)
	userID := uuid.New()

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("POST", "/projects", bytes.NewBuffer(createProjectRequestBody(t)))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("userID", userID.String())
	c.Set("db", db)

	handlers.CreateProjectHandler(c)
	require.Equal(t, http.StatusCreated, w.Code, "unexpected response: %s", w.Body.String())
}

func TestCreateProjectHandler_InvalidJSON(t *testing.T) {
	db := setupProjectTestDB(t)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("POST", "/projects", bytes.NewBufferString("invalid json"))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("db", db)

	handlers.CreateProjectHandler(c)
	require.Equal(t, http.StatusBadRequest, w.Code, "unexpected response: %s", w.Body.String())
}

func TestCreateProjectHandler_Unauthorized(t *testing.T) {
	db := setupProjectTestDB(t)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("POST", "/projects", bytes.NewBuffer(createProjectRequestBody(t)))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("db", db)

	handlers.CreateProjectHandler(c)
	require.Equal(t, http.StatusUnauthorized, w.Code, "unexpected response: %s", w.Body.String())
}

func TestUpdateProjectHandler(t *testing.T) {
	db := setupProjectTestDB(t)
	userID := uuid.New()
	project := models.Project{
		ID:          uuid.New(),
		Title:       "Old Title",
		Description: "Old Desc",
		Goal:        100,
		WalletAddr:  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
		ProjectLink: "github/test",
		UserID:      userID,
	}
	db.Create(&project)

	update := models.ProjectUpdate{
		Title:       "New Title",
		Description: "New Desc",
		Goal:        200,
		WalletAddr:  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
		ProjectLink: "github/test",
	}
	body, err := json.Marshal(update)
	require.NoError(t, err)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("PUT", "/projects/"+project.ID.String(), bytes.NewBuffer(body))
	c.Request.Header.Set("Content-Type", "application/json")
	c.Set("userID", userID)
	c.Set("db", db)
	c.Params = gin.Params{gin.Param{Key: "id", Value: project.ID.String()}}

	handlers.UpdateProjectHandler(c)
	require.Equal(t, http.StatusOK, w.Code, "unexpected response: %s", w.Body.String())
}

func TestUpdateProjectHandler_NotFound(t *testing.T) {
	db := setupProjectTestDB(t)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("PUT", "/projects/invalid-id", nil)
	c.Set("userID", uuid.New())
	c.Set("db", db)
	c.Params = gin.Params{gin.Param{Key: "id", Value: uuid.New().String()}}

	handlers.UpdateProjectHandler(c)
	require.Equal(t, http.StatusNotFound, w.Code, "unexpected response: %s", w.Body.String())
}

func TestDeleteProjectHandler_Success(t *testing.T) {
	db := setupProjectTestDB(t)
	userID := uuid.New()
	project := models.Project{
		ID:          uuid.New(),
		Title:       "To be deleted",
		UserID:      userID,
		WalletAddr:  "0xabc",
		ProjectLink: "github/test",
	}
	db.Create(&project)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("DELETE", "/projects/"+project.ID.String(), nil)
	c.Set("userID", userID)
	c.Set("db", db)
	c.Params = gin.Params{gin.Param{Key: "id", Value: project.ID.String()}}

	handlers.DeleteProjectHandler(c)
	require.Equal(t, http.StatusOK, w.Code, "unexpected response: %s", w.Body.String())
}

func TestDeleteProjectHandler_NotFound(t *testing.T) {
	db := setupProjectTestDB(t)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("DELETE", "/projects/invalid-id", nil)
	c.Set("userID", uuid.New())
	c.Set("db", db)
	c.Params = gin.Params{gin.Param{Key: "id", Value: uuid.New().String()}}

	handlers.DeleteProjectHandler(c)
	require.Equal(t, http.StatusNotFound, w.Code, "unexpected response: %s", w.Body.String())
}

func TestGetAllProjectHandler_Success(t *testing.T) {
	db := setupProjectTestDB(t)
	db.Create(&models.Project{ID: uuid.New(), Title: "P1", WalletAddr: "0xabc", Goal: 100, ProjectLink: "github/test"})
	db.Create(&models.Project{ID: uuid.New(), Title: "P2", WalletAddr: "0xdef", Goal: 200, ProjectLink: "github/test"})

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/projects", nil)
	c.Set("db", db)

	handlers.GetAllProjectHandler(c)
	require.Equal(t, http.StatusOK, w.Code, "unexpected response: %s", w.Body.String())
}

func TestGetProjectByIDHandler_Success(t *testing.T) {
	db := setupProjectTestDB(t)
	project := models.Project{
		ID:          uuid.New(),
		Title:       "Single Project",
		WalletAddr:  "0x123",
		ProjectLink: "github/test",
	}
	db.Create(&project)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/projects/"+project.ID.String(), nil)
	c.Set("db", db)
	c.Params = gin.Params{gin.Param{Key: "id", Value: project.ID.String()}}

	handlers.GetProjectByIDHandler(c)
	require.Equal(t, http.StatusOK, w.Code, "unexpected response: %s", w.Body.String())
}

func TestGetProjectByIDHandler_NotFound(t *testing.T) {
	db := setupProjectTestDB(t)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/projects/some-id", nil)
	c.Set("db", db)
	c.Params = gin.Params{gin.Param{Key: "id", Value: uuid.New().String()}}

	handlers.GetProjectByIDHandler(c)
	require.Equal(t, http.StatusNotFound, w.Code, "unexpected response: %s", w.Body.String())
}

func TestGetUserProjectsHandler_Success(t *testing.T) {
	db := setupProjectTestDB(t)
	userID := uuid.New()
	db.Create(&models.Project{ID: uuid.New(), Title: "U1", UserID: userID, WalletAddr: "0xaaa", ProjectLink: "github/test"})
	db.Create(&models.Project{ID: uuid.New(), Title: "U2", UserID: uuid.New(), WalletAddr: "0xbbb", ProjectLink: "github/test"})

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/projects/user", nil)
	c.Set("db", db)
	c.Set("userID", userID)

	handlers.GetUserProjectsHandler(c)
	require.Equal(t, http.StatusOK, w.Code, "unexpected response: %s", w.Body.String())
}
