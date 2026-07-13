from decimal import Decimal, ROUND_HALF_UP
from io import BytesIO
import os
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from .models import Order
from .serializers import resolve_order_customer_name

INVOICE_TERMS = 'Due on Receipt'
PLACE_OF_SUPPLY = 'Karnataka(29)'
BLANK_ITEM_ROWS = 4

INVOICE_FONT_REGULAR = 'Helvetica'
INVOICE_FONT_BOLD = 'Helvetica-Bold'
RUPEE_SYMBOL = 'Rs. '
_INVOICE_FONTS_READY = False

COMPANY = {
    'name': 'Oakroad Ventures Private Limited',
    'location': 'Karnataka, India',
    'gstin': '29AAECO6061C1ZJ',
    'email': 'vasanthamachaih@oakroad.industries',
}

BORDER_COLOR = colors.HexColor('#333333')
GRID_COLOR = colors.HexColor('#cccccc')
HEADER_BG = colors.HexColor('#f3f3f3')
MUTED = colors.HexColor('#555555')


def _ensure_invoice_fonts() -> None:
    """Register a Unicode font so the Indian rupee sign renders in PDF output."""
    global _INVOICE_FONTS_READY, INVOICE_FONT_REGULAR, INVOICE_FONT_BOLD, RUPEE_SYMBOL
    if _INVOICE_FONTS_READY:
        return

    if 'InvoiceRegular' in pdfmetrics.getRegisteredFontNames():
        INVOICE_FONT_REGULAR = 'InvoiceRegular'
        INVOICE_FONT_BOLD = 'InvoiceBold'
        RUPEE_SYMBOL = '\u20b9'
        _INVOICE_FONTS_READY = True
        return

    font_sources: list[tuple[Path, int, int]] = [
        (Path(os.environ.get('WINDIR', r'C:\Windows')) / 'Fonts' / 'Nirmala.ttc', 0, 1),
        (Path('/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf'), -1, -1),
        (Path('/usr/share/fonts/opentype/noto/NotoSans-Regular.ttf'), -1, -1),
    ]

    for path, regular_index, bold_index in font_sources:
        if not path.exists():
            continue
        try:
            if path.suffix.lower() == '.ttc':
                pdfmetrics.registerFont(
                    TTFont('InvoiceRegular', str(path), subfontIndex=regular_index),
                )
                pdfmetrics.registerFont(
                    TTFont('InvoiceBold', str(path), subfontIndex=bold_index),
                )
            else:
                pdfmetrics.registerFont(TTFont('InvoiceRegular', str(path)))
                bold_path = path.with_name(path.name.replace('Regular', 'Bold'))
                pdfmetrics.registerFont(
                    TTFont('InvoiceBold', str(bold_path if bold_path.exists() else path)),
                )

            registerFontFamily(
                'InvoiceRegular',
                normal='InvoiceRegular',
                bold='InvoiceBold',
                italic='InvoiceRegular',
                boldItalic='InvoiceBold',
            )
            INVOICE_FONT_REGULAR = 'InvoiceRegular'
            INVOICE_FONT_BOLD = 'InvoiceBold'
            RUPEE_SYMBOL = '\u20b9'
            break
        except Exception:
            continue

    _INVOICE_FONTS_READY = True


def _money(value) -> str:
    return f'{Decimal(value):,.2f}'


def _inr(value) -> str:
    _ensure_invoice_fonts()
    return f'{RUPEE_SYMBOL}{_money(value)}'


def _quantize(value: Decimal) -> Decimal:
    return value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def _int_to_words_indian(number: int) -> str:
    ones = [
        'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
        'Seventeen', 'Eighteen', 'Nineteen',
    ]
    tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

    def under_thousand(n: int) -> str:
        if n == 0:
            return ''
        if n < 20:
            return ones[n]
        if n < 100:
            return f'{tens[n // 10]}{" " + ones[n % 10] if n % 10 else ""}'.strip()
        return f'{ones[n // 100]} Hundred{" " + under_thousand(n % 100) if n % 100 else ""}'.strip()

    if number == 0:
        return 'Zero'

    parts = []
    crore = number // 10_000_000
    number %= 10_000_000
    lakh = number // 100_000
    number %= 100_000
    thousand = number // 1000
    number %= 1000

    if crore:
        parts.append(f'{under_thousand(crore)} Crore')
    if lakh:
        parts.append(f'{under_thousand(lakh)} Lakh')
    if thousand:
        parts.append(f'{under_thousand(thousand)} Thousand')
    if number:
        parts.append(under_thousand(number))

    return ' '.join(parts)


def _amount_in_words(amount: Decimal) -> str:
    rupees = int(amount)
    paise = int((_quantize(amount) - Decimal(rupees)) * 100)
    words = _int_to_words_indian(rupees)
    if paise:
        return f'Indian Rupee {words} and {_int_to_words_indian(paise)} Paise Only'
    return f'Indian Rupee {words} Only'


def _place_of_supply(_address: dict) -> str:
    return PLACE_OF_SUPPLY


def _balance_due_display(order: Order, total: Decimal) -> str:
    if order.payment_status == Order.PaymentStatus.PAID:
        return 'Paid'
    return _inr(total)


def _invoice_lines(order: Order) -> list[dict]:
    lines: list[dict] = []
    for item in order.items.all():
        qty = Decimal(item.quantity)
        rate = _quantize(Decimal(item.price_at_time))
        amount = _quantize(rate * qty)
        description = item.product_name
        if item.weight:
            description = f'{description} ({item.weight})'
        lines.append(
            {
                'description': description,
                'qty': qty,
                'unit': 'pcs',
                'rate': rate,
                'amount': amount,
            },
        )

    items_total = sum(Decimal(item.price_at_time) * item.quantity for item in order.items.all())
    shipping = _quantize(Decimal(order.total_amount) - items_total)
    if shipping > 0:
        lines.append(
            {
                'description': 'Shipping Charges',
                'qty': Decimal('1'),
                'unit': 'pcs',
                'rate': shipping,
                'amount': shipping,
            },
        )

    return lines


def _totals_from_lines(lines: list[dict], order: Order) -> dict:
    sub_total = _quantize(sum(line['amount'] for line in lines))
    total = _quantize(Decimal(order.total_amount))
    return {
        'sub_total': sub_total,
        'total': total,
        'balance_due': _balance_due_display(order, total),
    }


def _p(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(text.replace('\n', '<br/>'), style)


def _plain_p(text: str, style: ParagraphStyle) -> Paragraph:
    safe = (
        text.replace('&', '&amp;')
        .replace('<', '&lt;')
        .replace('>', '&gt;')
        .replace('\n', '<br/>')
    )
    return Paragraph(safe, style)


def _draw_page_frame(canvas, doc):
    canvas.saveState()
    margin = 10 * mm
    width, height = A4
    canvas.setStrokeColor(BORDER_COLOR)
    canvas.setLineWidth(0.6)
    canvas.rect(margin, margin, width - 2 * margin, height - 2 * margin, stroke=1, fill=0)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(width - margin - 3 * mm, margin + 4 * mm, str(canvas.getPageNumber()))
    canvas.restoreState()


def build_order_invoice_pdf(order: Order) -> bytes:
    _ensure_invoice_fonts()
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=14 * mm,
        leftMargin=14 * mm,
        topMargin=14 * mm,
        bottomMargin=16 * mm,
        title=f'Invoice {order.order_number}',
    )

    normal = ParagraphStyle(
        'Normal',
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.black,
    )
    bold = ParagraphStyle('Bold', parent=normal, fontName='Helvetica-Bold')
    company_name = ParagraphStyle('CompanyName', parent=bold, fontSize=11, leading=14)
    title = ParagraphStyle(
        'Title',
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=24,
        alignment=TA_RIGHT,
        textColor=colors.black,
    )
    section = ParagraphStyle(
        'Section',
        parent=bold,
        fontSize=8,
        leading=10,
        textColor=colors.black,
    )
    muted = ParagraphStyle('Muted', parent=normal, fontSize=8, textColor=MUTED)
    italic_bold = ParagraphStyle(
        'ItalicBold',
        parent=bold,
        fontSize=9,
        fontName='Helvetica-BoldOblique',
    )
    total_summary_style = ParagraphStyle(
        'TotalSummary',
        fontName=INVOICE_FONT_REGULAR,
        fontSize=10,
        leading=18,
        alignment=TA_RIGHT,
        textColor=colors.black,
    )
    item_desc_style = ParagraphStyle(
        'ItemDescription',
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.black,
    )

    customer_name = resolve_order_customer_name(order)
    address = order.shipping_address or {}
    invoice_date = order.created_at.strftime('%d/%m/%Y')
    lines = _invoice_lines(order)
    totals = _totals_from_lines(lines, order)

    header_table = Table(
        [
            [
                _p(
                    f'<b>{COMPANY["name"]}</b><br/>'
                    f'{COMPANY["location"]}<br/>'
                    f'GSTIN&nbsp;&nbsp;{COMPANY["gstin"]}<br/>'
                    f'{COMPANY["email"]}',
                    company_name,
                ),
                _p('TAX INVOICE', title),
            ],
        ],
        colWidths=[108 * mm, 68 * mm],
    )
    header_table.setStyle(
        TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]),
    )

    meta_table = Table(
        [
            [
                _p(
                    f'#&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {order.order_number}<br/>'
                    f'Invoice Date&nbsp;&nbsp;: {invoice_date}<br/>'
                    f'Terms&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {INVOICE_TERMS}<br/>'
                    f'Due Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {invoice_date}',
                    normal,
                ),
                _p(f'Place Of Supply&nbsp;&nbsp;: {_place_of_supply(address)}', normal),
            ],
        ],
        colWidths=[88 * mm, 88 * mm],
    )
    meta_table.setStyle(
        TableStyle([
            ('BOX', (0, 0), (-1, -1), 0.5, GRID_COLOR),
            ('LINEAFTER', (0, 0), (0, 0), 0.5, GRID_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]),
    )

    bill_to_bar = Table([[_p('Bill To', section)]], colWidths=[176 * mm])
    bill_to_bar.setStyle(
        TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), HEADER_BG),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]),
    )

    bill_to_name = Table([[_p(f'<b>{customer_name}</b>', normal)]], colWidths=[176 * mm])
    bill_to_name.setStyle(
        TableStyle([
            ('BOX', (0, 0), (-1, -1), 0.5, GRID_COLOR),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]),
    )

    item_rows = [
        ['#', 'Item & Description', 'HSN/SAC', 'Qty', 'Rate', 'CGST', '', 'SGST', '', 'Amount'],
        ['', '', '', '', '', '%', 'Amt', '%', 'Amt', ''],
    ]
    for index, line in enumerate(lines, start=1):
        qty_label = f'{_money(line["qty"])} {line["unit"]}'
        item_rows.append([
            str(index),
            _plain_p(line['description'], item_desc_style),
            '',  # HSN/SAC left blank
            qty_label,
            _money(line['rate']),
            '',  # CGST % blank
            '',  # CGST Amt blank
            '',  # SGST % blank
            '',  # SGST Amt blank
            _money(line['amount']),
        ])

    for _ in range(BLANK_ITEM_ROWS):
        item_rows.append(['', '', '', '', '', '', '', '', '', ''])

    items_table = Table(
        item_rows,
        colWidths=[8 * mm, 52 * mm, 14 * mm, 16 * mm, 16 * mm, 11 * mm, 14 * mm, 11 * mm, 14 * mm, 18 * mm],
        repeatRows=2,
    )
    items_table.setStyle(
        TableStyle([
            ('BACKGROUND', (0, 0), (-1, 1), HEADER_BG),
            ('FONTNAME', (0, 0), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOX', (0, 0), (-1, -1), 0.5, GRID_COLOR),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, GRID_COLOR),
            ('SPAN', (0, 0), (0, 1)),
            ('SPAN', (1, 0), (1, 1)),
            ('SPAN', (2, 0), (2, 1)),
            ('SPAN', (3, 0), (3, 1)),
            ('SPAN', (4, 0), (4, 1)),
            ('SPAN', (5, 0), (6, 0)),
            ('SPAN', (7, 0), (8, 0)),
            ('SPAN', (9, 0), (9, 1)),
            ('ALIGN', (0, 0), (-1, 1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, 1), 'MIDDLE'),
            ('VALIGN', (0, 2), (-1, -1), 'TOP'),
            ('ALIGN', (0, 2), (0, -1), 'CENTER'),
            ('ALIGN', (3, 2), (4, -1), 'RIGHT'),
            ('ALIGN', (9, 2), (9, -1), 'RIGHT'),
            ('ALIGN', (1, 2), (1, -1), 'LEFT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('RIGHTPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]),
    )

    summary_table = Table(
        [
            ['Sub Total', _money(totals['sub_total'])],
        ],
        colWidths=[36 * mm, 26 * mm],
    )
    summary_table.setStyle(
        TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), INVOICE_FONT_REGULAR),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]),
    )

    total_block = _p(
        f'<b>Total</b><br/>'
        f'{_inr(totals["total"])}<br/><br/>'
        f'<b>Balance Due</b><br/>'
        f'{totals["balance_due"]}',
        total_summary_style,
    )

    summary_wrapper = Table([[summary_table]], colWidths=[62 * mm])
    summary_wrapper.setStyle(
        TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]),
    )

    totals_panel = Table(
        [
            [summary_wrapper],
            [Spacer(1, 6)],
            [total_block],
        ],
        colWidths=[62 * mm],
    )
    totals_panel.setStyle(
        TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LINEABOVE', (0, 2), (-1, 2), 0.5, GRID_COLOR),
            ('TOPPADDING', (0, 2), (-1, 2), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]),
    )

    signature_box = Table(
        [[_p('<br/><br/>Authorized Signature', muted)]],
        colWidths=[62 * mm],
        rowHeights=[22 * mm],
    )
    signature_box.setStyle(
        TableStyle([
            ('BOX', (0, 0), (-1, -1), 0.5, GRID_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]),
    )

    footer_left = Table(
        [
            [_p('<b>Total In Words</b>', bold)],
            [_p(f'<i>{_amount_in_words(totals["total"])}</i>', italic_bold)],
            [Spacer(1, 8)],
            [_p('<b>Notes</b>', bold)],
            [_p('Thanks for your business.', normal)],
        ],
        colWidths=[98 * mm],
    )
    footer_left.setStyle(
        TableStyle([
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ]),
    )

    footer_right = Table(
        [
            [totals_panel],
            [Spacer(1, 10)],
            [signature_box],
        ],
        colWidths=[62 * mm],
    )
    footer_right.setStyle(
        TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]),
    )

    footer_table = Table(
        [[footer_left, footer_right]],
        colWidths=[98 * mm, 78 * mm],
    )
    footer_table.setStyle(
        TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
        ]),
    )

    story = [
        header_table,
        Spacer(1, 6),
        meta_table,
        bill_to_bar,
        bill_to_name,
        Spacer(1, 8),
        items_table,
        Spacer(1, 10),
        footer_table,
    ]

    doc.build(story, onFirstPage=_draw_page_frame, onLaterPages=_draw_page_frame)
    return buffer.getvalue()
