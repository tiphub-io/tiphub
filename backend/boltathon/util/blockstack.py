import requests
from jose import jwt
from flask import current_app
from boltathon.util.errors import RequestError

# Given a Blockstack private key, validate that it was signed by the same
# key as owns a username
def validate_blockstack_auth(id, username, token):
    try:
        # Match up data with arguments
        token = jwt.decode(token, [], options={ 'verify_signature': False })
        if username != token.get('username'):
            return False
        if id not in token.get('profile_url'):
            return False

        # Match up data with Blockstack's atlas node
        res = requests.get(f'https://core.blockstack.org/v1/names/{username}')
        res = res.json()
        if res.get('address') != id:
            return False

        return True
    except Exception as e:
        print(e)
        current_app.logger.error(f'Could not lookup username {username} from blockstack.org: {e}')
        raise RequestError(code=500, message='Failed to lookup Blockstack identity')
