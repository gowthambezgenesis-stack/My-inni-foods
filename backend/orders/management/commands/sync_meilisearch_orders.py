from django.core.management.base import BaseCommand

from orders.meilisearch_search import meilisearch_enabled, sync_all_orders


class Command(BaseCommand):
    help = 'Sync all orders into the Meilisearch index for admin search.'

    def handle(self, *args, **options):
        if not meilisearch_enabled():
            self.stderr.write(self.style.ERROR('MEILISEARCH_URL is not configured.'))
            return

        count = sync_all_orders()
        self.stdout.write(self.style.SUCCESS(f'Synced {count} orders to Meilisearch.'))
