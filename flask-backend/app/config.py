import os


class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False


class DevelopmentConfig(Config):
    # Development configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DEV_DATABASE_URL', 'sqlite:///db.sqlite3?check_same_thread=False')
    JWT_SECRET_KEY = os.getenv('DEV_JWT_SECRET_KEY', 'sprintlrufit')


class TestingConfig(Config):
    # Turn on testing mode (propagates exceptions, disables error catching)
    TESTING = True

    # In‑memory SQLite for super‑fast, isolated tests
    SQLALCHEMY_DATABASE_URI = os.getenv('TEST_DATABASE_URL', 'sqlite:///:memory:')

    # You can override or hard‑code a JWT key for tests as well
    JWT_SECRET_KEY = os.getenv('TEST_JWT_SECRET_KEY', 'test-secret-key')
