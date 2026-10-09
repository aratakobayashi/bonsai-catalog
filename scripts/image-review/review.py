"""商品画像の選び直し（docs/growth/image-review.md の手順で使う）

  python3 scripts/image-review/review.py fetch WORKDIR          # 未確認の商品の画像候補を本番から集める
  python3 scripts/image-review/review.py choose-sheets WORKDIR  # 候補を3枚ずつ並べた比較シート（HTML）を作る
  python3 scripts/image-review/review.py clean-sheets WORKDIR   # 選んだ画像を並べた「文字なし」判定用シートを作る
  python3 scripts/image-review/review.py apply WORKDIR          # 選んだ結果と判定を src/data に書き込む

比較シートの HTML は、Playwright などで画像（PNG）にしてから目で見て判定する。
WORKDIR には作業用のファイルを置く（リポジトリの外の一時フォルダ）。
"""
import glob
import html
import json
import os
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, 'src', 'data')
SITE = 'https://www.bonsai-collection.com'
STYLE = '<meta charset=utf-8><style>body{margin:0;font:bold 15px sans-serif;background:#fff}'


def load(path, default):
    return json.load(open(path)) if os.path.exists(path) else default


def fetch(work):
    items, offset = [], 0
    while True:
        for attempt in range(3):
            try:
                with urllib.request.urlopen(f'{SITE}/api/image-candidates?offset={offset}', timeout=90) as r:
                    data = json.load(r)
                break
            except Exception as error:  # 一時的な失敗はやり直す
                print('retry', offset, error)
                time.sleep(5)
        else:
            sys.exit('取得に失敗しました')
        items += data['items']
        offset += 8
        print('fetched', len(items), '/', data['pending'])
        if offset >= data['pending']:
            break
    json.dump(items, open(os.path.join(work, 'all.json'), 'w'), ensure_ascii=False)


def choose_sheets(work):
    items = [x for x in load(os.path.join(work, 'all.json'), []) if len(x['images']) > 1]
    os.makedirs(os.path.join(work, 'choose'), exist_ok=True)
    index = {}
    for s in range(0, len(items), 12):
        rows = ''
        for i, x in enumerate(items[s:s + 12]):
            n = s + i + 1
            index[n] = x['id']
            imgs = ''.join(f'<div class="c"><img src="{html.escape(u.replace("_ex=500x500", "_ex=200x200"))}"><b>{j + 1}</b></div>' for j, u in enumerate(x['images'][:3]))
            rows += f'<div class="r"><div class="t">#{n}</div>{imgs}</div>'
        open(os.path.join(work, 'choose', f'sheet{s // 12:03d}.html'), 'w').write(
            STYLE + '.r{display:flex;align-items:center;border-bottom:2px solid #999;padding:3px}.t{width:60px}.c{position:relative;margin-right:5px}.c img{width:170px;height:170px;object-fit:contain;background:#eee}.c b{position:absolute;left:2px;top:2px;background:#000;color:#fff;padding:0 5px}</style>' + rows)
    json.dump(index, open(os.path.join(work, 'choose', 'index.json'), 'w'))
    print('products', len(items))


def chosen_url(item, choices):
    return choices.get(item['id']) or (item['images'][0] if item['images'] else item['current'])


def merged_choices(work):
    # choose/choice_*.json（{"番号": 1〜3}）を商品 id → 画像 URL にする（1 は今のままなので含めない）
    index = load(os.path.join(work, 'choose', 'index.json'), {})
    items = {x['id']: x for x in load(os.path.join(work, 'all.json'), [])}
    picked = {}
    for f in glob.glob(os.path.join(work, 'choose', 'choice_*.json')):
        picked.update(json.load(open(f)))
    result = {}
    for n, pid in index.items():
        c = int(picked.get(n, 1))
        imgs = items[pid]['images']
        if c != 1 and 1 <= c <= len(imgs) and imgs[c - 1].startswith('https://thumbnail.image.rakuten.co.jp/'):
            result[pid] = imgs[c - 1]
    return result


def clean_sheets(work):
    choices = merged_choices(work)
    rows = [(x['id'], chosen_url(x, choices)) for x in load(os.path.join(work, 'all.json'), []) if chosen_url(x, choices)]
    os.makedirs(os.path.join(work, 'clean'), exist_ok=True)
    index = {}
    for s in range(0, len(rows), 20):
        cells = ''
        for i, (pid, u) in enumerate(rows[s:s + 20]):
            n = s + i + 1
            index[n] = pid
            cells += f'<div class="c"><img src="{html.escape(u.replace("_ex=500x500", "_ex=200x200"))}"><b>#{n}</b></div>'
        open(os.path.join(work, 'clean', f'sheet{s // 20:03d}.html'), 'w').write(
            STYLE + '.g{display:flex;flex-wrap:wrap;width:900px}.c{position:relative;margin:3px}.c img{width:170px;height:170px;object-fit:contain;background:#eee}.c b{position:absolute;left:2px;top:2px;background:#000;color:#fff;padding:0 5px}</style><div class=g>' + cells + '</div>')
    json.dump(index, open(os.path.join(work, 'clean', 'index.json'), 'w'))
    print('products', len(rows))


def apply(work):
    images_path = os.path.join(DATA, 'product-images.json')
    review_path = os.path.join(DATA, 'product-image-review.json')
    images = load(images_path, {})
    review = load(review_path, {'reviewed': [], 'labels': {}})
    images.update(merged_choices(work))
    index = load(os.path.join(work, 'clean', 'index.json'), {})
    for f in glob.glob(os.path.join(work, 'clean', 'clean_*.json')):
        for n, label in json.load(open(f)).items():
            if n in index and label in ('clean', 'minor', 'text'):
                review['labels'][index[n]] = label
    reviewed = set(review['reviewed']) | {x['id'] for x in load(os.path.join(work, 'all.json'), [])}
    review['reviewed'] = sorted(reviewed)
    review['labels'] = dict(sorted(review['labels'].items()))
    json.dump(dict(sorted(images.items())), open(images_path, 'w'), ensure_ascii=False, indent=1)
    json.dump(review, open(review_path, 'w'), ensure_ascii=False, indent=1)
    print('images', len(images), 'reviewed', len(review['reviewed']), 'labels', len(review['labels']))


if __name__ == '__main__':
    if len(sys.argv) != 3 or sys.argv[1] not in ('fetch', 'choose-sheets', 'clean-sheets', 'apply'):
        sys.exit(__doc__)
    os.makedirs(sys.argv[2], exist_ok=True)
    {'fetch': fetch, 'choose-sheets': choose_sheets, 'clean-sheets': clean_sheets, 'apply': apply}[sys.argv[1]](sys.argv[2])
