from rest_framework.throttling import AnonRateThrottle


class ContactMessageRateThrottle(AnonRateThrottle):
    scope = 'contact_message'


class PartnerApplicationRateThrottle(AnonRateThrottle):
    scope = 'contact_message'
