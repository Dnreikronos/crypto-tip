package unit_test

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/Dnreikronos/crypto-tip/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))
var jwtMethod = jwt.SigningMethodES256

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func VerifyPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

func GenereateToken(user models.User) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &jwt.StandardClaims{
		Subject:   user.ID.String(),
		ExpiresAt: expirationTime.Unix(),
	}
	token := jwt.NewWithClaims(jwtMethod, claims)
	return token.SignedString(jwtSecret)
}

func CreateUserHandler(c *gin.Context) {
	var input models.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("invalid request body: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	hashedPassword, err := HashPassword(input.Password)
	if err != nil {
		log.Printf("error trying to hash password: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	newUser := models.User{
		Email:    input.Email,
		Password: hashedPassword,
		Verified: true,
	}
	db := c.MustGet("db").(*gorm.DB)
	if err := db.Create(&newUser).Error; err != nil {
		log.Printf("error trying to create user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}
	c.JSON(http.StatusCreated, models.FilteredResponse(newUser))
}

func LoginHandler(c *gin.Context) {
	var input models.SignInInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("invalid login input: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var existingUser models.User
	db := c.MustGet("db").(*gorm.DB)
	if err := db.Where("email = ?", input.Email).First(&existingUser).Error; err != nil {
		log.Printf("user not found: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Credentials"})
		return
	}
	if err := VerifyPassword(existingUser.Password, input.Password); err != nil {
		log.Printf("Password missmatch, %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Credentials"})
		return
	}
	token, err := GenereateToken(existingUser)
	if err != nil {
		log.Printf("error trying to genereate bearer token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token})
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.Request.Header.Get("Authorization")
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
			log.Printf("Invalid token: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
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
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		}
		return
	}

	c.JSON(http.StatusOK, models.FilteredResponse(u))
}
