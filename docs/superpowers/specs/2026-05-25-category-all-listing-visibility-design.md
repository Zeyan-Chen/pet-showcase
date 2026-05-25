# Category All-Listing Visibility Design

- Date: 2026-05-25
- Owner: Codex
- Status: Draft approved for spec writing

## Summary

新增一個只作用在「主分類」層級的開關 `includeInAllListing`，中文語意為 `納入全部展示`。  
前台 `全部` 頁不再單純顯示所有已發布商品，而是只顯示：

- 商品狀態為 `published`
- 且商品所屬主分類的 `includeInAllListing = true`

細項分類不單獨設定這個開關，完全跟隨主分類。

## Goals

- 讓後台可控制哪些主分類商品會出現在前台 `全部`
- 讓 `周邊 / 設備 / 墊材` 這類分類可以存在於站內，但不混進 `全部`
- 保持目前兩層分類結構簡單，不把判斷拆到每個商品上

## Non-Goals

- 不新增商品層級的 `是否顯示於全部`
- 不讓細項分類單獨覆寫主分類規則
- 不改變分類頁、細項頁本身的顯示方式

## Product Rules

### Main Category

主分類新增欄位：

- `includeInAllListing: boolean`

規則：

- 只允許主分類設定此欄位
- 新增主分類時預設值為 `true`
- 細項分類不持有此欄位

### Child Category

細項分類不提供 `納入全部展示` 設定。  
細項底下商品是否出現在 `全部`，完全由它的主分類決定。

### Product Visibility

前台 `全部` 的商品來源改成：

1. 商品狀態為 `published`
2. 商品有合法主分類
3. 主分類的 `includeInAllListing = true`

因此：

- `守宮活體` 主分類開啟時，該主分類與其細項商品都可出現在 `全部`
- `周邊用品` 主分類關閉時，該主分類與其細項商品都不出現在 `全部`
- 即使不出現在 `全部`，該主分類頁與細項頁仍可正常瀏覽

## Admin Changes

### Category Form

後台主分類建立 / 編輯時新增欄位：

- `納入全部展示`

行為：

- 只有建立為主分類時才顯示
- 預設為 `開啟`
- 選擇某個上層主分類、建立細項時，不顯示此欄位

### Category List

後台分類列表新增狀態顯示：

- 主分類：顯示 `納入全部展示 / 不納入全部展示`
- 細項分類：顯示 `跟隨主分類`

這讓管理者能快速看出哪些分類會進 `全部`。

## Frontend Changes

### All Listing

前台首頁 `全部` 的查詢條件更新為依主分類過濾。  
原本若是所有已發布商品都顯示，之後會改成只顯示允許進入 `全部` 的主分類商品。

### Category Pages

主分類頁、細項頁查詢邏輯不變：

- 點主分類仍顯示該主分類商品
- 點細項仍顯示該細項商品

也就是說，`是否納入全部展示` 只影響 `全部`，不影響分類內頁本身。

## Data / API Changes

### Category Model

主分類資料新增：

- `includeInAllListing: boolean`

預設值：

- `true`

### Category API

建立 / 更新分類 API 需要支援：

- 主分類可寫入 `includeInAllListing`
- 細項建立時忽略或不接受這個欄位

### Product Query Logic

前台 `全部` 商品查詢需要 join / populate 主分類後再過濾：

- `product.mainCategory.includeInAllListing === true`

## Migration

既有主分類在 migration 後，`includeInAllListing` 一律補成 `true`。  
這樣現有守宮活體分類不會突然從 `全部` 消失。

既有細項不需要補任何新欄位。

## Edge Cases

- 若商品缺少合法主分類，不應進入 `全部`
- 若主分類被改成 `不納入全部展示`，其底下所有商品會立即從 `全部` 消失
- 若主分類重新切回 `納入全部展示`，其底下商品會重新出現在 `全部`

## Testing

- 建立主分類時，`納入全部展示` 預設為開啟
- 建立細項時，不顯示該開關
- 關閉某主分類後，該主分類與其細項商品不出現在 `全部`
- 關閉某主分類後，該主分類頁與細項頁仍可正常開啟
- 舊資料 migration 後，既有活體分類仍正常顯示於 `全部`
