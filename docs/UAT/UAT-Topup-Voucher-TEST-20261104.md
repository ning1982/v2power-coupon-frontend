# 充值送券 · TEST 环境验收报告（2026-11-04）

> 环境：TEST `https://test.v2power.173-212-201-169.sslip.io`（`deploymentEnvironment=test`、`stripe.testMode=true`）
> 版本：backend `3eeee7c9460ebd400f84a6057540805c4ee7e168`（runId `topup-test-20261103`，含 #541/#544/#552/#560）· Console `0047fc1375ca47575a65655687f27d878981c992`（含 #234/#236）· APP Android `versionCode=88`（`v2powerSourceSha=1858ac3ff42b…`，含 #1205/#1214）
> 账号：zhangzlin79@gmail.com（Google 登录）· 数据全部 `mode=test`

## 1 范围

验证「Console 配置充值送券 → App 展示 → 真实 TEST 充值 → 发券 → 全额退款回收」全链路，以及 Console 退款策略页读写。

不在本轮：券「已花部分」追回（需真充电消耗）、赠金档位的 `topup.used_bonus_recall` 运行时效果、起充超时回收（#563 未在本版）。

## 2 先决检查

| 项 | 值 | 结果 |
|---|---|---|
| 后端版本 | `/app/version` → `3eeee7c…`，runId `topup-test-20261103` | ✅ |
| Console 版本 | `/console/frontend/version.json` → `0047fc13…`，SHA-256 `8ce9b552…` | ✅ |
| 环境 | `/app/config` → env=`test`，`stripe.testMode=true` | ✅ |
| APP | 设备 `versionCode=88`，`v2powerEnvironment=test`，origin=`test.v2power…` | ✅ |
| 迁移 | MySQL V124/V125、Postgres `0012_cash_v2_topup_reward`（Colin 部署记录） | ✅ |

## 3 用例矩阵

| # | 用例 | 步骤 | 预期 | 结果 | 证据 |
|---|---|---|---|---|---|
| TOPUP-01 | App 展示券奖励 | 充值页选 £100 档位（Console 配置 `reward_kind=voucher`） | 卡片 `+£10 voucher`、摘要 `Includes £10.00 voucher` | ✅ | TOPUP-01-app-voucher-offer.png |
| TOPUP-02 | 真实充值入账 | 测试卡 4242 全额支付 £100 | 钱包只入实付 £100，不倒灌券面额 | ✅ | TOPUP-02-wallet-credited.png |
| TOPUP-03 | 发券到券包 | 券包查看 | 出现 1 张 £10.00，Current，有效期 04/11/2027 | ✅ | TOPUP-03-voucher-issued.png |
| TOPUP-04 | 券详情/流水 | 券详情「Voucher activity」 | 显示 issued 流水 | ❌ "Cash vouchers are temporarily unavailable"（已知 P2，backend#568 已修，下一版） | TOPUP-04-voucher-detail-p2.png |
| TOPUP-05 | 全额退款回收 | Stripe TEST 全额退 £100 | 钱包回 £0、活动显示 `Funding refund −£100.00`、券从 Current 移除 | ✅（券归入 Expired 标签，见 BUG-02） | TOPUP-05-after-refund.png |
| TOPUP-06 | Console 退款策略页 | 打开 `/console/refund-policy`；TEST 建 6 个参数节点后改冷静期 14→15 保存 | 页面可读写，接口回读一致 | ✅（回读 15，已还原 14） | TOPUP-06-console-refund-policy.png |
| TOPUP-07 | 赠金档位充值 | 选 £200 档位（`+£20 bonus`）并支付 | 钱包入账 £220，含赠金 | ✅ | TOPUP-07-bonus-topup-and-refunds.png |
| TOPUP-09 | Console 套餐表单（#234） | 打开编辑：Reward=Voucher、字段文案 `Voucher face value (pence)` / `Voucher validity (days)`；改百分比 5% 保存 | 列表显示 `Voucher 5%`，版本历史 `voucher 5` | ✅ | 见报告文字记录 |
| TOPUP-10 | 奖励形式切换（#234 + #1205） | Console 改 5% → 切 `reward_kind=bonus` 保存；App 充值页 | App 显示 `£105.00 / Includes £5.00 bonus / +£5 bonus`（需重启 App，见 BUG-04）；切回固定 £10 券后重启显示 `+£10 voucher` | ✅（含 BUG-04） | TOPUP-08-percent-voucher-via-console.png |
| TOPUP-11 | Refund policy 其余控件（#236） | 页面把 split_order 改 `proportional`、voucher_destination 改 `voucher` 保存 | 接口回读一致；已还原为 `cash_first` / `wallet` | ✅ | — |
| TOPUP-12 | 参数非法值容错（#541） | 参数树把 `topup.used_bonus_recall` 设成 `bogus`，再做 £200 赠金充值 + 全额退款 | 退款正常完成（回落到默认 `after_window`），钱包回 £0，无 5xx | ✅ | 已还原参数 |
| TOPUP-08 | 赠金档位退款（未用赠金） | Stripe TEST 全额退 £200 | 钱包回 £0：本金退回、未用赠金作废 | ✅（活动显示 `Funding refund (£200.00) −£220.00`） | TOPUP-07-bonus-topup-and-refunds.png |

## 4 缺陷

### 本版已确认、下一版修复

| # | 问题 | 归属 |
|---|---|---|
| BUG-01 | 券详情流水不可用（后端 memberVoucher 白名单拒 `topup`） | backend#568（已修待发版） |

### 本轮新发现（下一版）

| # | 问题 | 现象 |
|---|---|---|
| BUG-02 | 召回后的券显示在 **Expired** 标签下 | 退款回收后券包 Current 0 / Expired 1，语义应为「已召回」 |
| BUG-03 | 充值券详情 `Source` 显示 **Welcome reward** | 来源标签未覆盖 `topup` |
| BUG-04 | App 会话内缓存充值档位 | Console 改奖励形式/面额后，App 不重启看不到变化（实测：voucher→bonus 切换后重开充值页仍是旧值，杀进程重启才更新） |

### 本版未包含（不算本版缺陷）

- 订单页退款文案写死 Wallet：backend#564 + platform#1217
- 建批次填 0 静默变 1、失败无提示：console#237
- 起充派发后无超时回收：backend#563
- 券包不显示「预留中」的券、无取消入口：platform#1216

## 5 备注

- 退款通过 Stripe TEST 全额退款触发，后端 webhook 正常处理（钱包回退 + 券召回）
- **未覆盖**：「已用赠金/券」的追回需要真充电消耗后才有数据；TEST 当前 App 显示 0 个可用充电桩（`0 live chargers`），无法发起充电会话，因此 `voucher_claw_minor > 0` 与 `topup.used_bonus_recall` 的运行时效果本轮未验证
- TEST 参数树原本为空，本轮为验证 Console 页面创建了 `topup.*` / `refund.*` 六个节点，值均为代码默认
