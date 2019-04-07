from flask import Blueprint, g, jsonify
from webargs import fields
from webargs.flaskparser import use_args
from boltathon.extensions import db
from boltathon.util.auth import requires_auth
from boltathon.util.node import get_pubkey_from_credentials
from boltathon.util.errors import RequestError
from boltathon.models.user import User, self_user_schema, public_user_schema

blueprint = Blueprint("api", __name__, url_prefix="/api")


@blueprint.route('/users/me', methods=['GET'])
@requires_auth
def get_self_user():
  return jsonify(self_user_schema.dump(g.current_user))


@blueprint.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
  user = User.query.filter_by(id=user_id).first()
  if not user:
    raise RequestError(code=404, message='No user with that ID')
  return jsonify(public_user_schema.dump(user))


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
  

