from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from .models import Order
from .serializers import resolve_order_customer_name
from .utils import get_order_contact_email, get_order_display_status


def _currency(value) -> str:
    return f'Rs. {value:,.2f}'


def build_order_invoice_pdf(order: Order) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title=f'Invoice {order.order_number}',
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'InvoiceTitle',
        parent=styles['Heading1'],
        fontSize=20,
        spaceAfter=8,
    )
    muted_style = ParagraphStyle(
        'Muted',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.grey,
        spaceAfter=4,
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=6,
    )

    story = [
        Paragraph('Inni Products', title_style),
        Paragraph(f'Invoice for order {order.order_number}', muted_style),
        Spacer(1, 8),
    ]

    customer_name = resolve_order_customer_name(order)
    customer_email = get_order_contact_email(order) or '—'
    address = order.shipping_address or {}

    story.extend([
        Paragraph(f'<b>Order ID:</b> {order.order_number}', body_style),
        Paragraph(f'<b>Customer:</b> {customer_name}', body_style),
        Paragraph(f'<b>Email:</b> {customer_email}', body_style),
        Paragraph(
            '<b>Shipping address:</b> '
            f'{address.get("address", "")}, {address.get("city", "")}, '
            f'{address.get("state", "")} {address.get("zip", "")}',
            body_style,
        ),
        Paragraph(f'<b>Order date:</b> {order.created_at.strftime("%d %b %Y, %I:%M %p")}', body_style),
        Paragraph(f'<b>Status:</b> {get_order_display_status(order)}', body_style),
        Paragraph(f'<b>Payment:</b> {order.payment_status.title()}', body_style),
        Spacer(1, 12),
    ])

    rows = [['Item', 'Qty', 'Price', 'Total']]
    for item in order.items.all():
        line_total = item.price_at_time * item.quantity
        rows.append([
            item.product_name,
            str(item.quantity),
            _currency(item.price_at_time),
            _currency(line_total),
        ])

    rows.append(['', '', 'Grand Total', _currency(order.total_amount)])

    table = Table(rows, colWidths=[90 * mm, 18 * mm, 28 * mm, 28 * mm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#111111')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -2), 0.25, colors.lightgrey),
        ('LINEABOVE', (2, -1), (-1, -1), 1, colors.black),
        ('FONTNAME', (2, -1), (-1, -1), 'Helvetica-Bold'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(table)

    doc.build(story)
    return buffer.getvalue()
