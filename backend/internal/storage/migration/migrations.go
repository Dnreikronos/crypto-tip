func RunMigration(db *gorm.DB) {
	CreateTables(db)
}
