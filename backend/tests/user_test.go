package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Dnreikronos/budgetMannager---Back/handlers"
	"github.com/Dnreikronos/budgetMannager---Back/models"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupRouter(t *testing.T) (*gin.Engine, *gorm.DB) {
	t.Helper()

	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open DB: %v", err)
	}

	err = db.AutoMigrate(&models.User{})
	if err != nil {
		t.Fatalf("failed to migrate DB: %v", err)
	}

	router := gin.Default()
	router.Use(func(c *gin.Context) {
		c.Set("db", db)
	})
	router.POST("/create", handlers.CreateUserHandler)
	router.POST("/login", handlers.LoginHandler)
	router.GET("/profile", handlers.AuthMiddleware(), handlers.ProfileHandler)

	return router, db
}

func createTestUser(t *testing.T, db *gorm.DB, email, password string, verified bool) {
	t.Helper()

	hashedPassword, err := handlers.HashPassword(password)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	user := models.User{Email: email, Password: hashedPassword, Verified: verified}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create test user: %v", err)
	}
}

func loginUser(t *testing.T, router *gin.Engine, email, password string) string {
	t.Helper()

	loginInput := models.SignInInput{Email: email, Password: password}
	body, err := json.Marshal(loginInput)
	if err != nil {
		t.Fatalf("failed to marshal login input: %v", err)
	}

	req, err := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
	if err != nil {
		t.Fatalf("failed to create login request: %v", err)
	}

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("login failed with code %d", w.Code)
	}

	var resp map[string]string
	err = json.Unmarshal(w.Body.Bytes(), &resp)
	if err != nil {
		t.Fatalf("failed to parse login response: %v", err)
	}

	return resp["token"]
}

func TestCreateUserHandler(t *testing.T) {
	router, db := setupRouter(t)

	userInput := models.SignInInput{Email: "test@example.com", Password: "password123"}
	body, err := json.Marshal(userInput)
	if err != nil {
		t.Fatalf("failed to marshal input: %v", err)
	}

	req, err := http.NewRequest("POST", "/create", bytes.NewBuffer(body))
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var user models.User
	err = db.Where("email = ?", userInput.Email).First(&user).Error
	assert.NoError(t, err)
	assert.NotEmpty(t, user.ID)
	assert.True(t, user.Verified)
}

func TestCreateUserBadRequest(t *testing.T) {
	router, _ := setupRouter(t)

	body := []byte(`{"email": "test@example.com"}`) // Missing password
	req, err := http.NewRequest("POST", "/create", bytes.NewBuffer(body))
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestLoginHandler(t *testing.T) {
	router, db := setupRouter(t)
	createTestUser(t, db, "test@example.com", "password123", true)

	t.Run("Valid login", func(t *testing.T) {
		body, _ := json.Marshal(models.SignInInput{Email: "test@example.com", Password: "password123"})
		req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.NotEmpty(t, response["token"])
	})

	t.Run("Invalid password", func(t *testing.T) {
		body, _ := json.Marshal(models.SignInInput{Email: "test@example.com", Password: "wrong"})
		req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("Non-existent user", func(t *testing.T) {
		body, _ := json.Marshal(models.SignInInput{Email: "nouser@example.com", Password: "secret"})
		req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}

func TestProfileHandler(t *testing.T) {
	router, db := setupRouter(t)
	createTestUser(t, db, "test@example.com", "password123", true)

	token := loginUser(t, router, "test@example.com", "password123")

	reqProfile, err := http.NewRequest("GET", "/profile", nil)
	if err != nil {
		t.Fatalf("failed to create profile request: %v", err)
	}
	reqProfile.Header.Set("Authorization", token)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, reqProfile)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestAuthMiddleware(t *testing.T) {
	router, _ := setupRouter(t)

	t.Run("Missing token", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/profile", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("Invalid token", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/profile", nil)
		req.Header.Set("Authorization", "invalid-token")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}
