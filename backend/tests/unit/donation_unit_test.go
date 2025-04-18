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

