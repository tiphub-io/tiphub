import uuid

# Flask
from flask import Flask, session, redirect, url_for, request
from authlib.flask.client import OAuth
# use loginpass to make OAuth connection simpler
from loginpass import create_flask_blueprint, GitHub

# LN
import rpc_pb2 as ln
import rpc_pb2_grpc as lnrpc
import grpc
import os

os.environ["GRPC_SSL_CIPHER_SUITES"] = 'HIGH+ECDSA'

app = Flask(__name__)
app.config.from_object('boltathon.settings')
app.secret_key = b"\x83$b\xad\x06&\x89\xeb)'\x85R\x92\x8bK\x9d"
oauth = OAuth(app)

site_user = dict()
user_lnd = dict()

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

        redirect_loc = url_for('register_lnd', user_id=user_id)
        print("handle_authorize: redirecting to: {}".format(redirect_loc))
        return redirect(redirect_loc)
    raise hell

github_bp = create_flask_blueprint(GitHub, oauth, handle_authorize)
app.register_blueprint(github_bp, url_prefix='/github')

@app.route('/users/<uuid:user_id>', methods=['GET', 'POST'])
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

@app.route('/users/<uuid:user_id>/new_invoice')
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


@app.route('/')
def hello_world():
    return '<a href="/github/login">Login using GitHub</a>'
