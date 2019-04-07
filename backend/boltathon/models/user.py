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

  connections = db.relationship('Connection', backref='user', lazy=True, cascade='all, delete-orphan')
  tips = db.relationship('Tip', backref='recipient', lazy=True, cascade='all, delete-orphan')

  def __init__(self):
    self.id = gen_random_id(User)
    self.date_created = datetime.now()
