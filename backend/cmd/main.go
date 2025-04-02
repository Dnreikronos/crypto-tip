	err := godotenv.Load(".env")
	if err != nil {
		panic(err)
	}
	err = config.Load()
	if err != nil {
		panic(fmt.Sprintf("Failed to load configuration: %v", err))
	}
