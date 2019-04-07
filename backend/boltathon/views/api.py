from flask import Blueprint, g, jsonify
from webargs import fields
from webargs.flaskparser import use_args
from boltathon.extensions import db
from boltathon.util.auth import requires_auth
from boltathon.util.node import get_pubkey_from_credentials
from boltathon.models.user import self_user_schema

blueprint = Blueprint("api", __name__, url_prefix="/api")

@blueprint.route('/users/<user_id>', methods=['PUT'])
@requires_auth
@use_args({
  'user_id': fields.Integer(location='view_args', required=True),
  'node_url': fields.Str(required=False, missing=None),
  'macaroon': fields.Str(required=False, missing=None),
  'cert': fields.Str(required=False, missing=None),
  'email': fields.Str(required=False, missing=None)
})
def update_user(args, **kwargs):
  for key in args:
    if args.get(key) != None:
      setattr(g.current_user, key, args[key])
  
  print(g.current_user.node_url)
  print(g.current_user.macaroon)
  print(g.current_user.cert)
  pubkey = get_pubkey_from_credentials(
    g.current_user.node_url,
    g.current_user.macaroon,
    g.current_user.cert,
  )
  g.current_user.pubkey = pubkey

  db.session.add(g.current_user)
  db.session.commit()

  return jsonify(self_user_schema.dump(g.current_user))
  

