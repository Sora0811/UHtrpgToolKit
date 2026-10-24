# UH TRPG 工具庫

以 Web 為基礎的 UH TRPG 小工具集合，供玩家與主持人使用。

## 結構

```
UHtrpg-Tools/
├─ index.html          # 工具庫入口頁
├─ README.md
├─ shared/             # 多個工具共用的程式碼
│  ├─ styles.css
│  └─ common.js
└─ tools/              # 每個工具一個獨立目錄
   ├─ example/         # 最小範例工具（驗證庫結構）
   │  ├─ index.html
   │  ├─ style.css
   │  └─ script.js
   └─ purchase-calculator/  # 購買計算器
      ├─ index.html
      ├─ style.css
      └─ script.js
```

## 設計原則（參見規格書 v0.1）

- `tools/<name>/` 下的每個工具都是獨立的 Web 應用程式。
- 工具必須能單獨開啟並正常運作，不依賴其他工具。
- 共用程式碼集中於 `shared/`，僅在實際出現重複需求時才抽取。
- 本庫本身不實作任何遊戲規則、公式、帳號、同步或外部服務。

## 單獨拆分工具

每個工具都設計為可分離。若要將單一工具獨立成新專案：

1. 複製 `tools/<工具名>/` 到新專案根目錄。
2. 若工具使用了共用程式碼，將 `shared/` 中需要的檔案一併複製，並更新 HTML/JS 中的相對路徑（例如 `../../shared/styles.css` → `./shared/styles.css`）。
3. 若工具從庫中移除，更新入口頁 `index.html` 的連結。
4. 驗證拆分後的工具能獨立開啟並在桌面與行動裝置正常運作。

工具之間互不依賴，也不依賴庫的頁面結構，因此拆分不會破壞功能。不引用 `shared/` 的工具可直接移動。

## 新增工具

1. 建立 `tools/<工具名>/` 並放入自己的 `index.html`。
2. 僅在需要時重用 `shared/`，保持工具獨立可執行。
3. 在根目錄 `index.html` 加入連結。
4. 在桌面與行動裝置尺寸下驗證。