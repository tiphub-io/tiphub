import os
from boltathon.app import create_app

os.environ["GRPC_SSL_CIPHER_SUITES"] = 'HIGH+ECDSA'

app = create_app()
