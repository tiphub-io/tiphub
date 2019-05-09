from flask import Blueprint, g, jsonify, session, current_app
from webargs import fields, validate
from webargs.flaskparser import use_args
from grpc import RpcError
from boltathon.extensions import db
from boltathon.util import frontend_url
from boltathon.util.auth import requires_auth, get_authed_user
from boltathon.util.node import get_pubkey_from_credentials, make_invoice, lookup_invoice
from boltathon.util.errors import RequestError
from boltathon.util.mail import send_email_once
from boltathon.util.blockstack import validate_blockstack_auth
from boltathon.models.user import User, self_user_schema, public_user_schema, public_users_schema
from boltathon.models.connection import Connection, public_connections_schema
from boltathon.models.tip import Tip, tip_schema, tips_schema

blueprint = Blueprint("api", __name__, url_prefix="/api")


@blueprint.route('/users/me', methods=['GET'])
@requires_auth
def get_self_user():
  return jsonify(self_user_schema.dump(g.current_user))



@blueprint.route('/users/<user_id>/tips', methods=['GET'])
@use_args({
  'user_id': fields.Integer(location='view_args', required=True),
  'page': fields.Integer(required=False, missing=0, validate=validate.Range(0)),
  'limit': fields.Integer(required=False, missing=30, validate=validate.Range(1, 30)),
})
def get_user_tips(args, **kwargs):
  user = User.query.get(args['user_id'])
  if not user:
    raise RequestError(code=404, message='No user with that ID')

  tips = Tip.query \
    .filter_by(receiver_id=user.id) \
    .filter(Tip.amount != None ) \
    .filter(Tip.amount != 0) \
    .paginate(
      page=args['page'],
      per_page=args['limit'],
      error_out=False)
  return jsonify({
    'user': public_user_schema.dump(user),
    'tips': tips_schema.dump(tips.items),
    'pagination': {
      'page': tips.page,
      'pages': tips.pages,
    },
  })


@blueprint.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
  user = User.query.get(user_id)
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



@blueprint.route('/users/<user_id>/tip', methods=['POST'])
@use_args({
  'user_id': fields.Integer(location='view_args', required=True),
  'sender': fields.Str(required=False, missing=None),
  'message': fields.Str(required=False, missing=None),
})
def post_invoice(args, user_id, **kwargs):
  user = User.query.get(user_id)
  if not user:
    raise RequestError(code=404, message='No user with that ID')

  err = None

  try:
    invoice = make_invoice(user.node_url, user.macaroon, user.cert)
    tip = Tip(
      receiver_id=args.get('user_id'),
      sender=args.get('sender'),
      message=args.get('message'),
      payment_request=invoice.payment_request,
      rhash=invoice.r_hash.hex(),
    )
    db.session.add(tip)
    db.session.commit()
    return jsonify(tip_schema.dump(tip))
  except RequestError as e:
    err = 'Request error: {}'.format(e.message)
  except RpcError as e:
    err = 'RPC error: {}'.format(e.details())
  except Exception as e:
    err = 'Unknown exception: {}'.format(str(e))
    current_app.logger.info('Unknown error encountered while trying to generate an invoice for user {}'.format(user.id))
    current_app.logger.error(e)

  if err:
    send_email_once(user, 'tip_error', {
      'error': err,
      'config_url': frontend_url('/user/me?tab=config'),
      'support_url': 'https://github.com/tiphub-io/tiphub/issues',
    }, err)
    raise RequestError(code=500, message='Failed to generate a tip invoice, their node may be offline or otherwise inaccessible')


@blueprint.route('/users/search/<query>', methods=['GET'])
def search_users(query):
  connections = Connection.search_usernames(query)
  return jsonify(public_connections_schema.dump(connections))


@blueprint.route('/tips/<tip_id>', methods=['GET'])
def get_tip(tip_id):
  tip = Tip.query.get(tip_id)
  if not tip:
    raise RequestError(code=404, message='No tip with that ID')

  # Check with node if it's been paid
  if not tip.amount:
    invoice = lookup_invoice(
      tip.rhash,
      tip.recipient.node_url,
      tip.recipient.macaroon,
      tip.recipient.cert,
    )
    if hasattr(invoice, 'amt_paid_sat') and invoice.amt_paid_sat:
      tip.confirm(invoice.amt_paid_sat)
      db.session.commit()

  return jsonify(tip_schema.dump(tip))


@blueprint.route('/auth/blockstack', methods=['POST'])
@use_args({
  'id': fields.Str(required=True),
  'username': fields.Str(required=True),
  'token': fields.Str(required=True),
})
def blockstack_auth(args):
  # Assert that they generated a valid token
  if not validate_blockstack_auth(args.get('id'), args.get('username'), args.get('token')):
    raise RequestError(code=400, message='Invalid Blockstack token provided')

  # Find or create a new user and add the connection
  user = Connection.get_user_by_connection(
      site='blockstack',
      site_id=args.get('id'),
  )
  if not user:
    user = get_authed_user()
    if not user:
      user = User()
    connection = Connection(
        userid=user.id,
        site='blockstack',
        site_id=args.get('id'),
        site_username=args.get('username'),
    )
    user.connections.append(connection)
    db.session.add(user)
    db.session.add(connection)
    db.session.commit()
  
  # Log them in if they weren't before
  session['user_id'] = user.id

  return jsonify(self_user_schema.dump(user))


@blueprint.route('/auth/<site>', methods=['DELETE'])
@requires_auth
def delete_auth(site):
  conn = [c for c in g.current_user.connections if c.site == site]

  if not conn:
    raise RequestError(code=400, message="You do not have a connection with {}".format(site))

  # Delete whole account if last connection, or just connection otherwise
  if len(g.current_user.connections) == 1:
    db.session.delete(g.current_user)
  else:
    db.session.delete(conn[0])

  db.session.commit()
  return jsonify({ "success": True })
