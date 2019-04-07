from boltathon.util.lnaddr import lndecode
from boltathon.util.errors import RequestError
import rpc_pb2 as ln
import rpc_pb2_grpc as lnrpc
import grpc
from base64 import b64decode

def get_invoice(node_url: str, macaroon: str, cert: str):
  creds = grpc.ssl_channel_credentials(b64decode(cert))
  channel = grpc.secure_channel(node_url, creds)
  stub = lnrpc.LightningStub(channel)
  return stub.AddInvoice(ln.Invoice(), metadata=[('macaroon', macaroon)])

def get_pubkey_from_credentials(node_url: str, macaroon: str, cert: str):
  try:
    payment_request = get_invoice(node_url, macaroon, cert).payment_request
    decoded = lndecode(payment_request)
    if not payment_request or not decoded.pubkey:
      raise RequestError(code=400, message='Invalid node credentials')
  except:
    raise RequestError(code=400, message='Invalid node credentials')
  return decoded.pubkey.serialize().hex()
