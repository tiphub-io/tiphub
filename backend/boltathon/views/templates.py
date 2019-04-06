from flask import Blueprint, session, request
from boltathon.models.user import site_user, user_lnd
import rpc_pb2 as ln
import rpc_pb2_grpc as lnrpc
import grpc

blueprint = Blueprint("templates", __name__, url_prefix="/")

site_user = dict()
user_lnd = dict()

@blueprint.route('/')
def hello_world():
    return '<a href="/oauth/github/login">Login using GitHub</a>'

@blueprint.route('/users/<uuid:user_id>', methods=['GET', 'POST'])
def register_lnd(user_id):
    if request.method == "POST":
        if 'user_id' in session and session['user_id'] == user_id:
            print("register_lnd: authorized user session, got form: {}".format(request.form))
            macaroon = request.form['macaroon']
            grpc_url = request.form['grpc_url']
            print(request.files['tls_cert'])

            user_lnd[user_id] = (macaroon, grpc_url, request.files['tls_cert'].read())
            return 'You\'re done. Direct your donators <a href="{}">here</a>'.format(url_for("new_invoice", user_id=user_id))
        return "You are not logged in."
    return '''
        <form method=post enctype=multipart/form-data>
            <p>Macaroon (in hex):<br>
            <input type=text name=macaroon>
            <p>gRPC URL:<br>
            <input type=text name=grpc_url>
            <p>TLS cert:<br>
            <input type=file name=tls_cert>
            <p><input type=submit value=Login>
        </form>
    '''

@blueprint.route('/users/<uuid:user_id>/new_invoice')
def new_invoice(user_id):
    if 'user_id' in session and session['user_id'] == user_id:
        if user_id in user_lnd:
            macaroon, grpc_url, tls_cert = user_lnd[user_id]
            creds = grpc.ssl_channel_credentials(tls_cert)
            channel = grpc.secure_channel(grpc_url, creds)
            stub = lnrpc.LightningStub(channel)
            grpc_response = stub.AddInvoice(ln.Invoice(), metadata=[('macaroon', macaroon)])
            return '<a href="lightning:{}">Pay with Lightning</a>'.format(grpc_response.payment_request)
        else:
            raise hell
    else:
        raise hell
