from datetime import datetime
from boltathon.extensions import ma, db
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4

class Tip(db.Model):
  __tablename__ = 'tip'

  userid = db.Column(db.Integer, db.ForeignKey("proposal.id"), nullable=False, primary_key=True)
  site = db.Column(db.String(63), nullable=False, primary_key=True)
  site_id = db.Column(db.string(63), nullable=False)
  site_username = db.Column(db.string(63), nullable=False)
  date_created = db.Column(db.DateTime)

  def __init__(self, userid: int):
    self.id = uuid4()
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
