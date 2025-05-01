package handlers

import (
	"errors"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/Dnreikronos/crypto-tip/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var (
	jwtSecret             = []byte(os.Getenv("JWT_SECRET"))
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserNotFound       = errors.New("user not found")
)

type TokenResponse struct {
	Token     string `json:"token"`
	ExpiresAt int64  `json:"expires_at"`
}

type Claims struct {
	UserID string `json:"user_id"`
	jwt.StandardClaims
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func VerifyPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

func GenerateToken(user models.User) (string, int64, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID: user.ID.String(),
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
			IssuedAt:  time.Now().Unix(),
			Subject:   user.ID.String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", 0, err
	}

	return tokenString, expirationTime.Unix(), nil
}

func CreateUserHandler(c *gin.Context) {
	var input models.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("error trying to bind json: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if !strings.Contains(input.Email, "@") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		return
	}

	if len(input.Password) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password must be at least 8 characters long"})
		return
	}

	hashedPassword, err := HashPassword(input.Password)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
		return
	}

	db := c.MustGet("db").(*gorm.DB)

	var existingUser models.User
	if err := db.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	newUser := models.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: hashedPassword,
	}

	if err := db.Create(&newUser).Error; err != nil {
		log.Printf("Error creating user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, models.FilteredResponse(newUser))
}

func LoginHandler(c *gin.Context) {
	var input models.SignInInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Error trying to parse json: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	db := c.MustGet("db").(*gorm.DB)
	var existingUser models.User
	if err := db.Where("email = ?", input.Email).First(&existingUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": ErrInvalidCredentials.Error()})
		} else {
			log.Printf("Database error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		}
		return
	}

	if err := VerifyPassword(existingUser.Password, input.Password); err != nil {
		log.Printf("invalid user password: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	token, err := GenereateToken(existingUser)
	if err != nil {
		log.Printf("error trying to genereate JWT token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token})
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == "OPTIONS" {
			c.Next()
			return
		}

		tokenString := c.Request.Header.Get("Authorization")

		if len(tokenString) > 7 && strings.ToUpper(tokenString[0:7]) == "BEARER " {
			tokenString = tokenString[7:]
		}

		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
			c.Abort()
			return
		}

		claims := &jwt.StandardClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			log.Printf("invalid JWT token: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		if _, err := uuid.Parse(claims.Subject); err != nil {
			log.Printf("error invalid user id in JWT token: %v", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID format in token"})
			return
		}

		c.Set("userID", claims.Subject)
		c.Next()
	}
}

func ProfileHandler(c *gin.Context) {
	userID := c.MustGet("userID").(string)

	var u models.User
	db := c.MustGet("db").(*gorm.DB)
	if err := db.First(&u, "id = ?", userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("error, user not found: %v", err)
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			log.Printf("error!!: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		}
		return
	}

	c.JSON(http.StatusOK, models.FilteredResponse(u))
}
