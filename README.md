# 臺南家暴相對人服務導航

這個專案目前分成兩個部分：

1. 前台網站
   - 維持靜態純前端，適合部署到 GitHub Pages。
   - 預設讀取本地假資料。
   - 若已設定 Supabase，會優先讀取公開資料表內容。
2. 輕量型內容後臺 1.0
   - 提供內部工作人員登入後編輯首頁、流程、需求頁、資源卡與危機電話。
   - 使用 Supabase Auth + Database。
   - 先做最小可用版本，不含大型 CMS 功能。

## 專案結構

```text
dv-map-tool/
├─ index.html
├─ README.md
├─ config/
│  └─ supabase.js
├─ shared/
│  └─ supabase-client.js
├─ admin/
│  ├─ assets/
│  │  ├─ admin.css
│  │  └─ admin-app.js
│  ├─ login/
│  ├─ dashboard/
│  ├─ home-content/
│  ├─ flow-stages/
│  ├─ need-pages/
│  ├─ resource-cards/
│  └─ hotlines/
├─ src/
│  ├─ app.js
│  ├─ boot.js
│  ├─ data/
│  │  ├─ site-data.js
│  │  └─ public-content.js
│  └─ styles/
│     └─ main.css
└─ supabase/
   ├─ README.md
   └─ schema.sql
```

## 前台如何運作

1. [index.html](/C:/Users/User/Desktop/dv-map-tool/index.html) 先載入本地假資料。
2. [src/data/public-content.js](/C:/Users/User/Desktop/dv-map-tool/src/data/public-content.js) 會嘗試讀取 Supabase。
3. 如果 Supabase 有公開資料，前台就用資料庫內容。
4. 如果尚未設定或資料不存在，就回退到 [src/data/site-data.js](/C:/Users/User/Desktop/dv-map-tool/src/data/site-data.js)。

## 後臺頁面

- `/admin/login/`
- `/admin/dashboard/`
- `/admin/home-content/`
- `/admin/flow-stages/`
- `/admin/need-pages/`
- `/admin/resource-cards/`
- `/admin/hotlines/`

## 後臺 MVP 功能

已完成：

- Supabase email/password 登入
- `admin` / `editor` 角色判斷
- 未登入不可進入後臺
- 首頁內容單筆編輯
- 流程階段編輯與排序
- 需求頁編輯與排序
- 資源卡編輯與排序
- 危機電話編輯與排序
- 啟用 / 發布切換
- 前台重新整理即可讀到最新內容

尚未做：

- 圖片上傳
- 草稿版本比對
- 審核流程
- 刪除保護流程
- 細緻的欄位驗證與輸入提示

## Supabase 設定

請參考 [supabase/README.md](/C:/Users/User/Desktop/dv-map-tool/supabase/README.md)。

你至少需要完成：

1. 在 Supabase SQL Editor 執行 [supabase/schema.sql](/C:/Users/User/Desktop/dv-map-tool/supabase/schema.sql)
2. 建立 Auth 使用者
3. 在使用者 `app_metadata` 中設定 `role`
4. 在 [config/supabase.js](/C:/Users/User/Desktop/dv-map-tool/config/supabase.js) 填入專案連線資訊

## 本地預覽

這個專案目前不需要 Vite。

最簡單的預覽方式：

1. 打開 [index.html](/C:/Users/User/Desktop/dv-map-tool/index.html)
2. 若要進入後臺，打開 [admin/login/index.html](/C:/Users/User/Desktop/dv-map-tool/admin/login/index.html)

如果沒有 Supabase 設定：

- 前台會顯示本地假資料
- 後臺會提示尚未設定 Supabase
