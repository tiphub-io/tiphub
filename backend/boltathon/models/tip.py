from datetime import datetime
from boltathon.extensions import ma, db
from boltathon.util import gen_random_id

class Tip(db.Model):
  __tablename__ = 'tip'

  id = db.Column(db.Integer(), primary_key=True)
  date_created = db.Column(db.DateTime)

  receiver_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
  sender = db.Column(db.String(63), nullable=True)
  message = db.Column(db.String(255), nullable=True)
  repo = db.Column(db.String(63), nullable=True)
  amount = db.Column(db.Integer(), nullable=True)
  payment_request = db.Column(db.String(255), nullable=False)
  rhash = db.Column(db.String(127), nullable=False)

  def __init__(
    self,
    receiver_id: int,
    sender: str,
    message: str,
    payment_request: str,
    rhash: str,
  ):
    self.id = gen_random_id(Tip)
    self.receiver_id = receiver_id
    self.sender = sender
    self.message = message
    self.payment_request = payment_request
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
      "payment_request",
    )

tip_schema = TipSchema()
tips_schema = TipSchema(many=True)
