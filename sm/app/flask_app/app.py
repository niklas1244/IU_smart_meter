from auth.routes import auth_bp
from config import Config
from flask import Flask
from flask_bcrypt import Bcrypt
from meters.routes import meters_bp
from consumption.routes import consumption_bp
from user.routes import user_bp


def create_app():
    """Create and configure a new Flask app instance."""
    app = Flask(__name__)
    Bcrypt(app)

    app.config.from_object(Config)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(meters_bp, url_prefix='/meters')
    app.register_blueprint(consumption_bp, url_prefix='/consumption')

    return app


if __name__ == '__main__':
    my_app = create_app()
    my_app.run(host='0.0.0.0', port=5000, debug=True)
