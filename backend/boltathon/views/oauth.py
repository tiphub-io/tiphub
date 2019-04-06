import uuid
from flask import Blueprint, url_for, session, redirect
from loginpass import create_flask_blueprint, GitHub, Gitlab
from boltathon.models.user import site_user, user_lnd
from boltathon.extensions import oauth
from boltathon.utils import frontend_url

blueprint = Blueprint("oauth", __name__, url_prefix="/oauth")

def handle_authorize(remote, token, user_info):
    print("handle_authorize: in")
    if token and user_info:
        print("handle_authorize: token and user_info are there")
        site_user_key = (remote.name, user_info['sub'])
        print("handle_authorize: site key is: {}".format(site_user_key))

        if site_user_key in site_user:
            user_id = site_user[site_user_key][0]
            print("handle_authorize: found existing user: {}".format(user_id))
        else:
            user_id = uuid.uuid4()
            print("handle_authorize: no existing user, created user: {}".format(user_id))
            site_user[site_user_key] = (user_id, user_info)

        print("Info: {}".format(user_info))

        session['user_id'] = user_id
        print("handle_authorize: setting session user to: {}".format(user_id))

        redirect_url = frontend_url('/user/{}/config'.format(str(user_id)))
        print("handle_authorize: redirecting to {}".format(redirect_url))
        return redirect(redirect_url)
    raise hell

github_blueprint = create_flask_blueprint(GitHub, oauth, handle_authorize)
gitlab_blueprint = create_flask_blueprint(Gitlab, oauth, handle_authorize)
