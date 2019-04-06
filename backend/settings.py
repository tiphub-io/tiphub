import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

ENV = os.getenv("FLASK_ENV", default="production")
DEBUG = ENV == "development"
SECRET_KEY = os.getenv('SECRET_KEY')
GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
GITHUB_CLIENT_SECRET = os.getenv('GITHUB_CLIENT_SECRET')
