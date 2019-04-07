import uuid
from flask import Blueprint, url_for, session, redirect
from loginpass import create_flask_blueprint, GitHub, Gitlab
from boltathon.models.user import User
from boltathon.models.connection import Connection
from boltathon.extensions import oauth, db
from boltathon.util import frontend_url

blueprint = Blueprint("oauth", __name__, url_prefix="/oauth")

def handle_authorize(remote, token, user_info):
    print("handle_authorize: in")
    if not token or not user_info:
        raise hell

    print("handle_authorize: token and user_info are there")
    # Find or create a new user
    print('Searching for user with {} connection under id {}'.format(remote.name, user_info['preferred_username']))
    user = Connection.get_user_by_connection(
        site=remote.name,
        site_id=user_info['preferred_username']
    )
    if not user:
        print('handle_authorize: creating a new user')
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
    print("handle_authorize: setting session user to: {}".format(user.id))
    session['user_id'] = user.id

    redirect_url = frontend_url('/user/{}/config'.format(str(user.id)))
    print("handle_authorize: redirecting to {}".format(redirect_url))
    return redirect(redirect_url)

github_blueprint = create_flask_blueprint(GitHub, oauth, handle_authorize)
gitlab_blueprint = create_flask_blueprint(Gitlab, oauth, handle_authorize)
