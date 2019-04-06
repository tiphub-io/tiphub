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
