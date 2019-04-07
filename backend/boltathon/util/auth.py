from functools import wraps
from flask import g, session, current_app
from boltathon.models.user import User
from .errors import RequestError

def requires_auth(f):
  @wraps(f)
  def decorated(*args, **kwargs):
    # Check that they have user_id in session
    if not session.get('user_id'):
      raise RequestError(code=403, message='Must be logged in to do that')
    # Check that the user is forreal
    user = User.query.filter_by(id=session.get('user_id')).first()
    if not user:
      session['user_id'] = None
      raise RequestError(code=403, message='Must be logged in to do that')
    # Set it to the global context and continue
    g.current_user = user
    return f(*args, **kwargs)
  return decorated
