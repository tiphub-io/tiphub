# Untitled Boltathon Project

Send sats to your favorite github repos!

## Development

First setup your environment variables, copy `.env.example` into a file named `.env`. Review each one and follow the instructions for the ones that need input.

To start the backend:
* `cd backend`
* Setup virtualenv (recommended, not required)
  * `virtualenv -p python3 venv` 
  * `source venv/bin/activate`
* `pip install -r requirements.txt`
* `FLASK_APP=app.py FLASK_ENV=development flask run`

To start the frontend:
* `cd frontend`
* `yarn && yarn dev`

## Production

TBD
