"""確認結果（verified_*.json / new_*.json）から、サイトに同梱するデータファイルを作る
- src/data/garden-updates.json: 管理画面のボタンで DB に反映する更新・追加の内容
- src/data/garden-verification.json: 非公開にする園の id、出典、確認日
方針A: 盆栽を扱う園だけを掲載する（実在しない・閉園・盆栽を扱わない園は非公開）
"""
import glob, json, os, re, sys, time, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = sys.argv[1]
TODAY = time.strftime('%Y-%m-%d')

TEXT_FIELDS = ['name', 'address', 'postal_code', 'phone', 'website_url', 'business_hours', 'access_info',
               'parking_info', 'owner_name', 'social_instagram', 'prefecture', 'city']
BOOL_FIELDS = ['experience_programs', 'online_sales']
# 名前・住所・都道府県・市区町村は消さない（必須項目）
CLEARABLE = [f for f in TEXT_FIELDS if f not in ('name', 'address', 'prefecture', 'city')] + BOOL_FIELDS + \
    ['closed_days', 'established_year', 'owner_message']

geo_cache = {}


def geocode(address):
    """国土地理院の住所検索で緯度経度を求める（番地まである住所のみ）"""
    if not address or not re.search(r'[0-9０-９]', address):
        return None
    if address in geo_cache:
        return geo_cache[address]
    url = 'https://msearch.gsi.go.jp/address-search/AddressSearch?q=' + urllib.parse.quote(address)
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            data = json.load(r)
        time.sleep(0.4)
        result = [round(data[0]['geometry']['coordinates'][1], 6), round(data[0]['geometry']['coordinates'][0], 6)] if data else None
    except Exception:
        result = None
    geo_cache[address] = result
    return result


def text(v):
    if v is None:
        return None
    v = str(v).strip()
    return v or None


def year(v):
    try:
        y = int(str(v)[:4])
        return y if 1600 < y <= int(TODAY[:4]) else None
    except Exception:
        return None


def is_bonsai(g, desc, specialties):
    return '盆栽' in f"{g.get('name', '')} {desc or ''} {' '.join(specialties or [])}"


def instagram(v):
    v = text(v)
    if not v or v.startswith('http'):
        return v
    handle = v.lstrip('@').strip('/')
    return f'https://www.instagram.com/{handle}/' if re.fullmatch(r'[A-Za-z0-9._]+', handle) else None


def key(name, prefecture):
    return f'{name}|{prefecture}'


updates, inserts, hidden = [], [], []
sources_by_id, sources_by_key = {}, {}
kept_names = set()
summary = {'kept': 0, 'hidden_not_found': 0, 'hidden_closed': 0, 'hidden_not_bonsai': 0, 'inserted': 0, 'skipped_duplicates': []}

for path in sorted(glob.glob(os.path.join(HERE, 'verified_*.json'))):
    for g in json.load(open(path)):
        status = g.get('status')
        if status in ('not_found', 'closed'):
            hidden.append(g['id'])
            summary['hidden_' + status] += 1
            continue
        if not is_bonsai(g, g.get('description_new'), g.get('specialties_confirmed')):
            hidden.append(g['id'])
            summary['hidden_not_bonsai'] += 1
            continue
        conf = g.get('confirmed') or {}
        clear = set(g.get('clear_fields') or []) | {'owner_message'}
        s = {}
        for f in TEXT_FIELDS:
            v = text(conf.get(f))
            if f == 'social_instagram':
                v = instagram(v)
            if v:
                s[f] = v
                clear.discard(f)
        for f in BOOL_FIELDS:
            if isinstance(conf.get(f), bool):
                s[f] = conf[f]
                clear.discard(f)
        if conf.get('closed_days'):
            cd = conf['closed_days']
            s['closed_days'] = cd if isinstance(cd, list) else [cd]
            clear.discard('closed_days')
        y = year(conf.get('established_year'))
        if y:
            s['established_year'] = y
            clear.discard('established_year')
        for f in sorted(clear & set(CLEARABLE)):
            s[f] = [] if f == 'closed_days' else (False if f in BOOL_FIELDS else None)
        if g.get('description_new'):
            s['description'] = g['description_new']
        s['specialties'] = g.get('specialties_confirmed') or []
        coords = geocode(text(conf.get('address')))
        s['latitude'], s['longitude'] = (coords if coords else (None, None))
        s['rating'] = None
        s['review_count'] = 0
        updates.append({'id': g['id'], 'set': s})
        sources_by_id[g['id']] = g.get('sources') or []
        kept_names.add(s.get('name') or g['name'])
        summary['kept'] += 1

for path in sorted(glob.glob(os.path.join(HERE, 'new_*.json'))):
    for g in json.load(open(path)):
        name, pref = text(g.get('name')), text(g.get('prefecture'))
        if not name or not pref or not g.get('sources'):
            continue
        if name in kept_names or key(name, pref) in sources_by_key:
            summary['skipped_duplicates'].append(name)
            continue
        coords = geocode(text(g.get('address')))
        row = {
            'name': name, 'prefecture': pref, 'city': text(g.get('city')),
            'address': text(g.get('address')) or f"{pref}{g.get('city') or ''}",
            'postal_code': text(g.get('postal_code')), 'phone': text(g.get('phone')),
            'website_url': text(g.get('website_url')), 'business_hours': text(g.get('business_hours')),
            'closed_days': g.get('closed_days') or [], 'access_info': text(g.get('access_info')),
            'specialties': g.get('specialties') or [], 'social_instagram': instagram(g.get('social_instagram')),
            'description': text(g.get('description')) or f"{pref}{g.get('city') or ''}にある盆栽園です。",
            'experience_programs': g['experience_programs'] if isinstance(g.get('experience_programs'), bool) else False,
            'online_sales': g['online_sales'] if isinstance(g.get('online_sales'), bool) else False,
            'latitude': coords[0] if coords else None, 'longitude': coords[1] if coords else None,
            'featured': False, 'review_count': 0,
        }
        inserts.append(row)
        sources_by_key[key(name, pref)] = g['sources']
        kept_names.add(name)
        summary['inserted'] += 1

data_dir = os.path.join(REPO, 'src', 'data')
os.makedirs(data_dir, exist_ok=True)
json.dump({'generatedAt': TODAY, 'updates': updates, 'inserts': inserts},
          open(os.path.join(data_dir, 'garden-updates.json'), 'w'), ensure_ascii=False, indent=1)
json.dump({'verifiedAt': TODAY, 'hiddenIds': sorted(hidden), 'sourcesById': sources_by_id, 'sourcesByKey': sources_by_key},
          open(os.path.join(data_dir, 'garden-verification.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(summary, ensure_ascii=False))
