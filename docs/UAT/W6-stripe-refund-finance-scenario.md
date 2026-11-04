# 财务视角：Stripe 后台里的退款长什么样（W6 联调准备）

> 目的：Zirui 要求「退款要去 Stripe 界面联合调试，体验财务用起来是什么场景」。这份是联调前的现状盘点 —— 用 TEST key 直接读 Stripe 对象，等价于财务在 Dashboard 上看到的内容。

## 两条退款入口，天文差异

| 入口 | 谁发起 | Stripe 里看到的东西 |
|---|---|---|
| Console「Refund」（`POST /admin/orders/{id}/refund`） | 运营 | 退款对象带 `metadata[operator_reference]`、`metadata[purpose]=admin_refund`（代码路径如此；TEST 上还没有经 Console 发起过的退款样本，联调时补实测） |
| Stripe Dashboard 手动退款 | 财务/Colin | 退款对象 `metadata = {}`、`reason = requested_by_customer`、无 description —— 只看到金额、时间和一张 PaymentIntent |

实测（TEST，2026-11-04）：

```
re_3UXtyN…  succeeded  20000 gbp  reason=requested_by_customer  metadata={}
re_3UXtem…  succeeded  20000 gbp  reason=requested_by_customer  metadata={}
re_3UXtND…  succeeded  10000 gbp  reason=requested_by_customer  metadata={}
re_3UXaDW…  succeeded     22 gbp  reason=null  metadata={purpose: minimum_charge_difference, settlement_attempt: rnw_…}
```

对应 PaymentIntent 的 metadata：

```
attempt_id: rnwallet_71c2ae58…
account_owner: 98d6de403b79f30b9607      # 哈希后的会员，不是邮箱
credited_amount: 22000
campaign_version: 2026-09-custom-amount-v2
native_wallet: true
purpose: wallet
```

也就是说财务在 Dashboard 上：**看得到「退了 £200」，看不到是谁、为什么退、对应哪个订单/工单**；要把 `attempt_id` 拿去平台后台换会员和充值记录，才能对账。这是目前最大的体验缺口。

## 财务实际会遇到的场景

1. **充值退款（钱包）**：Dashboard 里退 PaymentIntent → 我们的 webhook 按 `payment_intent` 找到 attempt，回滚钱包余额、作废/追回券。财务侧不会看到这些联动，只知道 Stripe 显示 `refunded`。
2. **充电订单退款**：必须走 Console（SUPER_ADMIN），Stripe 上带 `operator_reference`，券的部分**不会出现在 Stripe**（只退现金部分），券通过平台内部恢复。Dashboard 里只能看到现金那一笔。
3. **部分退款 / 拆分退款**：`refund.split_order` 决定现金和券各退多少；Stripe 只看到现金 share。财务若只看 Stripe，会以为少退了。
4. **失败/待确认**：Stripe 的 `pending` / `failed` 状态需要和平台 `v2p_refund_request.status` 对照，财务单看一边会误判。

## 联调需要的环境与步骤

需要一个人能登录 Stripe **TEST 模式** Dashboard（我们目前只有 API key，没有后台登录），或者 Colin 共享屏幕。

建议演示脚本（30 分钟）：

1. App 充值 £100（奖励 £10 券）→ Dashboard 出现 PaymentIntent，看 metadata 能对上 `attempt_id`
2. Dashboard 里对这笔全额退款 → 平台钱包回 £0、券被召回；观察 Dashboard 退款对象的 metadata 为空
3. Console 对一笔已支付订单发起退款（带 `operator_reference`）→ 对比 Dashboard 里这一笔的 metadata
4. 制造一张有券抵扣的订单退款 → 说明 Stripe 只有现金部分
5. 观察 payout / balance 变化，确认财务对账口径

## 建议改的东西（下一步）

1. 平台发起的退款统一补 metadata：`member_user_id`、`order_id`/`topup_reference`、`operator_reference`、`refund_request_id`
2. 充值/PaymentIntent 增加 `description`（如 `V2Power top-up <attempt_id> · <member>`），让 Dashboard 列表页不用点进去就能认人
3. Dashboard 手动退款场景给出对账 runbook：PaymentIntent → `attempt_id` → 平台充值记录
4. Console 退款记录里展示 Stripe 退款 ID 与现金/券拆分，方便财务双向核对

## 状态

- 现状盘点：完成（本文）
- 联调：**待 Stripe TEST Dashboard 访问权限或与 Colin 排时间**
