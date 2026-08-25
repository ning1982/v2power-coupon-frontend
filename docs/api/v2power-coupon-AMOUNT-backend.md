# 面额（Voucher Amount）后端需求

> 状态：待后端实现。前端侧已就绪，见 `src/lib/amount.ts`。
> 优先级：**P0**（转化核心 —— 用户交出邮箱的前提是明确"能换到什么"）。

## 背景

兑换页前端需要展示券面额（如 "Claim your £10 charging credit"）以建立价值交换、提升转化。当前 API v8 无任何面额字段，前端无法从任何接口获知一张券的面额。三 AI 产品复审判定：无面额时转化率预计下降 25%~35%。

## 需求

### 1. import 接口支持「面额」列（P0，成本最低）

`POST /coupon_api/admin/import`（multipart/form-data）

- Excel 增加**第 2 列「面额」**（可选，单位 £，整数或一位小数），第 1 列「兑换编码」保持不变。
- 表头约定：第 1 列 `兑换编码`，第 2 列 `面额`。
- 后端按 token 存储 `amount` 映射；某行无面额则该项 amount 为空。
- 响应结构不变（`data.batch_id` / `imported` / `skipped` / `tokens`）。

示例 Excel：
```
兑换编码        面额
V2P-KHWMYLOQ   10
V2P-FJCMFOBX   10
V2P-86BG1RY    5.5
V2P-XXXXXXXX   (空，无面额)
```

### 2. 二维码注入面额（P0）

`GET /coupon_api/admin/qr?token=...` 及 `GET /coupon_api/admin/batch/{id}/qrs`（ZIP）

- 生成的二维码内容从纯 token 改为**带面额的完整 URL**：
  - 有面额：`https://coupon.v2power.com/coupon/?t=V2P-XXXX&amt=10`
  - 无面额：`https://coupon.v2power.com/coupon/?t=V2P-XXXX`（不注入 amt）

### 3. （增强，可选）券信息查询接口

`GET /coupon_api/coupon/info?token=V2P-XXXX`

```json
{"code":0,"data":{"amount":10,"redeemed":false,"expires_at":"2026-12-31"}}
```

- 用途：前端可在提交前预拦截「已兑换」券（不用等提交才吃 E102），并作为面额的**权威来源**。
- 若实现此接口，前端将优先用它查面额，URL 参数 `amt` 降级为兜底。

## 前端约定（已实现，无需再改）

- 读 URL `?t=` / `?token=` 作为 token，`?amt=` / `?amount=` 作为面额。
- `parseAmount()` 做防御性校验（`Number.isFinite && > 0`），非法/缺失返回 `null` → 走降级文案 "Claim your exclusive charging credit"。
- 面额展示在 H1（价值主张位置），不塞进 chip。

## 验收标准

1. 导入含面额列的 Excel → 生成二维码，扫码落到的 URL 带 `&amt=`。
2. 无面额券的二维码 URL 不带 amt。
3. （若做 info 接口）`coupon/info?token=已兑换券` 返回 `redeemed:true`。
