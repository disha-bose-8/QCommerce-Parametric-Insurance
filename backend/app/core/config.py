#reads .env file and provides access to whole application

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENWEATHER_API_KEY: str = ""
    OPENAQ_API_KEY: str = ""
    AQICN_API_KEY: str = ""
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()