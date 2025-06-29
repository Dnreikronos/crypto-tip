package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Donation struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;"`
	Amount     float64   `json:"amount"`
	CryptoType string    `json:"crypto_type"`
	TxHash     string    `json:"tx_hash"`
	FromAddr   string    `json:"from_addr"`
	Message    string    `json:"message"`
	ProjectID  uuid.UUID `json:"project_id" gorm:"type:uuid;"`
	Project    Project   `json:"-" gorm:"foreignKey:ProjectID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	//DonorID    uuid.UUID `json:"donor_id,omitempty" gorm:"type:uuid;"`
	//Donor      User      `json:"-" gorm:"foreignKey:DonorID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Anonymous bool      `json:"anonymous" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type DonationInput struct {
	Amount     float64   `json:"amount" binding:"required"`
	CryptoType string    `json:"crypto_type" binding:"required"`
	TxHash     string    `json:"tx_hash" binding:"required"`
	FromAddr   string    `json:"from_addr" binding:"required"`
	Message    string    `json:"message"`
	Anonymous  bool      `json:"anonymous"`
	ProjectID  uuid.UUID `json:"project_id" binding:"required"`
}

type DonationInfo struct {
	ID         uuid.UUID     `json:"id"`
	Amount     float64       `json:"amount"`
	CryptoType string        `json:"crypto_type"`
	FromAddr   string        `json:"from_addr"`
	Message    string        `json:"message"`
	Donor      *UserResponse `json:"donor,omitempty"`
	CreatedAt  time.Time     `json:"created_at"`
}

func (d *Donation) BeforeCreate(db *gorm.DB) error {
	d.ID = uuid.New()
	return nil
}
