// 「あなたの一鉢」の見本の絵（選んだ樹・鉢の色と形・仕上げを、線と面で描く）。実際の商品の見た目とは異なる
import { COLOR_OPTIONS, type KumiState } from '@/lib/kumiawase'

const PINES = ['goyomatsu', 'kuromatsu', 'akamatsu', 'shimpaku']
const FLOWERS = ['sakura', 'chojubai', 'ume', 'satsuki', 'himeringo']
const BERRIES = ['nanten', 'mimono']

function Foliage({ tree }: { tree: string | null }) {
  const dark = tree && PINES.includes(tree)
  const fill = tree === 'momiji' ? '#b5523b' : dark ? '#3f5a3c' : '#5f7d4a'
  const dots = tree && FLOWERS.includes(tree) ? '#e6a3b0' : tree && BERRIES.includes(tree) ? '#b8352b' : null
  return (
    <g>
      <path d="M100 112 C98 96 92 86 82 76 M100 100 C104 88 112 80 122 72 M100 112 C101 100 100 90 100 78" stroke="#6b5641" strokeWidth="6" strokeLinecap="round" fill="none" />
      <ellipse cx="80" cy="68" rx="30" ry="15" fill={fill} />
      <ellipse cx="124" cy="62" rx="28" ry="14" fill={fill} />
      <ellipse cx="102" cy="48" rx="26" ry="14" fill={fill} />
      {dots && [
        [70, 64], [86, 72], [96, 60], [112, 66], [128, 58], [138, 66], [104, 44], [92, 48],
      ].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3.2" fill={dots} />)}
    </g>
  )
}

export function PotPreview({ state, className = '' }: { state: KumiState; className?: string }) {
  const color = COLOR_OPTIONS.find(o => o.value === state.color)
  const potFill = color?.swatch ?? '#ddd6ca'
  const potStroke = state.color === 'white' ? '#b9b2a6' : 'none'
  const fin = new Set(state.finishes)
  const kokedama = state.tree === 'kokedama'
  const shape = state.shape

  // 鉢の口（土の高さ）
  const soilY = shape === 'shallow' ? 120 : 112
  return (
    <svg viewBox="0 0 200 170" className={className} role="img" aria-label="選んだ組み合わせの見本の絵">
      {fin.has('saucer') && <ellipse cx="100" cy="156" rx={shape === 'shallow' ? 78 : 62} ry="7" fill="#c9c1b4" />}
      {kokedama ? (
        <>
          {/* 苔玉：苔の玉と器 */}
          <path d="M58 148 L142 148 L134 158 L66 158 Z" fill={potFill} stroke={potStroke} />
          <g transform="translate(0 22)"><Foliage tree={null} /></g>
          <circle cx="100" cy="122" r="28" fill="#5c7a3f" />
          <path d="M80 112 Q100 102 120 112" stroke="#7d9a55" strokeWidth="3" fill="none" />
        </>
      ) : (
        <>
          <Foliage tree={state.tree} />
          {/* 鉢の形 */}
          {shape === 'round' && <path d={`M52 ${soilY} L148 ${soilY} C146 140 128 152 100 152 C72 152 54 140 52 ${soilY} Z`} fill={potFill} stroke={potStroke} />}
          {shape === 'square' && (
            <>
              <rect x="50" y={soilY} width="100" height="34" fill={potFill} stroke={potStroke} />
              <rect x="56" y="146" width="12" height="6" fill={potFill} />
              <rect x="132" y="146" width="12" height="6" fill={potFill} />
            </>
          )}
          {shape === 'shallow' && (
            <>
              <path d={`M30 ${soilY} L170 ${soilY} L162 142 L38 142 Z`} fill={potFill} stroke={potStroke} />
              <rect x="44" y="142" width="12" height="6" fill={potFill} />
              <rect x="144" y="142" width="12" height="6" fill={potFill} />
            </>
          )}
          {!shape && <path d={`M54 ${soilY} L146 ${soilY} L138 150 L62 150 Z`} fill={potFill} stroke={potStroke} />}
          {/* 土の表面の仕上げ */}
          <rect x={shape === 'shallow' ? 34 : 56} y={soilY - 4} width={shape === 'shallow' ? 132 : 88} height="5" rx="2.5" fill={fin.has('moss') ? '#6f8f45' : fin.has('sand') ? '#e3dccd' : '#7a6650'} />
          {fin.has('sand') && fin.has('moss') && <rect x="112" y={soilY - 4} width="30" height="5" rx="2.5" fill="#e3dccd" />}
          {fin.has('stone') && <path d={`M70 ${soilY - 2} L76 ${soilY - 14} L90 ${soilY - 18} L98 ${soilY - 8} L96 ${soilY - 2} Z`} fill="#8d8a84" />}
        </>
      )}
      {fin.has('wrap') && (
        <g fill="none" stroke="#86683a" strokeWidth="3">
          <path d="M150 34 q12 -10 18 0 q-12 10 -18 0 Z" />
          <path d="M150 34 q-12 -10 -18 0 q12 10 18 0 Z" />
          <path d="M150 34 l-6 16 M150 34 l6 16" />
        </g>
      )}
    </svg>
  )
}
