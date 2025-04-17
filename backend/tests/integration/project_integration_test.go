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
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func init() {
	os.Setenv("JWT_SECRET", "testsecret")
}

func setupRouterIntegration(t *testing.T) (*gin.Engine, *gorm.DB) {
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
	})
	router.POST("/register", handlers.CreateUserHandler)
	router.POST("/login", handlers.LoginHandler)
	router.GET("/projects", handlers.GetAllProjectHandler)
	router.GET("/projects/:id", handlers.GetProjectByIDHandler)

	authorized := router.Group("/")
	authorized.Use(handlers.AuthMiddleware())
	{
		authorized.GET("/profile", handlers.ProfileHandler)

		authorized.POST("/projects", handlers.CreateProjectHandler)
		authorized.PUT("/projects/:id", handlers.UpdateProjectHandler)
		authorized.DELETE("/projects/:id", handlers.DeleteProjectHandler)
		authorized.GET("/user/projects", handlers.GetUserProjectsHandler)
	}

	return router, db
}

func CreateLoginTest(t *testing.T, router *gin.Engine) string {
	user := models.SignInInput{Email: "project@example.com", Password: "123456"}
	registerBody, _ := json.Marshal(user)
	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(registerBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	loginBody, _ := json.Marshal(user)
	req = httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(loginBody))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)

	var resp map[string]string

	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	return resp["token"]
}

func CreateTestProject(t *testing.T, router *gin.Engine, token string) string {
	payload := models.ProjectInput{
		Title:       "Test Project",
		Description: "For Testing",
		Goal:        100.00,
		WalletAddr:  "0xwallet",
	}
	body, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/projects", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	var res map[string]interface{}
	_ = json.Unmarshal(w.Body.Bytes(), &res)
	return res["id"].(string)
}

func TestCreateProjecHandler(t *testing.T) {
	router, _ := setupRouterIntegration(t)
	token := CreateLoginTest(t, router)

	payload := models.ProjectInput{
		Title:       "Project",
		Description: "Testing",
		Goal:        50.00,
		WalletAddr:  "0xwallet",
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/projects", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
}
func TestGetProjectByIDHandler(t *testing.T) {
	router, _ := setupRouterIntegration(t)
	token := CreateLoginTest(t, router)
	projectID := CreateTestProject(t, router, token)

	req := httptest.NewRequest(http.MethodGet, "/projects/"+projectID, nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var body map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &body)
	assert.NoError(t, err)
	assert.Equal(t, projectID, body["id"])
}
func TestUpdateProjectHandler(t *testing.T) {
	router, _ := setupRouterIntegration(t)
	token := CreateLoginTest(t, router)
	projectID := CreateTestProject(t, router, token)

	updatePayload := models.ProjectUpdate{
		Title: "Updated Title",
		Goal:  200.0,
	}
	body, _ := json.Marshal(updatePayload)

	req := httptest.NewRequest(http.MethodPut, "/projects/"+projectID, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var res map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &res)
	assert.NoError(t, err)
	assert.Equal(t, "Updated Title", res["title"])
}

func TestDeleteProjectHandler(t *testing.T) {
	router, _ := setupRouterIntegration(t)
	token := CreateLoginTest(t, router)
	projectID := CreateTestProject(t, router, token)

	req := httptest.NewRequest(http.MethodDelete, "/projects/"+projectID, nil)
	req.Header.Set("Authorization", "Bearer "+token)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var res map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &res)
	assert.NoError(t, err)
	assert.Equal(t, "Project deleted sucessfulyy", res["message"])
}

