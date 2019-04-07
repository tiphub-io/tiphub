from flask import Blueprint, session, request, current_app, url_for, g, jsonify, send_file
from boltathon.models.user import User
from boltathon.models.tip import Tip, tip_schema
from boltathon.extensions import db
from boltathon.util.auth import requires_auth
from boltathon.util.errors import RequestError
from boltathon.util.node import make_invoice, get_pubkey_from_credentials, lookup_invoice
from sqlalchemy import func
import io
import svgwrite

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


@blueprint.route('/users/<user_id>/top_donors')
def top_donors(receiver_id):
    return jsonify({
        "anon": anonymous_tip_total(receiver_id),
        "top": top_donors_total(receiver_id),
    })

def anonymous_tip_total(receiver_id):
    return db.session.query(func.sum(Tip.amount))\
                     .filter_by(receiver_id=receiver_id, sender=None)\
                     .filter(Tip.amount.isnot(None))\
                     .first()

def top_donors_total(receiver_id, limit=5):
    return db.session.query(Tip.sender, func.sum(Tip.amount))\
                     .filter_by(receiver_id=receiver_id)\
                     .filter(Tip.amount.isnot(None))\
                     .filter(Tip.sender.isnot(None))\
                     .group_by(Tip.sender)\
                     .limit(limit)\
                     .all()

@blueprint.route('/users/<receiver_id>/top_donors.svg')
def top_donors_svg(receiver_id):
    # data = [("Anonymous", anonymous_tip_total(receiver_id))] + top_donors_total(receiver_id)
    data = [("a", 1), ("b", 11), ("c", 111), ("d", 1111), ("e", 11111)]

    dwg = svgwrite.Drawing()
    paragraph = dwg.add(dwg.g(font_size=14))

    ystart = 20
    yincr = 20
    xstart = 10
    xincr = 80
    for name, amt in data:
        paragraph.add(dwg.text(name, insert=(xstart, ystart)))
        paragraph.add(dwg.text("{}".format(amt), insert=(xstart+xincr, ystart)))
        ystart += yincr

    return send_file(io.BytesIO(dwg.tostring().encode('utf-8')), mimetype='image/svg+xml')


@blueprint.route('/', defaults={'path': ''})
@blueprint.route('/<path:path>')
def index(path):
    if current_app.config.get('ENV') == 'development':
        return 'Development mode frontend should be accessed via webpack-dev-server'
    return current_app.send_static_file('index.html')
