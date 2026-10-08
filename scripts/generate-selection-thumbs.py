"""特集のサムネイル（サイトの配色に合わせた盆栽のイラスト）を SVG で生成する
使い方: python3 scripts/generate-selection-thumbs.py  → public/images/selections/*.svg
"""
import math, os, random

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'images', 'selections')
W, H = 800, 500
NAVY, GOLD, PAPER, INK = '#1a365d', '#b8935a', '#f7f4ee', '#2b2824'
TRUNK = '#5b4636'


def blob(cx, cy, rx, ry, color, opacity=1):
    return f'<ellipse cx="{cx:.0f}" cy="{cy:.0f}" rx="{rx:.0f}" ry="{ry:.0f}" fill="{color}" opacity="{opacity}"/>'


def pad(cx, cy, w, h, dark, light):
    """松のような雲形の葉の塊（濃い色の上に明るい色を重ねる）"""
    parts = [blob(cx, cy + h * 0.12, w * 0.55, h * 0.5, dark)]
    for dx in (-0.32, 0, 0.32):
        parts.append(blob(cx + w * dx, cy - h * 0.05, w * 0.26, h * 0.42, dark))
    for dx in (-0.22, 0.14):
        parts.append(blob(cx + w * dx, cy - h * 0.2, w * 0.2, h * 0.26, light, 0.9))
    return ''.join(parts)


def pot(cx, top, w, h, color, rim=None):
    rim = rim or color
    x0, x1 = cx - w / 2, cx + w / 2
    inset = w * 0.08
    body = f'<path d="M{x0:.0f},{top:.0f} L{x1:.0f},{top:.0f} L{x1 - inset:.0f},{top + h:.0f} L{x0 + inset:.0f},{top + h:.0f} Z" fill="{color}"/>'
    lip = f'<rect x="{x0 - 8:.0f}" y="{top - 10:.0f}" width="{w + 16:.0f}" height="14" rx="4" fill="{rim}"/>'
    feet = ''.join(f'<rect x="{x:.0f}" y="{top + h:.0f}" width="18" height="8" rx="2" fill="{rim}"/>' for x in (x0 + inset + 6, x1 - inset - 24))
    return body + lip + feet


def stand(cx, y, w):
    return (f'<rect x="{cx - w / 2:.0f}" y="{y:.0f}" width="{w:.0f}" height="12" rx="3" fill="#7d6238"/>'
            f'<rect x="{cx - w / 2 + 14:.0f}" y="{y + 12:.0f}" width="12" height="22" fill="#6a5230"/>'
            f'<rect x="{cx + w / 2 - 26:.0f}" y="{y + 12:.0f}" width="12" height="22" fill="#6a5230"/>')


def trunk(cx, base, height, lean=1, width=26):
    """S字に曲がった幹"""
    b = base
    p = (f'M{cx - width / 2:.0f},{b:.0f} '
         f'C{cx - width / 2 - 30 * lean:.0f},{b - height * 0.35:.0f} {cx + 40 * lean:.0f},{b - height * 0.5:.0f} {cx + 10 * lean:.0f},{b - height * 0.75:.0f} '
         f'C{cx - 10 * lean:.0f},{b - height * 0.9:.0f} {cx + 6 * lean:.0f},{b - height:.0f} {cx + 2 * lean:.0f},{b - height:.0f} '
         f'L{cx + 14 * lean:.0f},{b - height:.0f} '
         f'C{cx + 22 * lean:.0f},{b - height * 0.9:.0f} {cx + 6 * lean:.0f},{b - height * 0.78:.0f} {cx + 26 * lean:.0f},{b - height * 0.7:.0f} '
         f'C{cx + 60 * lean:.0f},{b - height * 0.5:.0f} {cx - 10 * lean:.0f},{b - height * 0.32:.0f} {cx + width / 2:.0f},{b:.0f} Z')
    return f'<path d="{p}" fill="{TRUNK}"/>'


def branch(x1, y1, x2, y2, w=8):
    return f'<path d="M{x1:.0f},{y1:.0f} Q{(x1 + x2) / 2:.0f},{min(y1, y2) - 20:.0f} {x2:.0f},{y2:.0f}" stroke="{TRUNK}" stroke-width="{w}" fill="none" stroke-linecap="round"/>'


def dots(cx, cy, rx, ry, color, n, r=(5, 9), seed=1):
    rnd = random.Random(seed)
    out = []
    for _ in range(n):
        a, d = rnd.random() * math.tau, math.sqrt(rnd.random())
        out.append(f'<circle cx="{cx + math.cos(a) * rx * d:.0f}" cy="{cy + math.sin(a) * ry * d:.0f}" r="{rnd.uniform(*r):.1f}" fill="{color}"/>')
    return ''.join(out)


def frame(bg, deco=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img">'
            f'<rect width="{W}" height="{H}" fill="{bg}"/>{deco}')


def ground(y=430):
    return f'<rect x="0" y="{y}" width="{W}" height="{H - y}" fill="#ece3d2"/>'


def tree_classic(cx, base, foliage_dark, foliage_light, scale=1.0, lean=1):
    h = 190 * scale
    s = trunk(cx, base, h, lean, 28 * scale)
    top = base - h
    s += branch(cx + 10 * lean, base - h * 0.62, cx - 110 * scale * lean, base - h * 0.62, 9 * scale)
    s += branch(cx + 16 * lean, base - h * 0.8, cx + 120 * scale * lean, base - h * 0.78, 8 * scale)
    s += pad(cx - 120 * scale * lean, base - h * 0.66, 150 * scale, 70 * scale, foliage_dark, foliage_light)
    s += pad(cx + 125 * scale * lean, base - h * 0.84, 140 * scale, 64 * scale, foliage_dark, foliage_light)
    s += pad(cx + 8 * lean, top - 18 * scale, 190 * scale, 84 * scale, foliage_dark, foliage_light)
    return s


def scene(name, svg):
    with open(os.path.join(OUT, f'{name}.svg'), 'w') as f:
        f.write(svg + '</svg>')


os.makedirs(OUT, exist_ok=True)
PINE_D, PINE_L = '#2f5d50', '#4f7f6a'

# 正月：金の日の出と松
s = frame('#f6efe2', f'<circle cx="590" cy="150" r="96" fill="{GOLD}" opacity="0.85"/>' + ground())
s += stand(400, 418, 300) + pot(400, 362, 210, 50, NAVY) + tree_classic(400, 356, PINE_D, PINE_L, 1.0)
s += f'<path d="M150,120 q40,-40 80,0 q40,40 80,0" stroke="{GOLD}" stroke-width="4" fill="none"/>'
scene('new-year-bonsai', s)

# はじめての一鉢：手のひらサイズの小さな盆栽と芽
s = frame('#f3ebdd', f'<circle cx="400" cy="250" r="170" fill="#ece1cc"/>' + ground())
s += stand(400, 418, 220) + pot(400, 378, 130, 34, '#8a5a3c') + tree_classic(400, 372, '#4c7a4a', '#7ba05b', 0.62)
s += f'<path d="M600,420 q-6,-40 10,-70" stroke="#4c7a4a" stroke-width="5" fill="none"/>' + blob(622, 346, 18, 9, '#7ba05b') + blob(596, 362, 14, 7, '#7ba05b')
scene('beginner-mini-bonsai', s)

# 贈り物：金のリボンの箱と花もの
s = frame('#f6efe2', ground())
s += f'<rect x="520" y="300" width="160" height="130" rx="6" fill="{NAVY}"/><rect x="590" y="300" width="20" height="130" fill="{GOLD}"/><rect x="520" y="352" width="160" height="18" fill="{GOLD}"/>'
s += f'<path d="M600,300 q-46,-46 -60,-6 q14,22 60,6 q46,-46 60,-6 q-14,22 -60,6" fill="{GOLD}"/>'
s += pot(330, 372, 190, 50, '#e9e3d8', NAVY) + tree_classic(330, 366, '#4c7a4a', '#7ba05b', 0.85)
s += dots(330, 170, 150, 70, '#e8a7b5', 40, seed=3) + dots(330, 170, 150, 70, '#f6d3da', 22, (3, 6), seed=4)
scene('bonsai-gift', s)

# 室内：窓辺の光とガジュマル
s = frame('#f3ebdd')
s += f'<rect x="440" y="60" width="280" height="300" rx="6" fill="#fbf8f2" stroke="{NAVY}" stroke-width="10"/><line x1="580" y1="60" x2="580" y2="360" stroke="{NAVY}" stroke-width="8"/><line x1="440" y1="210" x2="720" y2="210" stroke="{NAVY}" stroke-width="8"/>'
s += f'<path d="M440,360 L300,470 L620,470 L720,360 Z" fill="#fff6e0" opacity="0.7"/>' + f'<rect x="0" y="400" width="{W}" height="100" fill="#d9c9ab"/>'
s += pot(320, 352, 180, 48, '#e9e3d8', NAVY)
s += (f'<path d="M290,352 C280,320 300,300 310,280 C300,260 320,240 330,250 C350,236 360,262 350,280 C362,300 370,330 360,352 Z" fill="#8a6a4f"/>'
      f'<path d="M300,352 q-20,-10 -26,4 M352,352 q20,-12 28,2" stroke="#8a6a4f" stroke-width="7" fill="none"/>')
s += blob(320, 200, 110, 62, '#3f7a52') + blob(260, 222, 56, 36, '#3f7a52') + blob(380, 220, 60, 36, '#3f7a52') + blob(300, 186, 50, 30, '#5f9a6a') + blob(352, 196, 40, 24, '#5f9a6a')
scene('indoor-bonsai', s)

# 3,000円以下：小さな盆栽と金の硬貨
s = frame('#f6efe2', f'<circle cx="400" cy="260" r="160" fill="#ece1cc"/>' + ground())
s += stand(360, 418, 220) + pot(360, 378, 130, 34, NAVY) + tree_classic(360, 372, PINE_D, PINE_L, 0.6)
for i in range(4):
    s += f'<ellipse cx="590" cy="{420 - i * 16}" rx="52" ry="16" fill="{GOLD}" stroke="#9a7a47" stroke-width="3"/>'
s += f'<circle cx="650" cy="300" r="34" fill="{GOLD}" stroke="#9a7a47" stroke-width="3"/><circle cx="650" cy="300" r="20" fill="none" stroke="#9a7a47" stroke-width="3"/>'
scene('bonsai-under-3000', s)

# 紅葉：もみじと舞う葉
s = frame('#f6efe2', ground())
s += stand(400, 418, 300) + pot(400, 364, 200, 48, '#8a5a3c') + tree_classic(400, 358, '#b8442e', '#e07a3c', 0.95, -1)
rnd = random.Random(7)
for _ in range(9):
    x, y = rnd.uniform(80, 720), rnd.uniform(60, 400)
    s += f'<path d="M{x:.0f},{y:.0f} l8,-14 l6,10 l12,-4 l-6,12 l10,8 l-14,2 l0,12 l-10,-8 l-10,8 l0,-12 l-14,-2 l10,-8 l-6,-12 l12,4 Z" fill="{rnd.choice(["#b8442e", "#e07a3c", GOLD])}" opacity="0.85" transform="rotate({rnd.uniform(-40, 40):.0f} {x:.0f} {y:.0f}) scale(0.9)"/>'
scene('autumn-leaves-bonsai', s)

# 花もの：花の咲いた枝
s = frame('#f6efe2', f'<circle cx="200" cy="140" r="80" fill="#f3d9de" opacity="0.7"/>' + ground())
s += stand(400, 418, 300) + pot(400, 364, 200, 48, '#e9e3d8', NAVY) + tree_classic(400, 358, '#6f8f5a', '#94b07a', 0.95)
s += dots(400, 200, 220, 110, '#e8a7b5', 70, (5, 9), seed=11) + dots(400, 200, 220, 110, '#f8dfe4', 40, (3, 6), seed=12)
scene('flowering-bonsai', s)

# 実もの：赤い実
s = frame('#f6efe2', ground())
s += stand(400, 418, 300) + pot(400, 364, 200, 48, NAVY) + tree_classic(400, 358, '#4c7a4a', '#7ba05b', 0.95, -1)
s += dots(400, 210, 220, 110, '#c0392b', 34, (7, 11), seed=21) + dots(400, 210, 220, 110, '#e67e22', 12, (6, 9), seed=22)
scene('fruit-bonsai', s)

# 松柏類：段になった松の葉
s = frame('#f3ebdd', f'<circle cx="610" cy="130" r="70" fill="#e4d6bb"/>' + ground())
s += stand(400, 418, 320) + pot(400, 366, 230, 46, '#8a5a3c') + tree_classic(400, 360, PINE_D, PINE_L, 1.05)
s += f'<path d="M398,330 l-6,-60 M406,300 l10,-50" stroke="#e9e3d8" stroke-width="5" opacity="0.8"/>'
scene('evergreen-bonsai', s)

# お祝い：金の扇と松
s = frame('#f6efe2', ground())
s += f'<path d="M560,330 L420,110 A260,260 0 0 1 700,110 Z" fill="{GOLD}" opacity="0.35"/>'
for a in range(-60, 61, 20):
    r = math.radians(a - 90)
    s += f'<line x1="560" y1="330" x2="{560 + 250 * math.cos(r):.0f}" y2="{330 + 250 * math.sin(r):.0f}" stroke="{GOLD}" stroke-width="3" opacity="0.6"/>'
s += stand(340, 418, 280) + pot(340, 364, 200, 48, NAVY, GOLD) + tree_classic(340, 358, PINE_D, PINE_L, 0.95)
s += f'<path d="M120,110 q30,-30 60,0 q30,30 60,0" stroke="#c0392b" stroke-width="4" fill="none"/>'
scene('celebration-bonsai', s)

# 道具：はさみ・鉢・土
s = frame('#f3ebdd', f'<rect x="0" y="390" width="{W}" height="110" fill="#e4d6bb"/>')
s += pot(240, 320, 220, 70, NAVY) + f'<ellipse cx="240" cy="312" rx="112" ry="12" fill="#6b4f3a"/>'
s += f'<path d="M430,250 l120,0 l20,150 l-160,0 Z" fill="#c9b48e"/><path d="M430,250 l120,0 l-10,-24 l-100,0 Z" fill="#b39b70"/>' + dots(490, 330, 50, 40, '#8a6a4f', 18, (3, 5), seed=31)
s += (f'<g transform="translate(640 250) rotate(25)"><rect x="-6" y="-120" width="12" height="120" rx="6" fill="#9aa3ad"/><rect x="6" y="-120" width="12" height="120" rx="6" fill="#b8c0c8"/>'
      f'<circle cx="-10" cy="22" r="26" fill="none" stroke="{NAVY}" stroke-width="12"/><circle cx="32" cy="22" r="26" fill="none" stroke="{NAVY}" stroke-width="12"/></g>')
scene('starter-tools', s)
print('ok')
