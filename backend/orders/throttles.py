from rest_framework.throttling import AnonRateThrottle


class TrackOrderRateThrottle(AnonRateThrottle):
    scope = 'track_order'


class TrackInvoiceRateThrottle(AnonRateThrottle):
    scope = 'track_invoice'
