# V2Power 优惠券 - 接口文档（交差版）

Base URL: `http://192.168.33.100:8088`
Content-Type: `application/json`（导入除外为 `multipart/form-data`）

---

### 1. 健康检查
`GET /api/coupon/health`

**响应**
| 字段 | 类型 | 说明 |
|---|---|---|
| code | int | 0 成功 |
| data | string | `coupon service ok` |

示例：`{"code":0,"data":"coupon service ok"}`

---

### 2. 导入 CPO 的 Excel
`POST /api/admin/import`

**请求** `multipart/form-data`
| 字段 | 类型 | 必填 | 说明 | 示例 |
|---|---|---|---|---|
| file | file | 是 | Excel (.xls/.xlsx)，第1列为兑换编码，含表头 `兑换编码` | `兑换码列表.xls` |

**响应**
| 字段 | 类型 | 说明 |
|---|---|---|
| code | int | 0 成功，1 失败 |
| msg | string | 失败时错误信息 |
| data.batch_id | string | 批次ID，用于批量下载二维码 |
| data.imported | int | 本次导入条数 |
| data.skipped | int | 跳过已存在条数 |
| data.tokens | string[] | 生成的 Token 列表，二维码内容即 Token |

成功示例：
```json
{"code":0,"data":{"batch_id":"a6b47e1f860e488480618696bc84687c","imported":5,"skipped":0,"tokens":["V2P-KHWMYLOQ","V2P-FJCMFOBX","V2P-86BG1RY"]}}
```
失败示例：`{"code":1,"msg":"Excel 解析失败"}`

---

### 3. 兑换 - 邮箱领真券
`POST /api/coupon/redeem`

**请求** `application/json`
| 字段 | 类型 | 必填 | 说明 | 示例 |
|---|---|---|---|---|
| email | string(email) | 是 | 收件邮箱 | `test@qq.com` |
| confirmed_email | string(email) | 是 | 确认邮箱，需与 email 完全一致 | `test@qq.com` |
| token | string | 是 | 印刷的 Token，如 `V2P-FJCMFOBX` | `V2P-KHWMYLOQ` |
| captcha_token | string | 否 | 人机验证票据，本地 `none` 传 `""` 即可 | `""` |

**响应 成功**
| 字段 | 类型 | 说明 |
|---|---|---|
| code | int | 0 |
| data.email_sent | boolean | true |
| data.email | string | 脱敏后邮箱，如 `t***t@qq.com` |
| data.message | string | `已发送至您的邮箱，请查收` |

示例：`{"code":0,"data":{"email_sent":true,"email":"t***t@qq.com","message":"优惠码已发送至您的邮箱，请查收"}}` 并收到邮件 `coupon_code`（如 `RCDD9985290E854DA2ADD4`）

**响应 失败**
| code | msg | 场景 |
|---|---|---|
| 1 | Token不存在 | token 输错或未导入 |
| 1 | 该Token已被兑换 | 已领过 |
| 1 | 两次邮箱输入不一致 | confirmed_email 与 email 不同 |
| 1 | 人机验证失败 | captcha_token 错误（本地 none 不会） |
| 1 | 邮件发送失败 | SMTP 异常 |

---

### 4. 获取单个二维码
`GET /api/admin/qr?token=V2P-XXXX`

**请求**
| 字段 | 位置 | 必填 | 说明 |
|---|---|---|---|
| token | query | 是 | Token |

**响应** `image/png` 二维码图片，内容即 token 字符串，可直接浏览器打开 `http://192.168.33.100:8088/api/admin/qr?token=V2P-KHWMYLOQ` 印刷

**流程:** CPO 生成 Excel(仅兑换编码) → 2 导入得 Token → 印 Token 二维码 → 用户扫码在网站调 3 兑换 → 邮箱收真券 → APP 钱包粘贴真券充值
