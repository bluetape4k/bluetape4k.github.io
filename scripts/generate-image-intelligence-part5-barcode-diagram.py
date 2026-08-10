from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "public/assets/blog/image-intelligence/part5"
WIDTH = 1800
HEIGHT = 1450


LOCALES = {
    "ko": {
        "title": "ZXing adapter에서 visitor-pass policy까지",
        "desc": "ImmutableImage와 BarcodeOptions가 provider-neutral BarcodeReader 경계를 지나 ZXing adapter에서 BarcodeResult로 정규화되고, AnalysisResult 상태를 거쳐 VisitorPassPolicy action으로 해석되는 흐름도.",
        "subtitle": "adapter는 payload를 정규화하고, AnalysisResult는 상태를 보존하며, policy가 action을 선택합니다.",
        "contract_section": "계약 경계: provider는 바뀌어도 호출자는 같은 결과를 받는다",
        "input_title": "입력 + 옵션",
        "input_body": "format / tryHarder / rawBytes",
        "input_note": "qualified ImmutableImage",
        "reader_title": "provider-neutral API",
        "reader_body": "List<BarcodeResult>",
        "reader_note": "controller / policy는 여기서 멈춤",
        "adapter_title": "adapter module",
        "adapter_note": "ZXing은 이 card 안에 둠",
        "result_title": "정규화한 facts",
        "result_body": "text / format / provider",
        "result_note": "region? / rawBytes? / ZXing type는 밖으로 새지 않음",
        "state_section": "State wrapper: 같은 실패가 아니다",
        "state_note": "결과가 없다는 사실과 provider가 실행되지 않았다는 사실을 합치지 않습니다.",
        "completed_detail": "BarcodeResult 있음",
        "completed_note": "payload 사용 가능",
        "empty_detail": "reader 실행 / code 없음",
        "empty_note": "정상적인 빈 결과",
        "unavailable_detail": "provider 미설정",
        "unavailable_note": "실행 경로 없음",
        "failed_detail": "decode / format / input error",
        "failed_note": "실패 원인 보존",
        "policy_section": "Policy가 의미를 해석하고 application이 side effect를 실행한다",
        "policy_title": "VisitorPassPolicy.decide",
        "policy_note": "facts + states -> action",
        "rule_completed": "completed + QR_CODE + visitor:",
        "rule_invalid": "completed + other payload",
        "rule_degraded": "Empty / Unavailable / Failed",
        "decision_title": "action + reasons",
        "decision_note": "policy가 반환하고 application이 실행",
        "app_note": "Application boundary: HTTP / storage / rendering",
        "footer": "ZXing decodes -> adapter가 normalize -> policy가 해석 -> application이 side effect 실행",
        "input_to_reader": "입력 + 옵션",
        "reader_to_adapter": "impl",
        "adapter_to_result": "normalized",
        "result_to_state": "result + normalized failure",
        "state_to_policy": "facts + states",
        "policy_to_decision": "action",
        "legend_data": "data contract",
        "legend_internal": "adapter 내부 구현",
        "legend_policy": "policy action",
        "action_allow": "ALLOW",
        "action_reject": "REJECT",
        "action_review": "MANUAL_REVIEW",
    },
    "en": {
        "title": "From the ZXing adapter to visitor-pass policy",
        "desc": "A flow diagram showing ImmutableImage and BarcodeOptions crossing the provider-neutral BarcodeReader boundary, becoming BarcodeResult facts inside the ZXing adapter, retaining AnalysisResult states, and reaching VisitorPassPolicy actions.",
        "subtitle": "The adapter normalizes payloads, AnalysisResult preserves state, and policy chooses the action.",
        "contract_section": "Contract boundary: callers keep the same result when the provider changes",
        "input_title": "Input + options",
        "input_body": "format / tryHarder / rawBytes",
        "input_note": "qualified ImmutableImage",
        "reader_title": "provider-neutral API",
        "reader_body": "List<BarcodeResult>",
        "reader_note": "controller / policy stops here",
        "adapter_title": "adapter module",
        "adapter_note": "ZXing stays inside this card",
        "result_title": "Normalized facts",
        "result_body": "text / format / provider",
        "result_note": "region? / rawBytes? / no ZXing types leak out",
        "state_section": "State wrapper: these outcomes are not the same",
        "state_note": "Do not collapse no-code results with a provider that never ran.",
        "completed_detail": "BarcodeResult present",
        "completed_note": "payload available",
        "empty_detail": "reader ran / no code",
        "empty_note": "normal empty result",
        "unavailable_detail": "provider not configured",
        "unavailable_note": "no execution path",
        "failed_detail": "decode / format / input error",
        "failed_note": "preserve failure reason",
        "policy_section": "Policy interprets meaning; the application performs side effects",
        "policy_title": "VisitorPassPolicy.decide",
        "policy_note": "facts + states -> action",
        "rule_completed": "completed + QR_CODE + visitor:",
        "rule_invalid": "completed + other payload",
        "rule_degraded": "Empty / Unavailable / Failed",
        "decision_title": "action + reasons",
        "decision_note": "policy returns; application executes",
        "app_note": "Application boundary: HTTP / storage / rendering",
        "footer": "ZXing decodes -> the adapter normalizes -> policy interprets -> the application performs side effects",
        "input_to_reader": "input + options",
        "reader_to_adapter": "impl",
        "adapter_to_result": "normalized",
        "result_to_state": "result + normalized failure",
        "state_to_policy": "facts + states",
        "policy_to_decision": "action",
        "legend_data": "data contract",
        "legend_internal": "adapter implementation",
        "legend_policy": "policy action",
        "action_allow": "ALLOW",
        "action_reject": "REJECT",
        "action_review": "MANUAL_REVIEW",
    },
}


COLORS = {
    "blue": {"stroke": "#66aee8", "fill": "#203e61", "marker": "arrow-blue"},
    "cyan": {"stroke": "#50c7d9", "fill": "#173d4e", "marker": "arrow-cyan"},
    "purple": {"stroke": "#a78bfa", "fill": "#352b58", "marker": "arrow-purple"},
    "green": {"stroke": "#57c58a", "fill": "#183e32", "marker": "arrow-green"},
    "amber": {"stroke": "#f0ad5b", "fill": "#4a3521", "marker": "arrow-amber"},
    "red": {"stroke": "#ef7d8f", "fill": "#4b2534", "marker": "arrow-red"},
    "muted": {"stroke": "#8191ab", "fill": "#25334a", "marker": "arrow-muted"},
}


def xml_text(cls, x, y, value, anchor=None):
    anchor_attr = f' text-anchor="{anchor}"' if anchor else ""
    return f'<text class="{cls}" x="{x}" y="{y}"{anchor_attr}>{escape(value)}</text>'


def box(x, y, width, height, fill, stroke, radius=20, cls="card", extra=""):
    return f'<rect class="{cls}" x="{x}" y="{y}" width="{width}" height="{height}" rx="{radius}" fill="{fill}" stroke="{stroke}"{extra}/>'


def marker(marker_id, color, size, role):
    return (
        f'<marker id="{marker_id}" viewBox="0 0 14 14" markerWidth="{size}" markerHeight="{size}" '
        f'refX="12" refY="7" orient="auto" markerUnits="userSpaceOnUse" data-role="{role}" '
        f'data-tip-direction="positive-x"><path d="M1 1 L13 7 L1 13 Z" fill="{color}" stroke="none" '
        'stroke-dasharray="none"/></marker>'
    )


def connector(edge_id, source, target, d, color_key, width=4):
    color = COLORS[color_key]
    return (
        f'<path class="connector" data-edge-id="{edge_id}" data-source="{source}" data-target="{target}" '
        f'd="{d}" stroke="{color["stroke"]}" stroke-width="{width}" marker-end="url(#{color["marker"]})"/>'
    )


def label_box(x, y, width, value, stroke):
    return (
        f'<rect class="label-bg" x="{x}" y="{y}" width="{width}" height="30" rx="10" fill="#101c31" stroke="{stroke}"/>'
        + xml_text("label", x + width / 2, y + 20, value, "middle")
    )


def node(node_id, elements):
    return f'<g data-node-id="{node_id}">' + "".join(elements) + "</g>"


def write_svg(locale, copy):
    heading_font = "'goorm Sans','Architects Daughter',sans-serif" if locale == "ko" else "'Architects Daughter','goorm Sans',sans-serif"
    body_font = "'goorm Sans','Architects Daughter',sans-serif" if locale == "ko" else "'Comic Mono','goorm Sans',monospace"
    mono_font = "'goorm Sans Code','Comic Mono','goorm Sans',monospace" if locale == "ko" else "'Comic Mono','goorm Sans Code',monospace"

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
    lines.append(marker("arrow-purple", COLORS["purple"]["stroke"], 14, "primary"))
    lines.append(marker("arrow-green", COLORS["green"]["stroke"], 14, "primary"))
    lines.append(marker("arrow-amber", COLORS["amber"]["stroke"], 14, "primary"))
    lines.append(marker("arrow-red", COLORS["red"]["stroke"], 14, "primary"))
    lines.append(marker("arrow-muted", COLORS["muted"]["stroke"], 10, "secondary"))
    lines.append("<style>")
    lines.append(
        f".title{{font-family:{heading_font};font-size:48px;font-weight:700;fill:#f8fafc}}.subtitle{{font-family:{mono_font};font-size:20px;fill:#a9b8d4}}.section{{font-family:{heading_font};font-size:25px;font-weight:700;fill:#f8fafc}}.card-title{{font-family:{heading_font};font-size:25px;font-weight:700;fill:#f8fafc}}.body{{font-family:{body_font};font-size:18px;fill:#cbd7ea}}.mono{{font-family:{mono_font};font-size:18px;fill:#b9c9e2}}.small{{font-family:{body_font};font-size:15px;fill:#9fb0ca}}.status{{font-family:{heading_font};font-size:22px;font-weight:700;fill:#f8fafc}}.status-detail{{font-family:{mono_font};font-size:15px;fill:#b9c9e2}}.label{{font-family:{body_font};font-size:14px;font-weight:700;fill:#e7eef9}}.row{{font-family:{mono_font};font-size:16px;fill:#dce7f5}}.card{{stroke-width:2}}.frame{{stroke-width:2}}.label-bg{{stroke-width:1.5}}.connector{{fill:none;stroke-linecap:round;stroke-linejoin:round}}.divider{{stroke:#405777;stroke-width:1.5}}"
    )
    lines.append("</style>")
    lines.append("</defs>")
    lines.append(f'<rect width="{WIDTH}" height="{HEIGHT}" fill="url(#canvas)"/>')
    lines.append(f'<rect x="28" y="28" width="{WIDTH - 56}" height="{HEIGHT - 56}" rx="28" fill="none" stroke="#2b4168" stroke-width="2"/>')
    lines.append(xml_text("title", 900, 74, copy["title"], "middle"))
    lines.append(xml_text("subtitle", 900, 114, copy["subtitle"], "middle"))

    legend_x = 550
    for label, color_key, width in (
        (copy["legend_data"], "blue", 210),
        (copy["legend_internal"], "muted", 235),
        (copy["legend_policy"], "purple", 185),
    ):
        color = COLORS[color_key]
        lines.append(box(legend_x, 132, width, 28, "#101c31", color["stroke"], 10, "label-bg"))
        lines.append(xml_text("label", legend_x + width / 2, 151, label, "middle"))
        legend_x += width + 16

    # Section 1: contract and provider boundary.
    lines.append(box(70, 180, 1660, 350, "#0c172a", "#344968", 28, "frame"))
    lines.append(xml_text("section", 110, 225, copy["contract_section"]))

    lines.append(connector("input-reader", "input", "reader", "M410 360 H525", "blue"))
    lines.append(connector("reader-adapter", "reader", "adapter", "M785 360 H835", "muted", 3))
    lines.append(connector("adapter-backend", "adapter", "backend", "M990 397 V415", "muted", 3))
    lines.append(connector("adapter-result", "adapter", "result", "M1145 360 H1240", "blue"))
    lines.append(label_box(435, 323, 70, copy["input_to_reader"], COLORS["blue"]["stroke"]))
    lines.append(label_box(785, 323, 50, copy["reader_to_adapter"], COLORS["muted"]["stroke"]))
    lines.append(label_box(1150, 323, 90, copy["adapter_to_result"], COLORS["blue"]["stroke"]))

    lines.append(
        node(
            "input",
            [
                box(110, 275, 300, 170, COLORS["blue"]["fill"], COLORS["blue"]["stroke"], 22),
                xml_text("mono", 140, 316, "qualified ImmutableImage"),
                xml_text("card-title", 140, 358, copy["input_title"]),
                xml_text("mono", 140, 396, copy["input_body"]),
                xml_text("small", 140, 424, copy["input_note"]),
            ],
        )
    )
    lines.append(
        node(
            "reader",
            [
                box(525, 275, 260, 170, "#173d4e", COLORS["cyan"]["stroke"], 22),
                xml_text("mono", 555, 316, "BarcodeReader"),
                xml_text("card-title", 555, 358, copy["reader_title"]),
                xml_text("mono", 555, 396, copy["reader_body"]),
                xml_text("small", 555, 424, copy["reader_note"]),
            ],
        )
    )
    lines.append(
        node(
            "adapter",
            [
                box(835, 250, 310, 220, "#173d4e", COLORS["cyan"]["stroke"], 22, "frame", ' stroke-dasharray="10 8"'),
                xml_text("mono", 865, 283, "images-barcode-zxing"),
                xml_text("small", 865, 308, copy["adapter_title"]),
                box(865, 330, 250, 66, "#203e61", COLORS["blue"]["stroke"], 16),
                xml_text("card-title", 990, 371, "ZxingBarcodeReader", "middle"),
                box(865, 415, 250, 38, "#101c31", COLORS["muted"]["stroke"], 12, "label-bg"),
                xml_text("status-detail", 990, 440, "ZXing / MultiFormatReader", "middle"),
                xml_text("small", 990, 488, copy["adapter_note"], "middle"),
            ],
        )
    )
    lines.append(
        node(
            "result",
            [
                box(1240, 275, 440, 170, COLORS["blue"]["fill"], COLORS["blue"]["stroke"], 22),
                xml_text("mono", 1270, 316, "List<BarcodeResult>"),
                xml_text("card-title", 1270, 358, copy["result_title"]),
                xml_text("mono", 1270, 396, copy["result_body"]),
                xml_text("small", 1270, 424, copy["result_note"]),
            ],
        )
    )

    # Section 2: state wrapper.
    lines.append(box(70, 600, 1660, 300, "#0c172a", "#344968", 28, "frame"))
    lines.append(xml_text("section", 110, 650, copy["state_section"]))
    lines.append(xml_text("small", 110, 678, copy["state_note"]))
    lines.append(connector("result-state", "result", "analysis-state", "M1460 445 V555 Q1460 575 1440 575 H920 Q900 575 900 595 V690", "blue"))
    lines.append(label_box(1060, 545, 245, copy["result_to_state"], COLORS["blue"]["stroke"]))
    lines.append(connector("state-policy", "analysis-state", "policy", "M1085 875 V1000", "purple"))
    lines.append(label_box(1110, 914, 145, copy["state_to_policy"], COLORS["purple"]["stroke"]))

    lines.append(
        node(
            "analysis-state",
            [
                box(770, 690, 260, 34, "#101c31", COLORS["blue"]["stroke"], 11, "label-bg"),
                xml_text("label", 900, 713, "AnalysisResult", "middle"),
            ],
        )
    )
    state_cards = [
        ("completed", 110, 745, 370, "green", "Completed", copy["completed_detail"], copy["completed_note"]),
        ("empty", 505, 745, 370, "muted", "Empty", copy["empty_detail"], copy["empty_note"]),
        ("unavailable", 900, 745, 370, "amber", "Unavailable", copy["unavailable_detail"], copy["unavailable_note"]),
        ("failed", 1295, 745, 370, "red", "Failed", copy["failed_detail"], copy["failed_note"]),
    ]
    for node_id, x, y, width, color_key, title, detail, note in state_cards:
        color = COLORS[color_key]
        lines.append(
            node(
                node_id,
                [
                    box(x, y, width, 130, color["fill"], color["stroke"], 18),
                    xml_text("status", x + 26, y + 40, title),
                    xml_text("status-detail", x + 26, y + 78, detail),
                    xml_text("small", x + 26, y + 108, note),
                ],
            )
        )

    # Section 3: policy and application boundary.
    lines.append(box(70, 1000, 1660, 390, "#0c172a", "#344968", 28, "frame"))
    lines.append(xml_text("section", 110, 1050, copy["policy_section"]))
    lines.append(connector("policy-decision", "policy", "decision", "M930 1195 H1010", "purple"))
    lines.append(label_box(940, 1158, 70, copy["policy_to_decision"], COLORS["purple"]["stroke"]))

    lines.append(
        node(
            "policy",
            [
                box(110, 1100, 820, 210, "#352b58", COLORS["purple"]["stroke"], 22),
                xml_text("mono", 145, 1140, copy["policy_title"]),
                xml_text("small", 145, 1165, copy["policy_note"]),
                xml_text("row", 145, 1205, copy["rule_completed"]),
                box(700, 1180, 190, 34, "#101c31", COLORS["green"]["stroke"], 11, "label-bg"),
                xml_text("label", 795, 1203, copy["action_allow"], "middle"),
                xml_text("row", 145, 1245, copy["rule_invalid"]),
                box(700, 1220, 190, 34, "#101c31", COLORS["red"]["stroke"], 11, "label-bg"),
                xml_text("label", 795, 1243, copy["action_reject"], "middle"),
                xml_text("row", 145, 1285, copy["rule_degraded"]),
                box(650, 1260, 240, 34, "#101c31", COLORS["purple"]["stroke"], 11, "label-bg"),
                xml_text("label", 770, 1283, copy["action_review"], "middle"),
            ],
        )
    )
    lines.append(
        node(
            "decision",
            [
                box(1010, 1100, 650, 210, "#171b37", COLORS["purple"]["stroke"], 22),
                xml_text("mono", 1045, 1140, "VisitorPassDecision"),
                xml_text("card-title", 1045, 1170, copy["decision_title"]),
                box(1045, 1185, 145, 34, "#101c31", COLORS["green"]["stroke"], 11, "label-bg"),
                xml_text("label", 1117, 1208, copy["action_allow"], "middle"),
                box(1205, 1185, 145, 34, "#101c31", COLORS["red"]["stroke"], 11, "label-bg"),
                xml_text("label", 1277, 1208, copy["action_reject"], "middle"),
                box(1365, 1185, 245, 34, "#101c31", COLORS["purple"]["stroke"], 11, "label-bg"),
                xml_text("label", 1487, 1208, copy["action_review"], "middle"),
                xml_text("small", 1045, 1255, copy["decision_note"]),
                xml_text("small", 1045, 1285, copy["app_note"]),
            ],
        )
    )
    lines.append(box(110, 1330, 1550, 38, "#101c31", "#405777", 14, "label-bg"))
    lines.append(xml_text("body", 885, 1355, copy["footer"], "middle"))
    lines.append("</svg>")

    output = ASSET_ROOT / f"image-intelligence-barcode-boundary-flow-01-{locale}.svg"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(output)


if __name__ == "__main__":
    for locale, copy in LOCALES.items():
        write_svg(locale, copy)
