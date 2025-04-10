package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Project struct {
	ID          uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;"`
	Title       string     `json:"title" gorm:"not null"`
	Description string     `json:"description" gorm:"not null"`
	Goal        float64    `json:"goal" gorm:"not null"`
	Raised      float64    `json:"raised" gorm:"default:0"`
	WalletAddr  string     `json:"wallet_addr" gorm:"not null"`
	UserID      uuid.UUID  `json:"user_id" gorm:"type:uuid;not null; index"`
	User        User       `json:"user" gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Donations   []Donation `json:"donations,omitempty" gorm:"foreignKey:ProjectID"`
	CreatedAt   time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
}

type ProjectInput struct {
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description" binding:"required"`
	Goal        float64 `json:"goal" binding:"required"`
	WalletAddr  string  `json:"wallet_addr" binding:"required"`
}

type ProjectUpdate struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Goal        float64 `json:"goal"`
	WalletAddr  string  `json:"wallet_addr"`
}

type ProjectResponse struct {
	ID          uuid.UUID      `json:"id"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Goal        float64        `json:"goal"`
	Raised      float64        `json:"raised"`
	WalletAddr  string         `json:"wallet_addr"`
	Creator     UserResponse   `json:"creator"`
	Donations   []DonationInfo `json:"donations,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

func (p *Project) BeforeCreate(db *gorm.DB) error {
	p.ID = uuid.New()
	return nil
}

func ProjectToResponse(project Project, includeDonations bool) ProjectResponse {
	response := ProjectResponse{
		ID:          project.ID,
		Title:       project.Title,
		Description: project.Description,
		Goal:        project.Goal,
		Raised:      project.Raised,
		WalletAddr:  project.WalletAddr,
		Creator:     FilteredResponse(project.User),
		CreatedAt:   project.CreatedAt,
		UpdatedAt:   project.UpdatedAt,
	}

	if includeDonations && len(project.Donations) > 0 {
		donations := make([]DonationInfo, 0, len(project.Donations))
		for _, donation := range project.Donations {
			donationInfo := DonationInfo{
				ID:         donation.ID,
				Amount:     donation.Amount,
				CryptoType: donation.CryptoType,
				FromAddr:   donation.FromAddr,
				Message:    donation.Message,
				CreatedAt:  donation.CreatedAt,
			}

			if !donation.Anonymous && donation.DonorID != uuid.Nil {
				userResponse := FilteredResponse(donation.Donor)
				donationInfo.Donor = &userResponse
			}

			donations = append(donations, donationInfo)
		}
		response.Donations = donations
	}

	return response
}
