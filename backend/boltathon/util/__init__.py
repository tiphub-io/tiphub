from boltathon.settings import FRONTEND_URL
import random

def frontend_url(path):
  return FRONTEND_URL + path

def gen_random_id(model):
    min_id = 100000
    max_id = pow(2, 31) - 1
    random_id = random.randint(min_id, max_id)

    # If it already exists, generate a new one (recursively)
    existing = model.query.filter_by(id=random_id).first()
    if existing:
        random_id = gen_random_id(model)

    return random_id
