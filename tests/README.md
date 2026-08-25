# Tests 说明（给非前端同学）

> 你看到的 tests/ 里那几个 .ts / .tsx 不是业务代码，是**自动化测试**。跑一遍就能验证前端逻辑对不对，不用手动点页面。

## 1. ts 是什么？

- **.ts = TypeScript**，就是带类型检查的 JavaScript，浏览器最终运行的是编译后的 JS。
- **.tsx = 带 React 组件的 TypeScript**，用来测页面渲染。
- 你不需要改这些文件，它们会随着 npm run test 自动执行，通过即代表逻辑符合 PRD/IA。

```bash
npm run test        # 跑一遍，49 个用例，约 5 秒
npm run test:watch  # 改代码时持续监听
```

当前已配置 vitest.config.ts + jsdom + @testing-library/react，已全部通过 49/49（覆盖率 92.05%）。

## 2. 目录结构

```
tests/
├── README.md              # 你正在看的这份说明
├── setup.ts               # 测试全局初始化（加载 jest-dom 断言）
└── unit/                  # 单元测试，9 个文件 49 个用例
    ├── validation.test.ts   # 表单校验（单 Email + Token + GDPR 勾选）7
    ├── errorMap.test.ts     # 后端错误码 E101/E102/E004 映射 12
    ├── coupon.test.ts       # API 封装（redeem 接口、payload 含 confirmed_email 兼容字段、非 JSON 兜底）8
    ├── storage.test.ts      # sessionStorage 草稿缓存与销毁 2
    ├── turnstile.test.tsx   # 人机验证（none 直通 / 无 sitekey 报错 / 有 sitekey 走 Verified）3
    ├── successPage.test.tsx # 成功页（history.state 防 URL 泄露、脱敏、Not received）4
    ├── helpPage.test.tsx    # 帮助页（FAQ + Privacy + WhatsApp）2
    ├── app.test.tsx         # 路由（/ → Redeem, /help → Help）2
    └── redeemPage.test.tsx  # 页面渲染（英文文案、?t= 预填、GDPR、E101/E102）9
```

## 3. 每个文件在测什么？

| 文件 | 对应 PRD/IA | 测了啥 | 失败意味着啥 |
|------|-------------|--------|--------------|
| validation.test.ts (7) | F-01-02 单 Email | 合法邮箱/转小写/非法拦截/空Token/Token去空格大写/未勾GDPR/可空captcha | 表单校验被改坏 |
| errorMap.test.ts (12) | 错误码规范 | E101/E102/E004 等映射为英文提示 + maskEmail | 提示文案丢了 |
| coupon.test.ts (8) | API v2 POST /api/coupon/redeem | payload 带 confirmed_email=email，成功/失败/非 JSON 分支，超时清理 | 联调会 400 |
| storage.test.ts (2) | IA P1 草稿缓存 | sessionStorage 存取、成功后销毁（公共设备安全） | 刷新丢数据或泄露 |
| turnstile.test.tsx (3) | 人机验证 | VITE_CAPTCHA=none 直通；无 sitekey 报 Turnstile failed to load；有 sitekey mock Verified | 验证组件挂了，生产需配 VITE_TURNSTILE_SITEKEY |
| successPage.test.tsx (4) | IA P2 成功页 | history.state 显示 masked 邮箱、防 URL 泄露、Not received 提示 | 成功页隐私泄露或文案丢了 |
| helpPage.test.tsx (2) | IA P4 帮助页 | FAQ + Privacy + WhatsApp 链接 | 帮助页挂了 |
| app.test.tsx (2) | 路由 | / → RedeemPage, /help → HelpPage | 路由挂了 |
| redeemPage.test.tsx (9) | IA P0-P1 | 单 Email 无 Confirm、?t= 预填、粘贴提示、GDPR 必勾、E101/E102 全局错误 | 表单或提交挂了 |

> 总计 49。

## 4. 常见问题

**Q: 需要手动改 .ts 吗？** 不用。业务改在 src/ 里，测试自动跑，npm run test 全绿即自测通过。

**Q: 后端 E004 captcha 报错和测试有关吗？** 无关。测试里 VITE_CAPTCHA=none 直通，前端发 captcha_token=""。真机联调失败是后端还没开 CAPTCHA_PROVIDER=none，让开发在 192.168.33.100:8088 关掉即可（生产需换成 VITE_TURNSTILE_SITEKEY）。

**Q: 想删掉 tests 可以吗？** 不建议。留着是给老板看的已自测证据，npm run build 不打包它们，不影响上线。

## 5. 验收方式

```bash
npm run test    # 期望： Test Files 9 passed, Tests 49 passed, Coverage 92.05%
npm run build   # 期望： vite build 成功，114 modules，dist/ 可 scp 到 Nginx
npm run dev     # 然后开 http://localhost:5173/?t=V2P-TEST1234 手动点一遍
```

有任何红色 FAIL 贴给我就行，不用读代码。
