# 以前の図解（SVG）を、新しい図解の見た目にそろえる
#   python3 scripts/diagrams/restyle-svg.py [出力先フォルダ]   … 省略時は public/images/articles/diagrams を上書き
# ・紺の文字は墨色、紺の図形（番号の丸・帯・矢印）は金茶に
# ・背景・枠線を新しい図解と同じ色に
# ・上部の見出しは左寄せに
# ・下に「盆栽コレクション」を入れる（高さを足す）
# すでに直したもの（data-restyled がある）は飛ばす
import re, sys, glob, os

SRC = 'public/images/articles/diagrams'
OUT = sys.argv[1] if len(sys.argv) > 1 else SRC
INK, GOLD, PAPER, LINE = '#2c2a26', '#b8935a', '#faf7f0', '#d9d1c3'
DEEP_GOLD, BLUE = '#a07a42', '#4f86b5'
BRAND_H = 40

def restyle(s):
    if 'data-restyled' in s:
        return None
    m = re.search(r'viewBox="0 0 (\d+) (\d+)"', s)
    w, h = int(m.group(1)), int(m.group(2))

    # 紺：文字は墨色。番号の丸や線は金茶、帯は白い文字が読めるよう少し濃い金茶
    # 表の棒などですでに金茶を使っている図は、見分けがつくよう紺の帯を青に
    has_gold_bars = bool(re.search(r'<rect[^>]*fill="#b8935a"', s))
    def navy(tag):
        t = tag.group(0)
        if t.startswith('<text') or t.startswith('<tspan'):
            color = INK
        elif t.startswith('<rect') and 'fill="#1a365d"' in t:
            color = BLUE if has_gold_bars else DEEP_GOLD
        else:
            color = GOLD
        return t.replace('#1a365d', color)
    s = re.sub(r'<\w+[^>]*#1a365d[^>]*>', navy, s)
    s = s.replace('#22201c', INK).replace('#faf9f6', PAPER).replace('#ebe7df', LINE)

    # 上部の大きな見出し（最初の text で、上から70px以内・28px以上）を左寄せに
    def title(mt):
        t = mt.group(0)
        y = re.search(r'\by="([\d.]+)"', t); fs = re.search(r'font-size="(\d+)"', t)
        if not (y and fs and float(y.group(1)) <= 70 and int(fs.group(1)) >= 28):
            return t
        t = re.sub(r'\s*text-anchor="middle"', '', t)
        return re.sub(r'\bx="[\d.]+"', 'x="24"', t, count=1)
    s = re.sub(r'<text[^>]*>', title, s, count=1)

    # 高さを足して、右下に「盆栽コレクション」
    nh = h + BRAND_H
    s = s.replace(f'viewBox="0 0 {w} {h}"', f'viewBox="0 0 {w} {nh}" data-restyled="1"', 1)
    s = re.sub(rf'<rect width="{w}" height="{h}" fill="{PAPER}"/>', f'<rect width="{w}" height="{nh}" fill="{PAPER}"/>', s, count=1)
    brand = f'<text x="{w - 24}" y="{nh - 16}" font-size="18" font-weight="500" fill="{GOLD}" text-anchor="end" letter-spacing="2">盆栽コレクション</text>'
    return s.replace('</svg>', brand + '</svg>')

os.makedirs(OUT, exist_ok=True)
done = 0
for f in sorted(glob.glob(os.path.join(SRC, '*.svg'))):
    s = open(f, encoding='utf-8').read()
    r = restyle(s)
    if r is None:
        continue
    open(os.path.join(OUT, os.path.basename(f)), 'w', encoding='utf-8').write(r)
    done += 1
print(f'{done} 枚を直しました')
