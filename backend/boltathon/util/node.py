from boltathon.util.lnaddr import lndecode
from boltathon.util.errors import RequestError
import rpc_pb2 as ln
import rpc_pb2_grpc as lnrpc
import grpc
from base64 import b64decode

def make_invoice(node_url: str, macaroon: str, cert: str):
  stub = get_stub(node_url, macaroon, cert)
  return stub.AddInvoice(ln.Invoice(), timeout=10)

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
