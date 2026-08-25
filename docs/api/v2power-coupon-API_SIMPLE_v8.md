# V2Power 优惠券 - 接口文档

Base URL: `http://192.168.33.100:8088`
Content-Type: `application/json`（导入除外为 `multipart/form-data`）

---

### 1. 导入 CPO 的 Excel
`POST /coupon_api/admin/import`

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

### 2. 兑换 - 邮箱领真券
`POST /coupon_api/coupon/redeem`

**请求** `application/json`
| 字段 | 类型 | 必填 | 说明 | 示例 |
|---|---|---|---|---|
| email | string(email) | 是 | 收件邮箱 | `test@qq.com` |
| confirmed_email | string(email) | 是 | 确认邮箱，需与 email 完全一致 | `test@qq.com` |
| token | string | 是 | 印刷的 Token，如 `V2P-FJCMFOBX` | `V2P-KHWMYLOQ` |
| captcha_token | string | 是* | ⚠️ 人机验证票据（≠ site_key）：先 `GET /coupon_api/captcha/config` 取 `site_key` 渲染，再 `recaptcha=grecaptcha.getResponse()` / `hcaptcha=hcaptcha.getResponse()` 取**一次性票据**填此字段 / `none=""`；**不要直接填 `site_key`**，否则 `人机验证失败`；本地 test_mode 可填 `valid-mock-token`，真实环境用前端真票据 | `valid-mock-token` |

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

### 3. 获取单个二维码
`GET /coupon_api/admin/qr?token=V2P-XXXX`

**请求**
| 字段 | 位置 | 必填 | 说明 |
|---|---|---|---|
| token | query | 是 | Token |

**响应** `image/png` 二维码图片，内容即 token 字符串，可直接浏览器打开 `http://192.168.33.100:8088/coupon_api/admin/qr?token=V2P-KHWMYLOQ` 印刷

---

### 4. 批量下载二维码（ZIP）
`GET /coupon_api/admin/batch/{batchId}/qrs`

**请求**
| 字段 | 位置 | 必填 | 说明 |
|---|---|---|---|
| batchId | path | 是 | 导入时返回的 batch_id |

**响应** `application/zip` 文件名 `batch-{batchId}-qrs.zip`，内含 `V2P-XXXX.png`

---

### 5. 获取人机验证配置（前端必调）
`GET /coupon_api/captcha/config`

**响应**
| 字段 | 类型 | 说明 |
|---|---|---|
| code | int | 0 成功 |
| data.captcha_type | string | `none` / `recaptcha` / `hcaptcha` |
| data.site_key | string | 前端渲染用，`recaptcha` 对应 Google sitekey |
| data.enabled | boolean | 是否启用 |
| data.test_mode | boolean | 本地测试密钥时为 true |

示例（本地 recaptcha 测试）：
```json
{"code":0,"data":{"captcha_type":"recaptcha","site_key":"6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI","enabled":true,"test_mode":true,"test_token":"valid-mock-token-a1b2c3d4","test_hint":"此 test_token 已是真实可用票据，直接复制到 captcha_token 即可；也可 GET /coupon_api/captcha/test-token 每次取新票据"}}
```

**⚠️ 注意：`captcha_token` ≠ `site_key`**（`site_key` 是 config 返回的固定公钥，`captcha_token` 是 `grecaptcha.getResponse()` 的临时票据，填错必失败）

**`captcha_token` 获取方式**
1. `GET /coupon_api/captcha/config` 取 `captcha_type`/`site_key`
2. `none` → `captcha_token=""`
3. `recaptcha` → 前端 `<script src="https://www.google.com/recaptcha/api.js"></script>` + `<div class="g-recaptcha" data-sitekey="{site_key}"></div>`，`captcha_token = grecaptcha.getResponse()`
4. `hcaptcha` → 同理 `hcaptcha.getResponse()`
5. Apifox：本地测试密钥下填 `valid-mock-token` 通过，`fake-token-123` 失败，空串报 `请完成人机验证`
6. 快捷：`GET /coupon_api/captcha/test-token` 直接生成一个真实票据，或用 `GET /coupon_api/captcha/config` 返回的 `test_token`

---

**流程:** CPO 生成 Excel(仅兑换编码) → 2 导入得 Token → 印 Token 二维码 → 用户 `GET /coupon_api/captcha/config` 取验证配置 → 扫码在网站调 3 兑换（带 captcha_token）→ 邮箱收真券 → APP 钱包粘贴真券充值
