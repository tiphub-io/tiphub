from authlib.flask.client import OAuth
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow
from flask_talisman import Talisman

oauth = OAuth()
db = SQLAlchemy()
migrate = Migrate()
ma = Marshmallow()
talisman = Talisman()
