from datetime import datetime
from boltathon.extensions import ma, db
from boltathon.util import gen_random_id

class User(db.Model):
  __tablename__ = 'user'

  id = db.Column(db.Integer(), primary_key=True)
  date_created = db.Column(db.DateTime)
  email = db.Column(db.String(255), nullable=True)
  macaroon = db.Column(db.String(2047), nullable=True)
  cert = db.Column(db.String(4095), nullable=True)
  node_url = db.Column(db.String(255), nullable=True)
  pubkey = db.Column(db.String(255), nullable=True)

  connections = db.relationship('Connection', backref='user', order_by="asc(Connection.date_created)", lazy=True, cascade='all, delete-orphan')
  tips = db.relationship('Tip', backref='recipient', lazy=True, cascade='all, delete-orphan')

  def __init__(self):
    self.id = gen_random_id(User)
    self.date_created = datetime.now()

  @staticmethod
  def search_by_connection(query: str):
    from boltathon.models.connection import Connection
    return User.query \
      .join(Connection) \
      .filter(Connection.site_username.ilike('%{}%'.format(query))) \
      .limit(5) \
      .all()

# Limited data (public view)
class PublicUserSchema(ma.Schema):
  class Meta:
    model = User
    # Fields to expose
    fields = (
      'id',
      'pubkey',
      'connections',
    )

  connections = ma.Nested('PublicConnectionSchema', many=True, exclude=['user'])

public_user_schema = PublicUserSchema()
public_users_schema = PublicUserSchema(many=True)

# Full data (self view)
class SelfUserSchema(ma.Schema):
  class Meta:
    model = User
    # Fields to expose
    fields = (
      'id',
      'date_created',
      'email',
      'macaroon',
      'cert',
      'node_url',
      'pubkey',
      'connections',
    )
  
  connections = ma.Nested('SelfConnectionSchema', many=True, exclude=['user'])

self_user_schema = SelfUserSchema()
self_users_schema = SelfUserSchema(many=True)
