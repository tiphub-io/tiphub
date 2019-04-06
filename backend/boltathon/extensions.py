from authlib.flask.client import OAuth
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow

oauth = OAuth()
db = SQLAlchemy()
migrate = Migrate()
ma = Marshmallow()