# Untitled Boltathon Project

Send sats to your favorite github repos! Or to this one:

<a target="_blank" rel="noopener noreferrer" href="https://boltathon.herokuapp.com/user/1466052541/tip?site=github">
  <img src="https://boltathon.herokuapp.com//static/images/tip-button-orange.png" alt="Tip wbobeirne on TipHub" height="60">
  <br />
  My pubkey starts with <code>02458b08</code>
</a>

## Development

First setup your environment variables, copy `.env.example` into a file named `.env`. Review each one and follow the instructions for the ones that need input.

To start the backend:
* `cd backend`
* Setup virtualenv (recommended, not required)
  * `virtualenv -p python3 venv` 
  * `source venv/bin/activate`
* `pip install -r requirements.txt`
* `flask db upgrade`
* `FLASK_APP=app.py FLASK_ENV=development flask run`

To start the frontend:
* `cd frontend`
* `yarn && yarn dev`

## Production

* Build the frontend with 'yarn && yarn build'
* Run `FLASK_APP=app.py FLASK_ENV=production flask run`

## Deploy

This app was built to deploy on heroku by doing the following:

* Create a new heroku app and link it to the repo
* Setup your environment variables based on `.env.example`
* Provision a PostgreSQL database addon
* Add the [subdir buildpack](https://elements.heroku.com/buildpacks/pagedraw/heroku-buildpack-select-subdir)
  * `heroku buildpacks:set https://github.com/negativetwelve/heroku-buildpack-subdir`
* `git push heroku master`
