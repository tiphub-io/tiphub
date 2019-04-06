from datetime import datetime
from boltathon.extensions import ma, db
from boltathon.util import gen_random_id

# TODO: Remove me
site_user = dict()
user_lnd = dict()


class User(db.Model):
  __tablename__ = 'user'

  id = db.Column(db.Integer(), primary_key=True)
  date_created = db.Column(db.DateTime)
  email = db.Column(db.String(255), nullable=True)
  macaroon = db.Column(db.String(1023), nullable=True)
  cert = db.Column(db.String(2047), nullable=True)
  node_url = db.Column(db.String(255), nullable=True)
  pubkey = db.Column(db.String(255), nullable=True)

  connections = db.relationship('Connection', backref='user', lazy=True, cascade='all, delete-orphan')
  tips = db.relationship('Tip', backref='recipient', lazy=True, cascade='all, delete-orphan')

  def __init__(self):
    self.id = gen_random_id(User)
    self.date_created = datetime.now()
  
  def update_config(
    self,
    email: str,
    macaroon: str,
    cert: str,
    node_url: str,
    pubkey: str,
  ):
    self.email = email
    self.macaroon = macaroon
    self.cert = cert
    self.node_url = node_url
    self.pubkey = pubkey
    db.session.add(self)
    db.session.flush()
