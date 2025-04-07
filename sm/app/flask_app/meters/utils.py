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


def get_meters(user_id: int = None):
    """Retrieve meters"""

    with get_db_connection() as conn:
        cursor = conn.cursor(dictionary=True)

        if user_id is not None:
            cursor.execute(
                """SELECT * FROM meters WHERE owner_id = %s""",
                (user_id,)
            )
        else:
            cursor.execute(
                """SELECT * FROM meters""")
        results = cursor.fetchall()
        return results


def create_meter_in_db(owner_id, meter_id, created_by):
    """Create a new meter in the database."""

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """INSERT INTO meters (
                    meter_id,
                    owner_id,
                    created_by)
                VALUES (%s, %s, %s)""",
                (meter_id, owner_id, created_by,))
            conn.commit()
        return True

    except Exception:
        return False
