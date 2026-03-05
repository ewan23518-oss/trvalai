from pathlib import Path
import re
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

EXPORT_DIR = Path("exports")
EXPORT_DIR.mkdir(parents=True, exist_ok=True)


def _safe_name(text: str) -> str:
    cleaned = re.sub(r"[^\w\-\u4e00-\u9fff]+", "-", text).strip("-")
    return cleaned or "travel-plan"


def _pick_font() -> str:
    candidates = [
        ("NotoSansCJK", "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc"),
        ("NotoSansCJK", "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"),
        ("SimSun", "C:/Windows/Fonts/simsun.ttc"),
        ("MicrosoftYaHei", "C:/Windows/Fonts/msyh.ttc"),
    ]
    for font_name, font_path in candidates:
        path = Path(font_path)
        if path.exists():
            try:
                pdfmetrics.registerFont(TTFont(font_name, str(path)))
                return font_name
            except Exception:
                continue
    return "Helvetica"


def create_pdf_file(title: str, content: str) -> tuple[str, str]:
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    filename = f"{_safe_name(title)}-{ts}.pdf"
    filepath = EXPORT_DIR / filename

    c = canvas.Canvas(str(filepath), pagesize=A4)
    width, height = A4
    font_name = _pick_font()

    c.setFont(font_name, 16)
    c.drawString(40, height - 60, title)

    c.setFont(font_name, 11)
    y = height - 90
    line_height = 18

    for raw_line in content.splitlines():
        line = raw_line.strip()
        if not line:
            y -= line_height
            if y < 60:
                c.showPage()
                c.setFont(font_name, 11)
                y = height - 60
            continue

        # naive long-line wrap for MVP
        chunks = [line[i : i + 56] for i in range(0, len(line), 56)]
        for chunk in chunks:
            c.drawString(40, y, chunk)
            y -= line_height
            if y < 60:
                c.showPage()
                c.setFont(font_name, 11)
                y = height - 60

    c.save()
    return filename, f"/exports/{filename}"
