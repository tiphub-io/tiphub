import uuid
from flask import Blueprint, url_for, session, redirect
from loginpass import create_flask_blueprint, GitHub, Gitlab
from boltathon.models.user import User
from boltathon.models.connection import Connection
from boltathon.extensions import oauth, db
from boltathon.util import frontend_url
from boltathon.util.errors import RequestError

blueprint = Blueprint("oauth", __name__, url_prefix="/oauth")

def handle_authorize(remote, token, user_info):
    if not token or not user_info:
        raise RequestError(code=400, message="Missing OAuth token or user info")

    # Find or create a new user
    user = Connection.get_user_by_connection(
        site=remote.name,
        site_id=user_info['preferred_username']
    )
    if not user:
        user = User()
        connection = Connection(
            userid=user.id,
            site=remote.name,
            site_id=user_info['preferred_username'],
            site_username=user_info['preferred_username'],
        )
        user.connections.append(connection)
        db.session.add(user)
        db.session.add(connection)
        db.session.commit()

    # Set them as logged in in the session
    session['user_id'] = user.id
    redirect_url = frontend_url('/user/me')
    return redirect(redirect_url)

github_blueprint = create_flask_blueprint(GitHub, oauth, handle_authorize)
gitlab_blueprint = create_flask_blueprint(Gitlab, oauth, handle_authorize)
