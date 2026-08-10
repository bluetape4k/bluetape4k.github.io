from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "public/assets/blog/image-intelligence/part4"
WIDTH = 1800
HEIGHT = 2120


LOCALES = {
    "ko": {
        "title": "검출 사실은 방문증 정책의 우선순위로 변환된다",
        "desc": "방문증 분석 결과를 민감 영역, 잘못된 QR, degraded 상태, 정상 조건, 그 밖의 검토 사유 순서로 평가하고 정책 조치와 애플리케이션 side effect를 분리하는 흐름도.",
        "subtitle": "검출기는 facts와 상태를 보존하고, policy는 action을 선택하며, application이 실제 side effect를 소유합니다.",
        "input_type": "ImageAnalysisResults",
        "input_title": "분석 facts와 상태",
        "input_fields": "detection · barcode · ocr",
        "input_body": "DetectionResult · AnalysisResult · reason 보존",
        "input_note": "빈 결과와 실행 실패를 같은 목록으로 만들지 않음",
        "input_to_policy": "facts + states",
        "policy_type": "VisitorPassPolicy.decide",
        "policy_title": "우선순위를 순서대로 평가",
        "policy_body": "첫 일치 결과를 반환하고, 사실과 처리 명령을 같은 타입에 넣지 않습니다.",
        "policy_to_flow": "정책 평가",
        "flow_title": "첫 일치에서 반환",
        "flow_subtitle": "예 → action 반환 · 아니오 → 다음 조건",
        "yes": "예",
        "no_next": "아니오 · 다음 조건",
        "rows": [
            {
                "condition": "민감 영역이 검출됐나?",
                "detail": "SENSITIVE_REGION",
                "action": "QUARANTINE",
                "reason": "SENSITIVE_REGION_DETECTED",
                "color": "amber",
                "action_color": "red",
            },
            {
                "condition": "visitor QR이 아닌 완료 barcode가 있나?",
                "detail": "INVALID_VISITOR_QR",
                "action": "REJECT",
                "reason": "INVALID_VISITOR_QR",
                "color": "amber",
                "action_color": "rose",
            },
            {
                "condition": "어느 분석 경로가 Failed / Unavailable인가?",
                "detail": "OCR · DETECTION · BARCODE의 degraded reason",
                "action": "MANUAL_REVIEW",
                "reason": "실패 또는 provider 미사용",
                "color": "amber",
                "action_color": "amber",
            },
            {
                "condition": "검토 사유가 비어 있나?",
                "detail": "face = 1 · visitor QR = 1 · OCR text not blank",
                "action": "ALLOW",
                "reason": "예제의 자동 승인 조건",
                "color": "purple",
                "action_color": "green",
            },
            {
                "condition": "그 밖의 조건이 일치하지 않나?",
                "detail": "Empty · 개수 불일치 · OCR 내용 없음",
                "action": "MANUAL_REVIEW",
                "reason": "구체적인 검토 사유 보존",
                "color": "purple",
                "action_color": "purple",
            },
        ],
        "decision_type": "VisitorPassDecision",
        "decision_title": "action + reasons",
        "decision_body": "정책 결과는 처리 명령과 이유를 반환하지만 pixel을 직접 바꾸지 않습니다.",
        "actions": "ALLOW · MANUAL_REVIEW · REJECT · QUARANTINE",
        "decision_to_app": "decision 값",
        "app_type": "Application boundary",
        "app_title": "실제 side effect는 애플리케이션이 소유",
        "app_items": [
            ("Renderer", "BLUR · MOSAIC · SOLID_MASK"),
            ("Storage", "DROP · QUARANTINE"),
            ("HTTP / Review", "REJECT · MANUAL_REVIEW"),
        ],
        "footer": "검출기는 fact를 보고하고, policy는 action을 고르며, application은 렌더링·저장·거부·수동 검토를 실행합니다.",
    },
    "en": {
        "title": "Detection facts become ordered visitor-pass policy decisions",
        "desc": "A visitor-pass policy evaluates analysis results in precedence order: sensitive region, invalid QR, degraded lanes, valid conditions, and remaining review reasons, while keeping application side effects outside the policy.",
        "subtitle": "Detectors preserve facts and states, policy chooses an action, and the application owns the actual side effects.",
        "input_type": "ImageAnalysisResults",
        "input_title": "Analysis facts and states",
        "input_fields": "detection · barcode · ocr",
        "input_body": "Preserve DetectionResult · AnalysisResult · reason",
        "input_note": "Empty results and execution failures are not the same list",
        "input_to_policy": "facts + states",
        "policy_type": "VisitorPassPolicy.decide",
        "policy_title": "Evaluate precedence in order",
        "policy_body": "Return the first matching result; do not combine facts and treatment commands in one type.",
        "policy_to_flow": "policy evaluation",
        "flow_title": "Return on first match",
        "flow_subtitle": "Yes → return action · No → continue",
        "yes": "Yes",
        "no_next": "No · continue",
        "rows": [
            {
                "condition": "Was a sensitive region detected?",
                "detail": "SENSITIVE_REGION",
                "action": "QUARANTINE",
                "reason": "SENSITIVE_REGION_DETECTED",
                "color": "amber",
                "action_color": "red",
            },
            {
                "condition": "Is a completed barcode not a visitor QR?",
                "detail": "INVALID_VISITOR_QR",
                "action": "REJECT",
                "reason": "INVALID_VISITOR_QR",
                "color": "amber",
                "action_color": "rose",
            },
            {
                "condition": "Is any analysis lane Failed / Unavailable?",
                "detail": "degraded reason from OCR · DETECTION · BARCODE",
                "action": "MANUAL_REVIEW",
                "reason": "failure or provider unavailable",
                "color": "amber",
                "action_color": "amber",
            },
            {
                "condition": "Are there no review reasons?",
                "detail": "face = 1 · visitor QR = 1 · OCR text not blank",
                "action": "ALLOW",
                "reason": "example auto-approval conditions",
                "color": "purple",
                "action_color": "green",
            },
            {
                "condition": "Do any remaining conditions disagree?",
                "detail": "Empty · count mismatch · missing OCR content",
                "action": "MANUAL_REVIEW",
                "reason": "preserve a concrete review reason",
                "color": "purple",
                "action_color": "purple",
            },
        ],
        "decision_type": "VisitorPassDecision",
        "decision_title": "action + reasons",
        "decision_body": "The policy returns a treatment command and reasons; it does not mutate pixels itself.",
        "actions": "ALLOW · MANUAL_REVIEW · REJECT · QUARANTINE",
        "decision_to_app": "decision value",
        "app_type": "Application boundary",
        "app_title": "The application owns actual side effects",
        "app_items": [
            ("Renderer", "BLUR · MOSAIC · SOLID_MASK"),
            ("Storage", "DROP · QUARANTINE"),
            ("HTTP / Review", "REJECT · MANUAL_REVIEW"),
        ],
        "footer": "The detector reports facts, policy chooses an action, and the application performs rendering, storage, rejection, and manual review.",
    },
}


COLORS = {
    "blue": {"stroke": "#66aee8", "fill": "#203e61", "marker": "arrow-blue"},
    "cyan": {"stroke": "#50c7d9", "fill": "#173d4e", "marker": "arrow-cyan"},
    "amber": {"stroke": "#f0ad5b", "fill": "#4a3521", "marker": "arrow-amber"},
    "red": {"stroke": "#ef7d8f", "fill": "#4b2534", "marker": "arrow-red"},
    "rose": {"stroke": "#f0937a", "fill": "#4a2c28", "marker": "arrow-rose"},
    "purple": {"stroke": "#a78bfa", "fill": "#352b58", "marker": "arrow-purple"},
    "green": {"stroke": "#57c58a", "fill": "#183e32", "marker": "arrow-green"},
    "muted": {"stroke": "#8191ab", "fill": "#25334a", "marker": "arrow-muted"},
}


def xml_text(cls, x, y, value, anchor=None):
    anchor_attr = f' text-anchor="{anchor}"' if anchor else ""
    return f'<text class="{cls}" x="{x}" y="{y}"{anchor_attr}>{escape(value)}</text>'


def rect(x, y, width, height, fill, stroke, radius=20, cls="card"):
    return f'<rect class="{cls}" x="{x}" y="{y}" width="{width}" height="{height}" rx="{radius}" fill="{fill}" stroke="{stroke}"/>'


def marker(marker_id, color, size, role):
    return (
        f'<marker id="{marker_id}" viewBox="0 0 14 14" markerWidth="{size}" markerHeight="{size}" '
        f'refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse" data-role="{role}" '
        f'data-tip-direction="positive-x"><path d="M1 1 L13 7 L1 13 Z" fill="{color}" stroke="none" '
        'stroke-dasharray="none"/></marker>'
    )


def path(d, color_key, marker_end=True, width=4, dashed=False):
    color = COLORS[color_key]
    dash = ' stroke-dasharray="7 7"' if dashed else ""
    end = f' marker-end="url(#{color["marker"]})"' if marker_end else ""
    return f'<path class="connector" d="{d}" stroke="{color["stroke"]}" stroke-width="{width}"{dash}{end}/>'


def write_svg(locale, copy):
    lines = []
    lines.append(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}" role="img" aria-labelledby="title desc">'
    )
    lines.append(f'<title id="title">{escape(copy["title"])}</title>')
    lines.append(f'<desc id="desc">{escape(copy["desc"])}</desc>')
    lines.append("<defs>")
    lines.append('<linearGradient id="canvas" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#07101f"/><stop offset="0.58" stop-color="#0c1730"/><stop offset="1" stop-color="#10142a"/></linearGradient>')
    lines.append(marker("arrow-blue", COLORS["blue"]["stroke"], 14, "primary"))
    lines.append(marker("arrow-cyan", COLORS["cyan"]["stroke"], 14, "primary"))
    lines.append(marker("arrow-amber", COLORS["amber"]["stroke"], 14, "primary"))
    lines.append(marker("arrow-red", COLORS["red"]["stroke"], 14, "primary"))
    lines.append(marker("arrow-rose", COLORS["rose"]["stroke"], 14, "primary"))
    lines.append(marker("arrow-purple", COLORS["purple"]["stroke"], 14, "primary"))
    lines.append(marker("arrow-green", COLORS["green"]["stroke"], 14, "primary"))
    lines.append(marker("arrow-muted", COLORS["muted"]["stroke"], 10, "secondary"))
    lines.append("<style>")
    lines.append(".title{font-family:'goorm Sans','Architects Daughter',sans-serif;font-size:46px;font-weight:700;fill:#f8fafc}.subtitle{font-family:'goorm Sans Code','Comic Mono','goorm Sans',monospace;font-size:20px;fill:#a9b8d4}.section{font-family:'goorm Sans','Architects Daughter',sans-serif;font-size:25px;font-weight:700;fill:#f8fafc}.cardTitle{font-family:'goorm Sans','Architects Daughter',sans-serif;font-size:29px;font-weight:700;fill:#f8fafc}.actionTitle{font-family:'goorm Sans Code','Comic Mono','goorm Sans',monospace;font-size:25px;font-weight:700;fill:#f8fafc}.body{font-family:'goorm Sans','Architects Daughter',sans-serif;font-size:19px;fill:#cbd7ea}.mono{font-family:'goorm Sans Code','Comic Mono','goorm Sans',monospace;font-size:18px;fill:#b9c9e2}.small{font-family:'goorm Sans','Architects Daughter',sans-serif;font-size:16px;fill:#9fb0ca}.rowTitle{font-family:'goorm Sans','Architects Daughter',sans-serif;font-size:22px;font-weight:700;fill:#f8fafc}.rowDetail{font-family:'goorm Sans Code','Comic Mono','goorm Sans',monospace;font-size:15px;fill:#b9c9e2}.step{font-family:'goorm Sans Code','Comic Mono','goorm Sans',monospace;font-size:20px;font-weight:700;fill:#f8fafc}.label{font-family:'goorm Sans','Architects Daughter',sans-serif;font-size:16px;font-weight:700;fill:#e7eef9}.card{fill:#14233a;stroke-width:2}.frame{fill:#0c172a;fill-opacity:.42;stroke:#344968;stroke-width:2}.pill{fill:#101c31;stroke-width:1.5}.connector{fill:none;stroke-linecap:round;stroke-linejoin:round}.muted{fill:#9fb0ca}</style>")
    lines.append("</defs>")
    lines.append(f'<rect width="{WIDTH}" height="{HEIGHT}" fill="url(#canvas)"/>')
    lines.append(f'<rect x="28" y="28" width="{WIDTH - 56}" height="{HEIGHT - 56}" rx="28" fill="none" stroke="#2b4168" stroke-width="2"/>')
    lines.append(xml_text("title", 900, 76, copy["title"], "middle"))
    lines.append(xml_text("subtitle", 900, 116, copy["subtitle"], "middle"))

    lines.append(rect(390, 170, 1020, 176, "#14233a", COLORS["blue"]["stroke"], 24))
    lines.append(xml_text("mono", 450, 214, copy["input_type"]))
    lines.append(xml_text("cardTitle", 450, 258, copy["input_title"]))
    lines.append(xml_text("mono", 450, 300, copy["input_fields"]))
    lines.append(xml_text("body", 940, 258, copy["input_body"]))
    lines.append(xml_text("small", 940, 300, copy["input_note"]))
    lines.append(path("M900 346 V414", "blue"))
    lines.append(rect(755, 365, 290, 38, "#101c31", COLORS["blue"]["stroke"], 12, "pill"))
    lines.append(xml_text("label", 900, 390, copy["input_to_policy"], "middle"))

    lines.append(rect(260, 430, 1280, 170, "#171b37", COLORS["purple"]["stroke"], 26))
    lines.append(xml_text("mono", 330, 474, copy["policy_type"]))
    lines.append(xml_text("cardTitle", 330, 520, copy["policy_title"]))
    lines.append(xml_text("body", 330, 558, copy["policy_body"]))
    lines.append(path("M900 600 V746", "purple"))
    lines.append(rect(1010, 660, 220, 38, "#101c31", COLORS["purple"]["stroke"], 12, "pill"))
    lines.append(xml_text("label", 1120, 685, copy["policy_to_flow"], "middle"))

    lines.append(rect(100, 650, 1600, 810, "#0c172a", "#344968", 28, "frame"))
    lines.append(xml_text("section", 150, 700, copy["flow_title"]))
    lines.append(xml_text("small", 150, 730, copy["flow_subtitle"]))

    row_y = [760, 895, 1030, 1165, 1300]
    condition_x = 170
    action_x = 1000
    condition_width = 700
    action_width = 600
    row_height = 102
    for index, (row, y) in enumerate(zip(copy["rows"], row_y), start=1):
        condition_color = COLORS[row["color"]]
        action_color = COLORS[row["action_color"]]
        lines.append(rect(condition_x, y, condition_width, row_height, condition_color["fill"], condition_color["stroke"], 22))
        lines.append(f'<circle cx="218" cy="{y + 51}" r="27" fill="{condition_color["stroke"]}" opacity="0.28" stroke="{condition_color["stroke"]}" stroke-width="2"/>')
        lines.append(xml_text("step", 218, y + 58, str(index), "middle"))
        lines.append(xml_text("rowTitle", 270, y + 40, row["condition"]))
        lines.append(xml_text("rowDetail", 270, y + 76, row["detail"]))
        lines.append(rect(action_x, y, action_width, row_height, action_color["fill"], action_color["stroke"], 22))
        lines.append(xml_text("small", action_x + 42, y + 32, "action"))
        lines.append(xml_text("actionTitle", action_x + 42, y + 65, row["action"]))
        lines.append(xml_text("rowDetail", action_x + 270, y + 65, row["reason"]))
        lines.append(path(f"M{condition_x + condition_width} {y + 51} H{action_x}", row["action_color"]))
        lines.append(xml_text("label", 935, y + 43, copy["yes"], "middle"))
        if index < len(row_y):
            next_y = row_y[index]
            lines.append(path(f"M520 {y + row_height} V{next_y}", "muted"))
            lines.append(xml_text("small", 565, y + row_height + 26, copy["no_next"]))

    lines.append(path("M900 1460 V1532", "purple"))
    lines.append(rect(300, 1545, 1200, 190, "#171b37", COLORS["purple"]["stroke"], 26))
    lines.append(xml_text("mono", 370, 1588, copy["decision_type"]))
    lines.append(xml_text("cardTitle", 370, 1632, copy["decision_title"]))
    lines.append(xml_text("body", 370, 1670, copy["decision_body"]))
    badge_x = [370, 610, 960, 1240]
    badge_colors = ["green", "purple", "rose", "red"]
    for x, label, color_key in zip(badge_x, copy["actions"].split(" · "), badge_colors):
        color = COLORS[color_key]
        lines.append(rect(x, 1690, 200 if label != "MANUAL_REVIEW" else 310, 34, "#101c31", color["stroke"], 12, "pill"))
        lines.append(xml_text("label", x + (100 if label != "MANUAL_REVIEW" else 155), 1713, label, "middle"))

    lines.append(path("M900 1735 V1792", "purple"))
    lines.append(rect(190, 1810, 1420, 190, "#14233a", COLORS["blue"]["stroke"], 26))
    lines.append(xml_text("mono", 260, 1852, copy["app_type"]))
    lines.append(xml_text("cardTitle", 260, 1897, copy["app_title"]))
    item_x = [260, 740, 1190]
    for x, (heading, value) in zip(item_x, copy["app_items"]):
        lines.append(xml_text("small", x, 1942, heading))
        lines.append(xml_text("mono", x, 1972, value))
    lines.append(rect(170, 2030, 1460, 48, "#101c31", "#405777", 22, "pill"))
    lines.append(xml_text("body", 900, 2061, copy["footer"], "middle"))
    lines.append("</svg>")

    output = ASSET_ROOT / f"image-intelligence-policy-flow-01-{locale}.svg"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(output)


if __name__ == "__main__":
    for locale, copy in LOCALES.items():
        write_svg(locale, copy)
