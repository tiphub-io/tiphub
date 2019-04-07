# Flask
import traceback
from flask import Flask, session, redirect, url_for, request, jsonify
from flask_cors import CORS
from boltathon.extensions import oauth, db, migrate, ma
from boltathon.util.errors import RequestError
from boltathon import views
# use loginpass to make OAuth connection simpler

def create_app(config_objects=['boltathon.settings']):
  app = Flask(
    __name__,
    static_folder='static',
    static_url_path='/static'
  )
  for config in config_objects:
    app.config.from_object(config)

  # Extensions
  oauth.init_app(app)
  db.init_app(app)
  migrate.init_app(app, db)
  ma.init_app(app)
  CORS(app, supports_credentials=True)

  # Blueprints
  app.register_blueprint(views.api.blueprint)
  app.register_blueprint(views.templates.blueprint)
  app.register_blueprint(views.oauth.github_blueprint, url_prefix='/oauth/github')
  app.register_blueprint(views.oauth.gitlab_blueprint, url_prefix='/oauth/gitlab')

  # Error handling
  @app.errorhandler(422)
  @app.errorhandler(400)
  def handle_error(err):
    headers = err.data.get("headers", None)
    messages = err.data.get("messages", "Invalid request.")
    error_message = "Something was wrong with your request"
    if type(messages) == dict:
      if 'json' in messages:
        error_message = messages['json'][0]
      else:
        app.logger.warn(f"Unexpected error occurred: {messages}")
    if headers:
      return jsonify({"error": error_message}), err.code, headers
    else:
      return jsonify({"error": error_message}), err.code

  @app.errorhandler(404)
  def handle_notfound_error(err):
    error_message = "Unknown route '{} {}'".format(request.method, request.path)
    return jsonify({"error": error_message}), 404

  @app.errorhandler(RequestError)
  def handle_request_error(err):
    return jsonify({"message": err.message}), err.code

  @app.errorhandler(Exception)
  def handle_exception(err):
      app.logger.debug(traceback.format_exc())
      app.logger.debug("Uncaught exception at {} {}, see above for traceback".format(request.method, request.path))
      return jsonify({"message": "Something went wrong"}), 500

  return app
