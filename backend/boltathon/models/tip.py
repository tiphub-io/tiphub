from datetime import datetime
from boltathon.extensions import ma, db
from boltathon.util import gen_random_id

class Tip(db.Model):
  __tablename__ = 'tip'

  id = db.Column(db.Integer(), primary_key=True)
  date_created = db.Column(db.DateTime)

  receiver_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, primary_key=True)
  sender = db.Column(db.String(63), nullable=True)
  message = db.Column(db.String(255), nullable=True)
  repo = db.Column(db.String(63), nullable=True)
  amount = db.Column(db.Integer(), nullable=False)
  rhash = db.Column(db.String(127), nullable=False)

  def __init__(
    self,
    sender: str,
    message: str,
    amount: int,
    rhash: str,
  ):
    self.id = gen_random_id(Tip)
    self.sender = sender
    self.message = message
    self.amount = amount
    self.rhash = rhash
    self.date_created = datetime.now()

class TipSchema(ma.Schema):
  class Meta:
    model = Tip
    # Fields to expose
    fields = (
      "id",
      "sender",
      "message",
      "repo",
      "amount",
    )

tip_schema = TipSchema()
tips_schema = TipSchema(many=True)
