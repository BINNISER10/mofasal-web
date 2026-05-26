from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Server
    host: str = '0.0.0.0'
    port: int = 4000
    environment: str = 'development'
    cors_origins: str = 'http://localhost:3000,http://localhost:3001'

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(',')]

    @property
    def is_dev(self) -> bool:
        return self.environment == 'development'

    # Database
    database_url: str = 'postgresql+asyncpg://postgres:postgres@localhost:5432/mufasal'

    # JWT
    jwt_secret_key: str = 'mufasal-jwt-secret-change-in-production'
    jwt_algorithm: str = 'HS256'
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    # Redis
    redis_url: str = 'redis://localhost:6379/0'

    # Twilio
    twilio_account_sid: str = ''
    twilio_auth_token: str = ''
    twilio_phone_number: str = ''

    # Firebase
    firebase_credentials_path: str = ''

    # Payment
    moyasar_api_key: str = ''
    moyasar_secret_key: str = ''
    stripe_secret_key: str = ''
    stripe_webhook_secret: str = ''
    apple_pay_merchant_id: str = ''
    stc_pay_api_key: str = ''
    tamara_api_key: str = ''
    tabby_api_key: str = ''

    # Delivery
    uber_client_id: str = ''
    uber_client_secret: str = ''
    careen_api_key: str = ''
    jeeny_api_key: str = ''
    smsa_api_key: str = ''
    aramex_api_key: str = ''

    # ZATCA
    zatca_production: bool = False
    zatca_company_name: str = 'MUFASAL'
    zatca_company_cr: str = '1234567890'
    zatca_company_vat: str = '310000000000003'
    zatca_environment: str = 'simulation'

    model_config = {'env_file': '.env', 'env_file_encoding': 'utf-8'}


settings = Settings()
