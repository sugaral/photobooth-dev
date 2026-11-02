"""Build Hainan Daily's three-shot workshop frame from the original vector PDF.
Only remove the three photo paint operators and eight caption text operators.
All other PDF drawing/text operators are retained without re-typesetting.
"""
from pathlib import Path
from io import BytesIO
import json, math, shutil, subprocess
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image, ImageDraw, ImageChops

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'output/pdf/hainan-daily-2025-12-18-page146.pdf'
DEST = ROOT / 'output/pdf/hainan-daily-workshop-template.pdf'
TMP = ROOT / 'tmp/pdfs'
ASSETS = ROOT / 'resources/img/workshop'
CAPTION = '海南师范大学可爱的小海狮'
WIDTH = 3600


def multiply(a, b):
    return [a[0]*b[0]+a[1]*b[2], a[0]*b[1]+a[1]*b[3],
            a[2]*b[0]+a[3]*b[2], a[2]*b[1]+a[3]*b[3],
            a[4]*b[0]+a[5]*b[2]+b[4], a[4]*b[1]+a[5]*b[3]+b[5]]


def main():
    TMP.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)
    reader = PdfReader(SOURCE)
    writer = PdfWriter(clone_from=reader)
    page = writer.pages[0]
    pw, ph = float(page.mediabox.width), float(page.mediabox.height)
    height = round(WIDTH * ph / pw)
    content = ContentStream(page.get_contents(), writer)
    matrix = [1, 0, 0, 1, 0, 0]
    text_matrix = matrix.copy()
    stack, operations, removed_text, removed_images = [], [], [], []
    for operands, operator in content.operations:
        if operator == b'q': stack.append(matrix.copy())
        elif operator == b'Q': matrix = stack.pop()
        elif operator == b'cm': matrix = multiply(list(map(float, operands)), matrix)
        elif operator == b'Tm': text_matrix = list(map(float, operands))
        if operator == b'Do' and str(operands[0]) in ('/Im2', '/Im3', '/Im4'):
            removed_images.append(str(operands[0]))
            continue
        if operator in (b'TJ', b'Tj'):
            transform = multiply(text_matrix, matrix)
            x, top = transform[4], ph - transform[5]
            if ((930 < x < 945 and 230 < top < 505)
                    or (550 < x < 738 and 752 < top < 770)
                    or (545 < x < 740 and 1060 < top < 1080)):
                removed_text.append((x, top))
                continue
        operations.append((operands, operator))
    assert len(removed_text) == 8, removed_text
    assert sorted(removed_images) == ['/Im2', '/Im3', '/Im4']
    content.operations = operations
    page.replace_contents(content)
    # Remove unused original photo resources as well as their paint operators.
    for name in removed_images:
        del page['/Resources']['/XObject'][name]

    font_path = Path('C:/Windows/Fonts/simsun.ttc')
    pdfmetrics.registerFont(TTFont('CaptionSong', str(font_path), subfontIndex=0))
    addition = BytesIO()
    overlay = canvas.Canvas(addition, pagesize=(pw, ph))
    overlay.setFillColorRGB(.25, .25, .25)
    overlay.setFont('CaptionSong', 8.8)
    # Preserve the large photograph's vertical caption and the two smaller
    # photographs' horizontal captions, with the exact requested wording.
    for index, char in enumerate(CAPTION):
        overlay.drawString(932.5499, ph - (244.3 + index * 8.8), char)
    overlay.drawString(554.467, ph - 762.634, CAPTION)
    overlay.drawRightString(735.8124, ph - 1071.878, CAPTION)
    overlay.save()
    # Reopen serialized operators so pypdf decodes the source's embedded CJK
    # font byte strings in the same way as the final saved document.
    retained_document = BytesIO()
    writer.write(retained_document)
    retained_text = ''.join(PdfReader(retained_document).pages[0].extract_text().split())
    page.merge_page(PdfReader(addition).pages[0])
    writer.add_metadata({'/Title': '海南日报 · 创意工坊三连拍模板', '/Subject': '原版文字保留，三处照片位和图注替换'})
    writer.write(DEST)

    renderer = shutil.which('pdftoppm')
    if not renderer:
        raise RuntimeError('pdftoppm is required to render the vector newspaper')
    prefix = TMP / 'hainan-daily-clean'
    subprocess.run([renderer, '-png', '-singlefile', '-scale-to-x', str(WIDTH),
                    '-scale-to-y', str(height), str(DEST), str(prefix)], check=True)
    # Actual visible rectangles: intersections of each image with its PDF clip.
    # The large and lower photos have substantial invisible areas in the PDF.
    boxes = [
        (156.9622, 172.2980, 928.4764, 498.5157),
        (554.1310, 627.3623, 730.6462, 750.7786),
        (355.7693, 901.9698, 731.8969, 1058.4921),
    ]
    cells = []
    frame = Image.open(prefix.with_suffix('.png')).convert('RGB')
    draw = ImageDraw.Draw(frame)
    for left, top, right, bottom in boxes:
        x, y = math.floor(left / pw * WIDTH), math.floor(top / ph * height)
        end_x, end_y = math.ceil(right / pw * WIDTH), math.ceil(bottom / ph * height)
        cells.append([x, y, end_x - x, end_y - y])
        draw.rectangle((x, y, end_x-1, end_y-1), fill='white')
    # Compare to the source at identical resolution. Every pixel outside the
    # three photos and their captions must remain visually unchanged.
    original_prefix = TMP / 'hainan-daily-original'
    subprocess.run([renderer, '-png', '-singlefile', '-scale-to-x', str(WIDTH),
                    '-scale-to-y', str(height), str(SOURCE), str(original_prefix)], check=True)
    original = Image.open(original_prefix.with_suffix('.png')).convert('RGB')
    difference = ImageChops.difference(original, frame)
    mask = ImageDraw.Draw(difference)
    for left, top, right, bottom in boxes + [(930, 230, 947, 505), (550, 751, 738, 771), (545, 1060, 740, 1080)]:
        mask.rectangle((math.floor(left/pw*WIDTH)-2, math.floor(top/ph*height)-2,
                        math.ceil(right/pw*WIDTH)+2, math.ceil(bottom/ph*height)+2), fill='black')
    assert difference.getbbox() is None, 'Unexpected change outside photo/caption areas: ' + str(difference.getbbox())
    frame.save(ASSETS / 'hainan-daily.png', dpi=(300, 300), optimize=True)
    preview = frame.copy()
    preview.thumbnail((1000, 1600), Image.Resampling.LANCZOS)
    preview.save(ASSETS / 'hainan-daily-preview.jpg', quality=94, subsampling=0)
    frame.resize((980, round(height / WIDTH * 980)), Image.Resampling.LANCZOS).save(TMP / 'hainan-daily-review.png')

    catalog_path = ROOT / 'resources/catalog/workshop-layouts.json'
    catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
    layout = {
        'id': 'hainan_daily', 'name': '海南日报',
        'description': '登上海南日报，成为版面里的小海狮。保留原版报纸正文，三张照片依次入版。',
        'width': WIDTH, 'height': height, 'dpi': 300,
        'background': 'resources/img/workshop/hainan-daily.png',
        'preview': 'resources/img/workshop/hainan-daily-preview.jpg',
        'spec': f'原版报纸比例 · {WIDTH} × {height} 像素 · 300 DPI',
        'cells': cells,
    }
    catalog['layouts'] = [item for item in catalog['layouts'] if item['id'] != layout['id']] + [layout]
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(layout, ensure_ascii=False, indent=2))
    # Verify all original wording survives except the three intentionally removed captions.
    final_text = PdfReader(DEST).pages[0].extract_text()
    normalized = ''.join(final_text.split())
    assert normalized.count(CAPTION) == 3
    assert normalized.replace(CAPTION, '') == retained_text, 'Body text changed'
    assert '奋力书写一流师范大学建设新篇章' in final_text
    assert '综合体育馆项目开工。' not in final_text

if __name__ == '__main__':
    main()
