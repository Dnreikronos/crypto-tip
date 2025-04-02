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
