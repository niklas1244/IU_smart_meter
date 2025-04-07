import mysql.connector
from flask import current_app


def get_db_connection():
    """Create and return a new database connection.

    Returns:
        mysql.connector.connection.MySQLConnection: Database connection object
    """
    return mysql.connector.connect(**current_app.config['DB_CONFIG'])
