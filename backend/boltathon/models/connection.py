from datetime import datetime
from boltathon.extensions import ma, db

class Connection(db.Model):
  __tablename__ = 'connection'

  user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, primary_key=True)
  site = db.Column(db.String(63), nullable=False, primary_key=True)
  site_id = db.Column(db.String(63), nullable=False)
  site_username = db.Column(db.String(63), nullable=False)
  date_created = db.Column(db.DateTime)

  def __init__(self, userid: int, site: str, site_id: str, site_username: str):
    self.userid = userid
    self.site = site
    self.site_id = site_id
    self.site_username = site_username
    self.date_created = datetime.now()

  @staticmethod
  def get_user_by_connection(site: str, site_id: str):
    connection = Connection.query.filter_by(site=site, site_id=site_id).first()
    return connection.user if connection else None

  @staticmethod
  def search_usernames(query: str):
    return Connection.query.filter(Connection.site_username.ilike('%{}%'.format(query))).all()

  @staticmethod
  def search_tippable_users(query: str):
    from boltathon.models.user import User
    Connection.query \
      .join(Connection.user) \
      .filter(User.pubkey != None) \
      .filter(Connection.site_username.ilike('%{}%'.format(query))) \
      .all()


# Limited data (public view)
class PublicConnectionSchema(ma.Schema):
  class Meta:
    model = Connection
    # Fields to expose
    fields = (
      "site",
      "site_id",
      "site_username",
      "user",
    )

  user = ma.Nested("PublicUserSchema", exclude=['connections'])

public_connection_schema = PublicConnectionSchema()
public_connections_schema = PublicConnectionSchema(many=True)

# Full data (self view)
class SelfConnectionSchema(ma.Schema):
  class Meta:
    model = Connection
    # Fields to expose
    fields = (
      "site",
      "site_id",
      "site_username",
      "date_created",
      "user",
    )

  user = ma.Nested("SelfUserSchema", exclude=['connections'])

self_connection_schema = SelfConnectionSchema()
self_connections_schema = SelfConnectionSchema(many=True)
