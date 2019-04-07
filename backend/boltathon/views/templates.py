from flask import Blueprint, session, request, current_app, url_for, g
from boltathon.models.user import User
from boltathon.extensions import db
from boltathon.util.auth import requires_auth
from boltathon.util.errors import RequestError
from boltathon.util.node import get_invoice, get_pubkey_from_credentials

blueprint = Blueprint("templates", __name__, url_prefix="/")

@blueprint.route('/')
def index():
    if current_app.config.get('ENV') == 'development':
        return 'Development mode frontend should be accessed via webpack-dev-server'
    return current_app.send_static_file('index.html')


@blueprint.route('/users/<user_id>', methods=['GET', 'POST'])
@requires_auth
def register_lnd(user_id):
    if request.method == "POST":
        print("register_lnd: authorized user session, got form: {}".format(request.form))
        macaroon = request.form['macaroon']
        grpc_url = request.form['grpc_url']
        cert = request.form['tls_cert']
        cert = request.form['tls_cert']

        pubkey = get_pubkey_from_credentials(grpc_url, macaroon, cert)

        g.current_user.node_url = grpc_url
        g.current_user.macaroon = macaroon
        g.current_user.cert = cert
        g.current_user.pubkey = pubkey
        g.current_user.email = request.form['email']
        db.session.add(g.current_user)
        db.session.commit()

        return 'You\'re done. Direct your donators <a href="{}">here</a>'.format(url_for("templates.new_invoice", user_id=user_id))
    else:
        return '''
            <form method=post enctype=multipart/form-data>
                <p>gRPC URL:<br>
                <input type=text name="grpc_url" value="{}">
                <p>Macaroon (in hex):<br>
                <input type=text name="macaroon" value="{}">
                <p>TLS cert (base64):<br>
                <input type=text name="tls_cert" value="{}">
                <p>Email (optional):<br>
                <input type=text name="email" value="{}">
                <p>Pubkey (filled in if node is set):<br>
                <input type=text value="{}" disabled>
                <p><input type=submit value=Login>
            </form>
        '''.format(
            g.current_user.node_url or '',
            g.current_user.macaroon or '',
            g.current_user.cert or '',
            g.current_user.email or '',
            g.current_user.pubkey or '',
        )


@blueprint.route('/users/<user_id>/new_invoice')
def new_invoice(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        raise RequestError(code=404, message="No user with that ID")

    invoice = get_invoice(user.macaroon, user.node_url, user.cert)
    return '<a href="lightning:{}">Pay with Lightning</a>'.format(invoice.payment_request)
