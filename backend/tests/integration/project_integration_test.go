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

func setupRouterIntegration(t *testing.T) (*gin.Engine, *gorm.DB) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)

	err = db.AutoMigrate(&models.User{}, &models.Project{})
	require.NoError(t, err)

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
		authorized.GET("/user/projects", func(c *gin.Context) {
			idStr := c.MustGet("userID").(string)
			userID, err := uuid.Parse(idStr)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
				return
			}

			db := c.MustGet("db").(*gorm.DB)
			var projects []models.Project
			if err := db.Preload("User").Where("user_id = ?", userID).Find(&projects).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch your projects"})
				return
			}

			response := make([]models.ProjectResponse, 0, len(projects))
			for _, project := range projects {
				response = append(response, models.ProjectToResponse(project, false))
			}

			c.JSON(http.StatusOK, response)
		})
	}

	return router, db
}

func CreateLoginTest(t *testing.T, router *gin.Engine) string {
	user := models.RegisterInput{Name: "Teste", Email: "project@example.com", Password: "12345678"}
	registerBody, err := json.Marshal(user)
	require.NoError(t, err)

	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(registerBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	require.Equal(t, http.StatusCreated, w.Code)

	loginBody, err := json.Marshal(user)
	require.NoError(t, err)

	req = httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(loginBody))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)
	require.Equal(t, http.StatusOK, w.Code)

	var resp map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &resp)
	require.NoError(t, err)

	token, ok := resp["token"].(string)
	require.True(t, ok, "expected token as string, got: %#v", resp["token"])
	return token
}

func CreateTestProject(t *testing.T, router *gin.Engine, token string) string {
	payload := models.ProjectInput{
		Title:       "Test Project",
		Description: "For Testing",
		Goal:        100.00,
		WalletAddr:  "0xwallet",
		ProjectLink: "github/test",
	}
	body, err := json.Marshal(payload)
	require.NoError(t, err)

	req := httptest.NewRequest(http.MethodPost, "/projects", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	require.Equal(t, http.StatusCreated, w.Code)

	var res map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &res)
	require.NoError(t, err)

	id, ok := res["id"].(string)
	require.True(t, ok, "expected string id, got: %#v", res["id"])
	return id
}

func TestCreateProjecHandler(t *testing.T) {
	router, _ := setupRouterIntegration(t)
	token := CreateLoginTest(t, router)

	payload := models.ProjectInput{
		Title:       "Project",
		Description: "Testing",
		Goal:        50.00,
		WalletAddr:  "0xwallet",
		ProjectLink: "github/test",
	}
	body, err := json.Marshal(payload)
	require.NoError(t, err)

	req := httptest.NewRequest(http.MethodPost, "/projects", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	require.Equal(t, http.StatusCreated, w.Code)

	var res map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &res)
	require.NoError(t, err)

	_, ok := res["id"].(string)
	require.True(t, ok, "expected string id, got: %#v", res["id"])
}

func TestGetProjectByIDHandler(t *testing.T) {
	router, _ := setupRouterIntegration(t)
	token := CreateLoginTest(t, router)
	projectID := CreateTestProject(t, router, token)

	req := httptest.NewRequest(http.MethodGet, "/projects/"+projectID, nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	require.Equal(t, http.StatusOK, w.Code)

	var body map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &body)
	require.NoError(t, err)

	id, ok := body["id"].(string)
	require.True(t, ok, "expected string id in response")
	assert.Equal(t, projectID, id)
}

func TestUpdateProjectHandler(t *testing.T) {
	router, _ := setupRouterIntegration(t)
	token := CreateLoginTest(t, router)
	projectID := CreateTestProject(t, router, token)

	updatePayload := models.ProjectUpdate{
		Title: "Updated Title",
		Goal:  200.0,
	}
	body, err := json.Marshal(updatePayload)
	require.NoError(t, err)

	req := httptest.NewRequest(http.MethodPut, "/projects/"+projectID, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	require.Equal(t, http.StatusOK, w.Code)

	var res map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &res)
	require.NoError(t, err)
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

	require.Equal(t, http.StatusOK, w.Code)

	var res map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &res)
	require.NoError(t, err)

	msg, ok := res["message"].(string)
	require.True(t, ok)
	assert.Equal(t, "Project deleted sucessfulyy", msg)
}

func TestGetUserProjectsHandler(t *testing.T) {
	router, _ := setupRouterIntegration(t)
	token := CreateLoginTest(t, router)
	CreateTestProject(t, router, token)

	req := httptest.NewRequest(http.MethodGet, "/user/projects", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	require.Equal(t, http.StatusOK, w.Code)

	var projects []map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &projects)
	require.NoError(t, err)
	require.Len(t, projects, 1)

	_, ok := projects[0]["id"].(string)
	require.True(t, ok, "expected string id in user projects")
}
