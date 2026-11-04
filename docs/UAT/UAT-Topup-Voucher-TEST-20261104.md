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

## 6 模拟器联调：充电订单 + 用券（TOPUP-13）

目的：用 `https://test.v2power.173-212-201-169.sslip.io/simulator/live.html` 起一次真实充电，验证「起充前锁券 → 停充结算 → 用券抵扣 → 订单退款」链路。

操作：

1. 模拟器选 `Clapham Junction Hub` / `0201 · CCS2`，`Plug in vehicle`（车辆状态 `Preparing`）
2. App 车站详情点 `Connector 1` → `Review & pay`，券区选中 `Welcome reward £10.00`（`1 selected`、`Available to apply £10.00`），点 `Start charging`
3. App 停在 `PREPARING / Waiting for charger confirmation`，反复 `Check start status` 无进展

结果：未能完成，卡在起充阶段。

| 观测 | 值 |
|---|---|
| App 会话状态 | `PREPARING`，`0.00 kWh`，订单状态 `Starting`，`start_time=null` |
| 模拟器 connector | 无 `transactionId`；插枪后先 `Preparing`，ConnectionTimeOut 后转 `Finishing`，全程没有交易 |
| 订单行（Console admin API） | `web-order-d4e4e1b8…`，`status=Starting`，`transaction_id=null`，`authorized_amount_minor=1000`，`payment_source=wallet` |
| OCPP 命令日志 | 同一窗口该桩心跳正常（1454 条），按订单 idTag `web-e370807c157c44d8` 查询 **0 条**：`RemoteStartTransaction` 根本没有发出 |
| Console 强制关单后 | 订单变 `ForceClosed`，但**未释放**：`v2p_charge_lock`、钱包预授权 £10（余额仍 £90）、券可用额 £10（券包显示 `£0.00`） |
| 再次起充（另一把枪 / 另一支付方式） | 返回 `An existing charging session must be completed first.`，会员已无法再发起任何充电 |

截图：`TOPUP-13-review-pay-voucher.png`（选券确认页）、`TOPUP-13-voucher-held-after-force-close.png`（券包 £0.00）。

模拟器侧另有配置缺口：该桩 `Charger screen` 显示 `NotConfigured / Waiting for price delivery`，`POS terminal` 显示 `Configure POS payment for this charge point in Console.`，两条设备侧起充路径均不可用。用 Console API 发布充电桩电价（`POST /console/admin/charge-points/by-ocpp/V2POWER-CP-002/screen/prices`）返回 `status=Rejected`、`detail=The charger did not accept the price configuration.`，即软件充电桩本身没有接收电价下发（操作后已改回 `enabled=false`，状态停在 `Paused`）。

### 本轮新发现（下一版）

| # | 问题 | 现象 |
|---|---|---|
| BUG-05 | 起充命令未发出且失败被吞 | `dispatchStart()` 里 `remote.startCharge` 的异常被 `catch(Exception unknown)` 静默吞掉，OCPP 日志里查不到对应 idTag 的任何记录，订单永久 `Starting`，App 永久 `PREPARING`，无任何出口（backend#574） |
| BUG-06 | 强制关单不回收资金与券 | `POST /console/admin/orders/{id}/force-close` 只改订单状态，未释放 `v2p_charge_lock` / 钱包预授权 / 券锁定；该会员之后所有起充请求都被 `An existing charging session must be completed first.` 拒绝（修复：backend#575 + console#244，新增 `POST /admin/orders/{id}/release` 与 Console「Release start」） |
| BUG-07 | 起充失败弹层 | 同时出现 `Retry` 与 `Try again` 两个按钮，语义重复；另有提示 `Using the reward choice from your previous start attempt.` |
| BUG-08 | TEST 软件充电桩拒收电价 | 对 `V2POWER-CP-002` 发布 `DFTimePrices` 返回 `Rejected`，充电桩屏始终 `电价: 待下发`；POS 支付也未配置 |

### 现场残留（需要清理）

TEST 会员 `zhangzlin79@gmail.com`（`jdy-96429a69163be232d58ff205`）当前被上述状态锁住：钱包 £90（£10 预授权未释放）、券 `Welcome charging voucher` 可用 £0.00（£10 已锁）。需要后端/DB 侧释放该订单的 charge lock、钱包 hold 与券预留后，才能继续第 6 节的用例。

设备与 TEST 数据已还原：App 内 mock location 测试 provider 已移除，`station-clapham` 坐标改回 `51.4643 / -0.1707` 并复原位置模式，模拟器 4 把枪均已 `Unplug`。

## 7 二维码起充全链路（TOPUP-14，2026-11-04 16:05）

第 6 节一直起不了充，原因不在会员和券，而在**起充入口**：从 App 场站列表挑同一把枪再点 `Start charging`，后端会走 `RemoteStartTransaction`，TEST 软件桩不回包；**扫桩屏二维码进入**则走原生启动，不经过那次远程起充。

| 步骤 | 结果 |
|---|---|
| 模拟器选 `Demo Ultra Clapham / 0701`，打开桩屏二维码 | 二维码显示在桩屏 |
| 手机扫码 | App 直接进到 0701 的连接器页 |
| 模拟器 `Plug in vehicle` | 桩 `Preparing` → App 自动开始 |
| 充电中 | `CHARGING`，27%，**12.15 kWh**，350 kW，£8.38，时长 02:08 |
| 长按 `Hold to stop` | `Session receipt`：Total paid £8.38，`Reservation returned £1.62` |
| 拔枪 | 连接器回到 `Available`，`transactionId=null` |
| 钱包 | £100.00 → **£91.62**（扣 £8.38）；券仍是 £8.99（扫码路径不选券） |

订单 `web-order-d71680b7-6441-4e8a-a687-cc14e7aae1dc`：`Completed` / `Payed` / `pay_amount=838` / `charge_capacity=12150` / `pay_way=Wallet`。

截图：`w5-06-charging-live.png`、`w5-07-session-receipt.png`、`w5-08-wallet-after-session.png`。

**结论**：钱包支付的充停结算是通的；但「起充前选券」这条路（第 6 节）仍受 `RemoteStart` 不回包阻塞，属于 backend#574。券付订单的退款执行问题见 #587。

## 8 混合支付（券 + 钱包）与退款（TOPUP-15，2026-11-04 18:23）

用户手动在 App 完成一单混合支付：`V2Power Balham / 0101`，起充前选了券。

| 项 | 值 |
|---|---|
| 订单 | `web-order-9a496f26-a8c6-4d7f-9317-803f21c9d69c` |
| 电量 / 时长 | 3.00 kWh / 00:01:02，峰值 180 kW |
| 账单 | £2.07（207 便士） |
| 实付（钱包） | £1.46（146 便士） |
| 券抵扣 | £0.61（61 便士） |

**退款（默认 `refund.voucher_destination=wallet`）**：`POST /admin/orders/{id}/refund` 207 → `refund-ee1369ce…` 状态 `provider_confirmed`，`cash_minor=207`、`voucher_minor=0`；App 订单详情显示 `Returned to wallet £2.07`、`Reservation returned £8.54`，钱包 +£2.07，券余额未变（券抵扣部分折成钱回钱包）。

Stripe 侧无对应对象（本单现金腿是钱包、券腿是平台内部），符合预期；卡通路（Checkout 充值退款 / 卡预授权起充）另行验证。

**顺带确认的展示问题**：订单详情顶部 `Cost` 只显示实付 £1.46，没算券抵扣的 £0.61（账单 £2.07），与 platform#1288 同一类问题，只是这次不是 0 而是「只显示现金部分」。

截图：`w5-10-mixed-order-cost.png`（顶部成本）、`w5-11-mixed-order-refund.png`（退款后钱包明细）。
