from functools import wraps
from flask import g, session, current_app
from boltathon.models.user import User
from .errors import RequestError

def requires_auth(f):
  @wraps(f)
  def decorated(*args, **kwargs):
    user = get_authed_user()
    if not user:
      raise RequestError(code=403, message='Must be logged in to do that')
    else:
      return f(*args, **kwargs)
  return decorated

def get_authed_user():
  # If we've already done this, early exit
  if g.get('current_user'):
    return g.get('current_user')
  # Check if they have user_id in session
  if not session or not session.get('user_id'):
    return False
  # Check that the user is forreal
  user = User.query.filter_by(id=session.get('user_id')).first()
  if not user:
    session['user_id'] = None
    return False
  # Set it to the global context and return it
  g.current_user = user
  return user
