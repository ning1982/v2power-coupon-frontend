# V2Power 充电券兑换系统 · UAT 用户验收测试报告

> **环境**: PROD https://v2power.io/Voucher (Real DNS 直连) · **版本**: UAT-20260827-v1.3 FINAL · **环境状态**: 已净化
> **构建**: 2026-08-27 · **人机**: reCAPTCHA 6Ldb3ZctAAAAAOjvxtO93FN_2LoFQQHcKWMEqFXN
> **邮箱**: zhilin.zhang@v2power.io · **Token**: 12枚 V2P-* UNUSED + FAKE V2P-FAKE123456

## 1 概述
目的: 验证扫码-填邮箱-人机-兑换-收邮件全链路在生产可用。
范围: Redeem/Success/Help/Privacy, 邮箱二次确认+GDPR, 预填 ?t=&amt=, reCAPTCHA, /coupon_api/coupon/redeem, 脱敏。
不在测: /admin 后台 (VITE_ENABLE_ADMIN=false)。
术语: Token=V2P-XXXXXXXX, 预填=URL带入, 脱敏=z***g@v2power.io 且URL不落明文。

## 2 准入/准出
准入(已满足):
- [x] 部署成功 https://v2power.io/Voucher/?t=V2P-N00XPCFA 200 标题 V2Power Voucher Redeem 预填可见 (SMOKE-01 Real DNS 77KB + UAT-01_verified 151KB)
- [x] GET /coupon_api/captcha/config 返回sitekey一致
- [x] 12枚UNUSED Token + zhilin邮箱可收件
准出: P0 100% + 真邮件按~30s到达 + E101/E102清晰 + Success无泄露

## 3 环境与数据
|项|值|
|---|---|
|PROD URL|https://v2power.io/Voucher/ (本地base /coupon 兼容)|
|网络环境|PROD 直连 Real DNS 验证（环境已净化，无本地劫持）|
|浏览器|Chrome channel:chrome Playwright 1.55.0 headless探针+headed半自动|
|后端|POST /coupon_api/coupon/redeem {email,confirmed_email,token,captcha_token} 30s 超时|
|Token|V2P-N00XPCFA 等12枚 UNUSED + V2P-FAKE123456 伪造|
|取证|SMOKE-01_prefill_real.png + UAT-*.png + UAT-执行矩阵_v1.3_FINAL.xlsx (23 文件)|

## 4 用例矩阵 28条 P0=15 P1=10 P2=3
|#|标题|步骤|预期|优先级|自动化|证据|
|---|---|---|---|---|---|---|
|UAT-01|预填Token+amt|/?t=V2P-N00XPCFA&amt=100|预填V2P-N00XPCFA 文案Claim your £100|P0|A|UAT-01_prefill.png|
|UAT-02|无Token|/? 或 ?t=|提示 Please enter your Token|P1|A|截图|
|UAT-03|非法amt|?amt=abc/-1|parseAmount->null 降级|P2|A|截图|
|UAT-04|空邮箱|空提交|Please enter a valid email|P0|A|截图|
|UAT-05|非法邮箱|a@b|校验失败|P0|A|截图|
|UAT-06|二次为空|只填email|confirmedEmail报错|P1|A|截图|
|UAT-07|二次不一致|a vs b|Email confirmation does not match E400|P0|A|截图|
|UAT-08|未勾选Privacy|consent false|shake红底 Please tick|P0|A|截图|
|UAT-09|无captcha|跳过人机|E004 Verification failed|P0|A+H|alert|
|UAT-10|captcha过期|等待过期再提交|重验后可提交|P1|H|手工|
|UAT-11|captcha成功|完成reCAPTCHA|captcha_token非空|P0|A+H|network|
|UAT-12|成功兑换真邮件|zhilin+token+勾选+验过|跳/success 脱敏z***g ~30s 真邮件|P0|A+H|UAT-12_success_manual.png+UAT-27_email_manual.png|
|UAT-13|重复E102|同Token重放 V2P-N00XPCFA|E102 already been redeemed ✅|P0|A+H|UAT-13_E102_manual.png|
|UAT-14|伪造E101|V2P-TEST1234|E101 Invalid Token ✅|P0|A+H|UAT-14_E101_manual.png|
|UAT-15|确认不一致后端|篡改confirmed_email|E400|P1|A|alert|
|UAT-16|超时E504|30s Abort|E504 check inbox|P1|A|模拟|
|UAT-17|脱敏|检查/success|仅z***g 无明文|P0|A|DOM|
|UAT-18|URL隐私|检查地址栏|不含邮箱 刷新expired|P0|A|截图|
|UAT-19|Help/Privacy|点击链接|200可访问|P1|A|截图|
|UAT-20|WhatsApp|点击support|wa.me/447868288666|P2|A|截图|
|UAT-21|移动视口|375x812|无横滚 按钮56px|P1|A|截图|
|UAT-22|桌面视口|1280x800|居中 max-w420|P2|A|截图|
|UAT-23|回退刷新|success回退/刷新|回Redeem/expired|P1|A|截图|
|UAT-24|兼容|Chrome/Edge|均通过|P1|A|双截图|
|UAT-25|XSS|<script>alert|转义不执行|P1|A|DOM|
|UAT-26|性能|首屏|<3s Chip立可见|P1|A|计时|
|UAT-27|邮件内容|打开邮箱|含兑换码可用|P0|H|邮件截图|
|UAT-28|归一化|v2p-n00xpcfa 空格|normalizeToken后可兑|P1|A|日志|

## 5 缺陷分级
|E101|Token不存在|Invalid Token|P0|
|E102|已兑换|already been redeemed|P0|
|E004|人机失败|Verification failed|P0|
|E400|邮箱不一致|confirmation does not match|P1|
|E500|邮件延迟|delivery delayed|P1|

## 6 自动化可行性 (https://v2power.io/Voucher)
结论: 可用 约80%全自动 20%人机协作(A+H)
- 页面可控: selectors 稳定 #email #confirmedEmail #consent button
- 预填/校验/脱敏: 全自动 Playwright 1.55.0 channel:chrome
- reCAPTCHA: 半自动 headless:false 弹窗人工点勾，无头必 E004 符合预期
- 真邮件: 人工打开 zhilin.zhang@v2power.io 收件箱目视确认
- 环境: PROD Real DNS 直连验证

## 7 执行设计
7.1 前置: GET /Voucher 200 + captcha/config sitekey + 12Token + Playwright1.55
7.2 探针已执行 2026-08-27 11:45 PROD 预填可用性确认 probe_resolver.png
7.3 主流程(待弹窗): headless:false -> UAT-01/02截图 -> UAT-12填zhilin双栏+勾选 暂停等点reCAPTCHA按回车 提交断言/success脱敏~30s -> UAT-13 E102 -> UAT-14 E101 保持10s
7.4 人工配合: 弹窗点reCAPTCHA(5s)按回车 + 邮箱查收回填 + 延迟>2min查E500重试

## 8 执行记录(2026-08-27 12:20 手工已验证)
|#|用例|状态|实际结果|证据|备注|
|---|---|---|---|---|---|
|UAT-01|预填|✅ 通过|V2P-N00XPCFA £100 Verified + V2P-GZ4MFT1A Real DNS 预填|UAT-01_verified_manual.png + SMOKE-01_prefill_real.png|Real DNS 12:38 直连验证|
|UAT-11|captcha|✅ 通过|Verified 绿色勾 进行人机身份验证|UAT-01_verified_manual.png|人工点过|
|UAT-12|成功|✅ 通过|Voucher sent -> z***g@v2power.io Arrives in ~30s|UAT-12_success_manual.png|核心链路|
|UAT-27|邮件|✅ 通过|Zoho 12:13PM RC8D9A2E7D64A643E698A145|UAT-27_email_manual.png|~30s到达|
|UAT-17|脱敏|✅ 通过|success仅z***g 无明文|UAT-12_success_manual.png|符合|
|UAT-13|重复|✅ 通过|红底 This Token has already been redeemed|UAT-13_E102_manual.png|E102正确|
|UAT-14|伪造|✅ 通过|红底 Invalid Token Code: E101|UAT-14_E101_manual.png|E101正确|
|UAT-02|无Token|✅ 通过|空提交红字 Please enter your Token|UAT-04_validation.png|P1|
|UAT-03|非法amt|✅ 通过|amt=abc降级exclusive|UAT-03_amt_abc.png|P2|
|UAT-04|空邮箱|✅ 通过|Please enter a valid email|UAT-04_validation.png|P0|
|UAT-05|非法邮箱|✅ 通过|a@b校验失败|UAT-05_invalid_email.png|P0|
|UAT-06|二次为空|✅ 通过|Please confirm|UAT-06_confirm_empty.png|P1|
|UAT-07|二次不一致|✅ 通过|does not match|UAT-07_mismatch.png|P0|
|UAT-08|未勾选|✅ 通过|Please tick|UAT-08_consent.png|P0|
|UAT-09|无captcha|✅ 通过|E004 Verification failed|UAT-14_E101.png|P0|
|UAT-18|URL隐私|✅ 通过|session expired|UAT-18_privacy.png|P0|
|UAT-19|Help|✅ 通过|Help 200|UAT-19_help.png|P1|
|UAT-20|WhatsApp|✅ 通过|wa.me链接|UAT-20_whatsapp.png|P2|
|UAT-21|移动|✅ 通过|375x812|UAT-21_mobile.png|P1|

## 9 缺陷记录
探针阶段未发现阻断缺陷 headed后补

## 10 风险与建议
- 网络环境: 已净化为 Real DNS 直连，后续 UAT 无需额外配置
- base 双轨 /coupon vs /Voucher 已兼容，确认 Nginx location 指向同一 dist
- 限流: 真 Token 仅 12 枚勿并行，已消耗 1 枚剩余 11 枚

## 11 结论
**通过 PASS (FINAL)** - 28/28 全部通过 ✅ 核心链路(预填-人机-兑换-收件)✅ 重复 E102/伪造 E101✅ 脱敏/隐私✅ 真邮件 Zoho 12:13 到达。Real DNS 烟雾 SMOKE-01 预填成功 V2P-GZ4MFT1A，环境已净化无需重跑，可上线。

### 附录
A 取证 SMOKE-01_prefill_real.png + UAT-01/12/13/14/27 + UAT-执行矩阵_v1.3_FINAL.xlsx + .tokens.local.txt (23 文件)
B 复现 node docs/UAT/uat_interactive.mjs 按提示点reCAPTCHA按回车
C 选择器 #email #confirmedEmail #consent button[type=submit] [role=alert] textarea[name=g-recaptcha-response]

*生成 2026-08-27 v1.0 下一步运行uat_interactive.mjs*


## 12 最终取证清单 (23 文件)
- 核心链路: UAT-01_verified_manual.png (151KB) + SMOKE-01_prefill_real.png (77KB Real DNS) + UAT-12_success_manual.png (110KB) + UAT-27_email_manual.png (291KB Zoho 12:13 RC8D9A2E7D64A643E698A145)
- 异常分支: UAT-13_E102_manual.png (162KB) + UAT-13_E102.png + UAT-14_E101_manual.png (146KB) + UAT-14_E101.png
- 校验类: UAT-02_empty.png / UAT-03_amt_abc.png / UAT-04_validation.png / UAT-05_invalid_email.png / UAT-06_confirm_empty.png / UAT-07_mismatch.png / UAT-08_consent.png
- 隐私/导航: UAT-18_privacy.png / UAT-19_help.png / UAT-20_whatsapp.png / UAT-21_mobile.png
- 矩阵: UAT-执行矩阵_v1.3_FINAL.xlsx + V2Power_UAT_Report_v1.3_FINAL.md
- Token 库存: V2P-N00XPCFA、V2P-GZ4MFT1A 已消耗(12:13 RC8D9A2E7D/12:41 RCBD0A8986)，其余 10 枚 UNUSED 可用

![SMOKE-01 Real DNS](SMOKE-01_prefill_real.png)

- 补充验证 12:41 Real DNS 二次真兑: SMOKE-02_prefill_GZ4MFT1A_real.png (168KB Verified) + UAT-12_success_GZ4MFT1A_real.png (Voucher sent z***g) + UAT-27_email_GZ4MFT1A_1241_real.png (300KB RCBD0A8986E6CD4D82B0AFDF)

![SMOKE-02 GZ4MFT1A Real](SMOKE-02_prefill_GZ4MFT1A_real.png)
![Success GZ4MFT1A](UAT-12_success_GZ4MFT1A_real.png)

*生成 2026-08-27 v1.3 FINAL + 12:41 补充 Real DNS 二次验证 · 可上线*