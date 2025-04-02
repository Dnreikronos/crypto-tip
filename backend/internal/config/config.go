var cfg *config

type config struct {
	API APIConfig
	DB  DBConfig
}
type APIConfig struct {
	Port string
}
