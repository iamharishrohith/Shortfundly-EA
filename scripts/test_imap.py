import imaplib, email

user = 'harish.shortfundly@gmail.com'
password = 'kegp mpbw oldw jhqw'

try:
    mail = imaplib.IMAP4_SSL('imap.gmail.com')
    mail.login(user, password)
    print('IMAP Login successful!')
    mail.select('"[Gmail]/Sent Mail"')
    status, messages = mail.search(None, 'ALL')
    msg_ids = messages[0].split()
    if msg_ids:
        latest = msg_ids[-1]
        status, data = mail.fetch(latest, '(RFC822)')
        raw_email = data[0][1]
        msg = email.message_from_bytes(raw_email)
        print('Subject:', msg['Subject'])
        print('To:', msg['To'])
        print('Date:', msg['Date'])
    mail.logout()
except Exception as e:
    print('IMAP Error:', e)
