from flask import Blueprint, session, request, current_app, url_for, g
from boltathon.models.user import User
from boltathon.extensions import db
from boltathon.util.auth import requires_auth
from boltathon.util.errors import RequestError
from boltathon.util.node import get_invoice, get_pubkey_from_credentials

blueprint = Blueprint("templates", __name__, url_prefix="/")

@blueprint.route('/users/<user_id>/new_invoice')
def new_invoice(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        raise RequestError(code=404, message="No user with that ID")

    invoice = get_invoice(user.macaroon, user.node_url, user.cert)
    return '<a href="lightning:{}">Pay with Lightning</a>'.format(invoice.payment_request)

@blueprint.route('/', defaults={'path': ''})
@blueprint.route('/<path:path>')
def index(path):
    if current_app.config.get('ENV') == 'development':
        return 'Development mode frontend should be accessed via webpack-dev-server'
    return current_app.send_static_file('index.html')