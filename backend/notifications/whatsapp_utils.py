import os
from twilio.rest import Client

def send_whatsapp_invoice(to_number, order_id, invoice_url, customer_name):
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    from_number = os.getenv('TWILIO_WHATSAPP_NUMBER')
    
    if not all([account_sid, auth_token, from_number]):
        print("WhatsApp credentials missing in .env file.")
        return False

    client = Client(account_sid, auth_token)
    
    # Strip prefixes to prevent duplicate formatting bugs
    clean_number = str(to_number).strip().replace("whatsapp:", "")
    formatted_to = f"whatsapp:{clean_number}"

    # Pre-approved Twilio Sandbox Template:
    # "Your {{1}} order of {{2}} has shipped and should be delivered on {{3}}. Details: {{4}}"
    sandbox_template_body = (
        f"Your Inni-Foods order of {order_id} has shipped and should be delivered on "
        f"today. Details: {invoice_url}"
    )

    try:
        message = client.messages.create(
            from_=from_number,
            body=sandbox_template_body,
            to=formatted_to
        )
        print(f"WhatsApp sent successfully! SID: {message.sid}")
        return True
    except Exception as e:
        print(f"WhatsApp failed: {str(e)}")
        return False