import os
from dotenv import load_dotenv

load_dotenv()

ENV = os.getenv('FLASK_ENV', default='production')
DEBUG = ENV == 'development'
SECRET_KEY = os.getenv('SECRET_KEY')
FRONTEND_URL = '' if ENV == 'production' else os.getenv('FRONTEND_URL')

SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
SQLALCHEMY_ECHO = False  # True will print queries to log
SQLALCHEMY_TRACK_MODIFICATIONS = False

GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
GITHUB_CLIENT_SECRET = os.getenv('GITHUB_CLIENT_SECRET')
GITLAB_CLIENT_ID = os.getenv('GITLAB_CLIENT_ID')
GITLAB_CLIENT_SECRET = os.getenv('GITLAB_CLIENT_SECRET')

SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
SENDGRID_DEFAULT_FROM = 'noreply@tiphub.io'
SENDGRID_DEFAULT_FROMNAME = 'TipHub'

UI = {
    'NAME': 'TipHub',
    'PRIMARY': '#E85420',
    'SECONDARY': '#333333'
}
