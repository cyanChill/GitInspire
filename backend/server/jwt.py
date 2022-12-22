from flask_jwt_extended import JWTManager

# Create JWT manager
jwt = JWTManager()


def init_jwt(app):
    with app.app_context():
        jwt.init_app(app)
