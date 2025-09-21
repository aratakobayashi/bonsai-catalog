import Image from 'next/image'

export default function TestImagePage() {
  const svgImageUrl = "data:image/svg+xml;base64,CiAgICA8c3ZnIHdpZHRoPSI1MTIiIGhlaWdodD0iMzg0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgICA8ZGVmcz4KICAgICAgICA8bGluZWFyR3JhZGllbnQgaWQ9InNreUdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojODdDRUVCO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOThGQjk4O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJidWlsZGluZ0dyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRDJCNDhDO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOEI0NTEzO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgIDwvZGVmcz4KCiAgICAgIDwhLS0g6IOM5pmvIC0tPgogICAgICA8cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjM4NCIgZmlsbD0idXJsKCNza3lHcmFkaWVudCkiLz4KCiAgICAgIDwhLS0g5Zyw6Z2iIC0tPgogICAgICA8cmVjdCB4PSIwIiB5PSIyODAiIHdpZHRoPSI1MTIiIGhlaWdodD0iMTA0IiBmaWxsPSIjOTBFRTkwIi8+CgogICAgICA8IS0tIOW7uueJqSAtLT4KICAgICAgPHJlY3QgeD0iNTAiIHk9IjIwMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjYnVpbGRpbmdHcmFkaWVudCkiLz4KICAgICAgPHBvbHlnb24gcG9pbnRzPSI1MCwyMDAgMTUwLDE1MCAyNTAsMjAwIiBmaWxsPSIjOEI0NTEzIi8+CgogICAgICA8IS0tIOebhuagveOBruacqOOAhSAtLT4KICAgICAgPGNpcmNsZSBjeD0iMzUwIiBjeT0iMjUwIiByPSIzMCIgZmlsbD0iIzIyOEIyMiIvPgogICAgICA8cmVjdCB4PSIzNDUiIHk9IjI1MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjOEI0NTEzIi8+CgogICAgICA8Y2lyY2xlIGN4PSI0MDAiIGN5PSIyNjAiIHI9IjI1IiBmaWxsPSIjMzJDRDMyIi8+CiAgICAgIDxyZWN0IHg9IjM5NSIgeT0iMjYwIiB3aWR0aD0iMTAiIGhlaWdodD0iMjUiIGZpbGw9IiM4QjQ1MTMiLz4KCiAgICAgIDxjaXJjbGUgY3g9IjQyMCIgY3k9IjI0MCIgcj0iMjAiIGZpbGw9IiMyMjhCMjIiLz4KICAgICAgPHJlY3QgeD0iNDE3IiB5PSIyNDAiIHdpZHRoPSI2IiBoZWlnaHQ9IjIwIiBmaWxsPSIjOEI0NTEzIi8+CgogICAgICA8IS0tIOWwj+mBkyAtLT4KICAgICAgPHBhdGggZD0iTSAwIDMyMCBRIDI1NiAzMDAgNTEyIDMyMCIgc3Ryb2tlPSIjRDJCNDhDIiBzdHJva2Utd2lkdGg9IjIwIiBmaWxsPSJub25lIi8+CgogICAgICA8IS0tIOijhemjvueahOOBquimgee0oCAtLT4KICAgICAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMzIwIiByPSI4IiBmaWxsPSIjQTA1MjJEIi8+CiAgICAgIDxjaXJjbGUgY3g9IjE1MCIgY3k9IjMxMCIgcj0iNiIgZmlsbD0iI0EwNTIyRCIvPgogICAgICA8Y2lyY2xlIGN4PSIyMDAiIGN5PSIzMjUiIHI9IjciIGZpbGw9IiNBMDUyMkQiLz4KCiAgICAgIDwhLS0g44K/44Kk44OI44Or6IOM5pmvIC0tPgogICAgICA8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIzMDAiIGhlaWdodD0iNDAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC44KSIgcng9IjUiLz4KICAgICAgPHRleHQgeD0iMjAiIHk9IjM1IiBmb250LWZhbWlseT0ic2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMyRjRGNEYiPlRyYWRpdGlvbmFsIEJvbnNhaSBHYXJkZW48L3RleHQ+CiAgICA8L3N2Zz4KICA="

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI生成画像テスト</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">生成されたSVG画像</h2>
          <div className="border rounded-lg overflow-hidden">
            <img
              src={svgImageUrl}
              alt="AI生成盆栽園画像"
              className="w-full h-auto"
              style={{ maxWidth: "512px", height: "auto" }}
            />
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p><strong>画像形式:</strong> SVG (Base64エンコード)</p>
            <p><strong>画像サイズ:</strong> 512x384px</p>
            <p><strong>データ長:</strong> {svgImageUrl.length} 文字</p>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">画像の特徴:</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>美しいグラデーション背景（空から地面へ）</li>
              <li>伝統的な日本建築（茶色の建物と屋根）</li>
              <li>複数の盆栽の木（緑の円と茶色の幹）</li>
              <li>装飾的な小道と石の要素</li>
              <li>「Traditional Bonsai Garden」のタイトル</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}