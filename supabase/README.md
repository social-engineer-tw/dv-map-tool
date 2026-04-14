# Supabase 設定說明

## 1. 建立資料表與 RLS

1. 到 Supabase 專案的 SQL Editor。
2. 貼上並執行 [schema.sql](/C:/Users/User/Desktop/dv-map-tool/supabase/schema.sql)。
3. 這會建立：
   - `site_sections`
   - `flow_stages`
   - `need_pages`
   - `resource_cards`
   - `hotlines`
4. 同時也會開啟 Row Level Security 與基本權限政策。

## 2. 設定登入角色

這個版本用 `app_metadata.role` 做角色判斷：

- `admin`
- `editor`

請在 Supabase Auth 建立使用者後，替帳號補上 `app_metadata`，例如：

```json
{
  "role": "admin"
}
```

## 3. 填入前端設定

在 [config/supabase.js](/C:/Users/User/Desktop/dv-map-tool/config/supabase.js) 填入：

```js
window.APP_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "YOUR-ANON-KEY"
};
```

## 4. 後臺網址

- `/admin/login/`
- `/admin/dashboard/`
- `/admin/home-content/`
- `/admin/flow-stages/`
- `/admin/need-pages/`
- `/admin/resource-cards/`
- `/admin/hotlines/`

## 5. 目前 MVP 範圍

已完成：

- Email / password 登入
- `admin` / `editor` 角色控管
- 五類公開內容的新增、編輯、排序、停用、發布
- 前台優先讀取 Supabase，沒有資料時回退本地假資料

第二版再做：

- 圖片上傳
- 版本比對 / 變更紀錄
- 更細的欄位驗證
- 刪除保護流程
