import rpc_pb2 as ln
import rpc_pb2_grpc as lnrpc
import grpc
from time import time
from base64 import b64decode
from boltathon.extensions import db
from boltathon.util.lnaddr import lndecode
from boltathon.util.errors import RequestError

EXPIRY_SECONDS = 300

def make_invoice(node_url: str, macaroon: str, cert: str):
  stub = get_stub(node_url, macaroon, cert)
  return stub.AddInvoice(ln.Invoice(expiry=EXPIRY_SECONDS), timeout=10)

def watch_and_update_tip_invoice(app, tip, invoice):
  expiration = time() + EXPIRY_SECONDS
  stub = get_stub(tip.recipient.node_url, tip.recipient.macaroon, tip.recipient.cert)
  request = ln.InvoiceSubscription(add_index=invoice.add_index)
  for inv in stub.SubscribeInvoices(request):
    # If the invoice we're watching has expired anyway, break out
    if time() > expiration:
      break

    # If it's our invoice that's been paid, mark it as such and break out
    if inv.r_hash.hex() == invoice.r_hash.hex() and hasattr(inv, 'amt_paid_sat') and inv.amt_paid_sat:
      with app.app_context():
        local_tip = db.session.merge(tip)
        local_tip.confirm(inv.amt_paid_sat)
        db.session.commit()
      break

def get_pubkey_from_credentials(node_url: str, macaroon: str, cert: str):
  try:
    payment_request = make_invoice(node_url, macaroon, cert).payment_request
    decoded = lndecode(payment_request)
    if not payment_request or not decoded.pubkey:
      raise RequestError(code=400, message='Invalid node credentials')
  except:
    raise RequestError(code=400, message='Invalid node credentials')
  return decoded.pubkey.serialize().hex()

def lookup_invoice(rhash: str, node_url: str, macaroon: str, cert: str):
  stub = get_stub(node_url, macaroon, cert)
  request = ln.PaymentHash(r_hash_str=rhash)
  return stub.LookupInvoice(request, timeout=10)

def get_stub(node_url: str, macaroon: str, cert: str):
  def metadata_callback(context, callback):
    # for more info see grpc docs
    callback([('macaroon', macaroon)], None)

  # build ssl credentials using the cert the same as before
  cert_creds = grpc.ssl_channel_credentials(b64decode(cert))

  # now build meta data credentials
  auth_creds = grpc.metadata_call_credentials(metadata_callback)

  # combine the cert credentials and the macaroon auth credentials
  # such that every call is properly encrypted and authenticated
  combined_creds = grpc.composite_channel_credentials(cert_creds, auth_creds)

  # finally pass in the combined credentials when creating a channel
  channel = grpc.secure_channel(node_url, combined_creds)
  return lnrpc.LightningStub(channel)
