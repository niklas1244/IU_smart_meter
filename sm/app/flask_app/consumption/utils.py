from datetime import datetime
from auth.utils import get_data_from_token, user_is_authorized
from database import get_db_connection


def get_user_id(token, input_data=None):
    """Verify user authentication and extract user ID"""
    try:
        if not token:
            return None
        token_user_id = get_data_from_token(token, 'userId')

        if input_data is not None:
            input_data_user_id = input_data.get('userId')
            if (input_data_user_id and
                    input_data_user_id != token_user_id and
                    user_is_authorized(token,
                                       [99])):
                return input_data_user_id

        return token_user_id

    except Exception:
        return None


def get_consumption_data(limit: int = 100, offset: int = 0):
    """Retrieve a list of data from the database.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """SELECT 
                c.id,
                m.meter_id,
                c.consumption_kwh,
                c.timestamp,
                c.modify_timestamp
                FROM consumption_data c
                INNER JOIN meters m
                ON c.meter_id = m.id
                LIMIT %s OFFSET %s""",
            (limit, offset,))
        data = cursor.fetchall()
    return data


def get_consumption_data_for_user_in_db(user_id):
    """Retrieve a data from the database by its ID."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """SELECT 
                c.id,
                m.meter_id,
                c.consumption_kwh,
                c.timestamp,
                c.modify_timestamp
                FROM consumption_data c
                INNER JOIN meters m
                ON c.meter_id = m.id
                WHERE owner_id = %s""",
                (user_id,))
            data = cursor.fetchall()
        return data

    except Exception as e:
        print(f"Error fetching data:: {str(e)}")
        return None


def add_consumption_data_in_db(data: dict) -> bool:
    """Create a new data in the database"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """INSERT INTO consumption_data (
                    meter_id,
                    consumption_kwh)
                VALUES (%s, %s)""",
                (data['meter_id'], data['consumption_kwh']))
            conn.commit()
        return True

    except Exception as e:
        print(f"Error adding data: {str(e)}")
        return False


def update_consumption_data_in_db(data: dict) -> bool:
    """Update data information in the database"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE consumption_data
                SET consumption_kwh = %s,
                modify_timestamp = %s
                WHERE id = %s
                """,
                (
                    data["consumption_kwh"],
                    datetime.now(),
                    data["id"],
                ),
            )
            conn.commit()
        return True

    except Exception as e:
        print(f"Error updating data: {str(e)}")
        return False
