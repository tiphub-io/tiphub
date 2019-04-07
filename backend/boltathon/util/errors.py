from flask import jsonify

class RequestError(Exception):
  def __init__(self, message, code=400):
    Exception.__init__(self)
    self.message = message
    self.code = code

  def to_dict(self):
    return {
      'message': self.message,
      'code': self.code,
    }
