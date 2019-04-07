from flask import Blueprint, session, request, current_app, url_for, g, jsonify
from boltathon.models.user import User
from boltathon.models.tip import Tip, tip_schema
from boltathon.extensions import db
from boltathon.util.auth import requires_auth
from boltathon.util.errors import RequestError
from boltathon.util.node import make_invoice, get_pubkey_from_credentials, lookup_invoice

blueprint = Blueprint("templates", __name__, url_prefix="/")

@blueprint.route('/tips/<int:tip_id>')
def get_pending_tip(tip_id):
    tip = Tip.query.get(tip_id)
    if tip:
        if tip.amount is None:
            receiver_user = tip.receiver
            invoice = lookup_invoice(tip.rhash, receiver_user.node_url, receiver_user.macaroon, receiver_user.cert)
            if invoice.amt_paid_msat:
                tip.amount = invoice.amt_paid_msat
                db.session.commit()
        return jsonify(tip_schema.dump(tip))
    raise RequestError(code=404, message="No tip with that ID")


@blueprint.route('/users/<user_id>/new_invoice')
def new_invoice(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        raise RequestError(code=404, message="No user with that ID")
    from_name = request.args.get('from')
    message = request.args.get('message')

    invoice = make_invoice(user.macaroon, user.node_url, user.cert)

    pending_tip = Tip(from_name, message, None, invoice.rhash)
    db.session.add(pending_tip)
    db.session.commit()

    return '<a href="lightning:{}">Pay with Lightning, tip no. {}</a>'.format(invoice.payment_request, pending_tip.id)


@blueprint.route('/', defaults={'path': ''})
@blueprint.route('/<path:path>')
def index(path):
    if current_app.config.get('ENV') == 'development':
        return 'Development mode frontend should be accessed via webpack-dev-server'
    return current_app.send_static_file('index.html')
