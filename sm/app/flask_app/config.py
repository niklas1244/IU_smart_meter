class Config:
    """Base configuration class.

    Contains default configuration settings for the application.
    Subclasses should override these settings for specific environments.
    """
    SECRET_KEY = 'SM_SECRET'
    DB_CONFIG = {
        'host': 'db',
        'user': 'root',
        'password': 'Server1!',
        'database': 'sm'
    }
