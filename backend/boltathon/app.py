# Flask
from flask import Flask, session, redirect, url_for, request
from boltathon.extensions import oauth
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

  # Blueprints
  app.register_blueprint(views.api.blueprint)
  app.register_blueprint(views.templates.blueprint)
  app.register_blueprint(views.oauth.github_blueprint, url_prefix='/oauth/github')
  app.register_blueprint(views.oauth.gitlab_blueprint, url_prefix='/oauth/gitlab')

  return app
