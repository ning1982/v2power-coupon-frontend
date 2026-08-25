# V2Power Voucher 后台管理 — 后端需求

> 状态：待后端实现。前端侧（coupon 兑换页 + 后台管理页）已按此契约设计。
> 优先级：**#0 鉴权为 P0 安全阻断**；#1/#2 面额为转化 P0；#3/#4 为后台主视图依赖。

## 背景

运营需要一个后台管理 vouchers：导入 Excel（含面额 + 批次名称）、查看批次、查兑换状态、下二维码、排障（按 token 搜券）。

现有 API v8 的 admin 能力仅 3 个（import / qr / batch-qrs），**无鉴权、无批次列表、无券详情、无面额**。本文件补齐。

---

## #0 鉴权（P0 安全阻断，缺则不可上线）

所有 `/coupon_api/admin/*` 接口**必须强制鉴权**，未认证返回 401，无权限返回 403。

- 方案（任选，建议 HttpOnly Session + CSRF token）：
  - `POST /coupon_api/admin/login` → 设置 HttpOnly session cookie + CSRF token
  - `POST /coupon_api/admin/logout`
  - 或 OAuth2 / JWT（Access + Refresh 双 token）
- **RBAC**：区分管理员（导入/作废）与只读运营（查看/下载）。
- 前端约定：axios/fetch 拦截器统一注入鉴权头；401 自动跳登录页。
- **审计**：导入、下载、作废等敏感操作记录操作人/IP/时间。

## #1 import 接口扩展：面额 + 批次名称（P0）

`POST /coupon_api/admin/import`（multipart/form-data）

新增字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| file | file | 是 | Excel，第 1 列「兑换编码」，第 2 列「面额」（可选，£） |
| batch_name | string | **是** | 批次业务名称（如 `202608-BP夏季促销`），列表辨识用 |
| file_hash | string | 否 | 可选，幂等去重 |

Excel 表头：第 1 列 `兑换编码`，第 2 列 `面额`。

响应在原有 `batch_id/imported/skipped/tokens` 基础上增加：
- `data.skipped_details`：跳过明细数组 `[{row, token, reason}]`（Vera：导入失败黑盒问题）

## #2 二维码注入面额（P0）

`GET /coupon_api/admin/qr?token=...` 及 `GET /coupon_api/admin/batch/{id}/qrs`（ZIP）

二维码内容从纯 token 改为带面额完整 URL：
- 有面额：`https://coupon.v2power.com/coupon/?t=V2P-XXXX&amt=10`
- 无面额：`https://coupon.v2power.com/coupon/?t=V2P-XXXX`

## #3 批次列表（后台主视图）

`GET /coupon_api/admin/batches?page=1&size=20`

```json
{"code":0,"data":{"total":3,"items":[
  {"batch_id":"a6b47e1f...","batch_name":"202608-BP夏季促销","created_at":"2026-08-25T14:32:00Z",
   "voucher_count":500,"redeemed_count":214,"amount":10}
]}}
```

## #4 批次详情（后台详情视图）

`GET /coupon_api/admin/batch/{batchId}?page=1&size=100&status=all|redeemed|pending&q=V2P-`

- **`status`** 参数：按兑换状态筛选（Mason：契约缺过滤参数，阻断分页下筛选）。
- **`q`** 参数：按 token 前缀/模糊搜索（Vera：单券排障第一入口）。
- `vouchers[]` 每项含：`token`、`amount`、`status`(pending/redeemed)、`redeemed_email`(**脱敏**)、`redeemed_at`。

## #5 可选增强

- `GET /coupon_api/coupon/info?token=...` → `{amount, redeemed, expires_at}`（兑换页预拦截 + 面额权威来源）。
- `POST /coupon_api/admin/batch/{id}/void`（整批作废未兑换券，二次确认，Vera 风控止损）。
- `GET /coupon_api/admin/batch/{id}/csv`（导出 CSV 映射表：token/面额/兑换URL/QR文件名，印刷厂对位）。
- 异步导入：>1000 行返回 `job_id` + 轮询进度（Kai：大文件同步超时）。

## 安全要求（Kai 审查固化）

1. `redeemed_email` **后端序列化阶段脱敏**，严禁下发完整 PII。
2. token 格式严格白名单 `^[A-Za-z0-9\-]+$`（防 Excel 公式注入 `=`, `+`, `-`, `@`）。
3. 上传限制 MIME + 10MB。
4. 批量 ZIP 下载用短时 presigned URL，避免 token 凭证在 GET 查询参数泄露。

## 验收标准

1. 未登录访问任意 admin 接口 → 401。
2. 导入（含 batch_name + 面额列）→ 批次列表可见名称 + 面额。
3. 详情接口支持 `status`/`q` 筛选，返回脱敏邮箱 + redeemed_at。
4. 二维码 URL 带 `&amt=`（有面额时）。
