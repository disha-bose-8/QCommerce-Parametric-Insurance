from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    ENVIRONMENT: str = "development"

    #ADD THESE
    OPENWEATHER_API_KEY: str
    AQICN_API_KEY: str
    NEWSAPI_KEY: str
    UPTIMEROBOT_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()