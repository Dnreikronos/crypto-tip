package migration

import (
	"github.com/Dnreikronos/crypto-tip/internal/models"
	"gorm.io/gorm"
)

func RunMigration(db *gorm.DB) {
	CreateTables(db)
}

func CreateTables(db *gorm.DB) {
	db.AutoMigrate(&models.User{})
}
