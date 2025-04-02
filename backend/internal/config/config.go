var cfg *config

type config struct {
	API APIConfig
	DB  DBConfig
}
type APIConfig struct {
	Port string
}
type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Database string
	TimeZone string
}
func init() {
	viper.SetDefault("api.port", "9090")
	viper.SetDefault("database.port", "${DB_PORT}")
	viper.SetDefault("database.user", "${DB_USER}")
	viper.SetDefault("database.password", "${POSTGRES_PASSWORD}")
	viper.SetDefault("database.database", "${POSTGRES_DATABASE}")
	viper.SetDefault("database.timezone", "${POSTGRES_TIME_ZONE}")
}
func Load() error {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	viper.SetConfigName("config")
	viper.SetConfigType("toml")
	viper.AddConfigPath("../config")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return err
		}
	}

	cfg = &config{
		API: APIConfig{
			Port: viper.GetString("api.port"),
		},
		DB: DBConfig{
			Host:     viper.GetString("database.host"),
			Port:     viper.GetString("database.port"),
			User:     viper.GetString("database.user"),
			Password: viper.GetString("database.pass"),
			Database: viper.GetString("database.database"),
			TimeZone: viper.GetString("database.timezone"),
		},
	}

	log.Printf("Database config: %v", cfg.DB)
	return nil
}
