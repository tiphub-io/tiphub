from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from python_http_client import HTTPError
from boltathon.util import frontend_url
from boltathon.settings import SENDGRID_API_KEY, SENDGRID_DEFAULT_FROM, SENDGRID_DEFAULT_FROMNAME, UI
from flask import render_template, Markup, current_app


default_template_args = {
    'home_url': frontend_url('/'),
    'account_url': frontend_url('/user/me'),
    'unsubscribe_url': frontend_url('/user/me?tab=settings')
}


def tip_received_info(email_args):
    return {
        'subject': 'You just got tipped!',
        'title': 'You got a Tip!',
        'preview': 'Woohoo, somebody just tipped you!',
    }


def tip_error_info(email_args):
    return {
        'subject': 'We had trouble contacting your node for a tip',
        'title': 'Tip Error',
        'preview': 'We recently tried to generate a tip invoice from your node, but encountered an error.'
    }


get_info_lookup = {
    'tip_received': tip_received_info,
    'tip_error': tip_error_info
}


def generate_email(user, type, email_args):
    info = get_info_lookup[type](email_args)
    body_text = render_template(
        'emails/%s.txt' % (type),
        args=email_args,
        UI=UI,
    )
    body_html = render_template(
        'emails/%s.html' % (type),
        args=email_args,
        UI=UI,
    )

    template_args = {**default_template_args}

    html = render_template(
        'emails/template.html',
        args={
            **template_args,
            **info,
            'body': Markup(body_html),
        },
        UI=UI,
    )
    text = render_template(
        'emails/template.txt',
        args={
            **template_args,
            **info,
            'body': body_text,
        },
        UI=UI,
    )

    return {
        'info': info,
        'html': html,
        'text': text
    }


def send_email(user, type, email_args):
    if current_app and current_app.config.get("TESTING"):
        return

    if not user or not user.email:
        return

    if not SENDGRID_API_KEY:
        current_app.logger.warn('SENDGRID_API_KEY not set, skipping email')
        return

    try:
        email = generate_email(user, type, email_args)
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        print(SENDGRID_DEFAULT_FROM)
        print(user.email)
        mail = Mail(
            from_email=SENDGRID_DEFAULT_FROM,
            to_emails=user.email,
            subject=email['info']['subject'],
            plain_text_content=email['text'],
            html_content=email['html'],
        )
        res = sg.send(mail)
        current_app.logger.debug('Just sent an email to %s of type %s, response code: %s' % (user.email, type, res.status_code))
    except HTTPError as e:
        current_app.logger.info('An HTTP error occured while sending an email to %s - %s: %s' % (user.email, e.__class__.__name__, e))
        current_app.logger.error(e.body)
    except Exception as e:
        current_app.logger.info('An unknown error occured while sending an email to %s - %s: %s' % (user.email, e.__class__.__name__, e))
        current_app.logger.error(e)

# Sends an email once and only once this session of the app. This is pretty
# low-stakes, so it's OK that it rests on restart. Mostly meant to avoid spam.
send_once_map = {}

def send_email_once(user, type, email_args, extra_key='default'):
    if not user or not user.email:
        return

    key = '%s - %s - %s' % (user.id, type, extra_key)

    if send_once_map.get(key):
        current_app.logger.debug('Already sent with key `%s`' % (key))
        return

    send_once_map[key] = True
    return send_email(user, type, email_args)
