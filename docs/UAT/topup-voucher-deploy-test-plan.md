# 部署验收清单：充值送券 + 退款收尾

> 触发：Colin 打包部署完成后执行。先确认部署版本，再按矩阵测试；不在该版本里的合并项直接记为"下一版 bug"，不在本轮验收里判失败。

## 0. 本轮版本范围（用户 2026-11-03 确认，这就是交给 Colin 的最后清单）

| 仓 | 在包内 | 不在包内（直接记下一版） |
|---|---|---|
| backend | PR#541、PR#544、PR#552、PR#560 | PR#563（起充超时回收）、PR#564（退款规定下发） |
| console | PR#234、PR#236 | PR#237（建批次 UX） |
| platform | PR#1205、PR#1214 | PR#1217（退款文案）、PR#832（退款分行测试） |

部署顺序：Refferq 迁移 `0012` → MySQL `V124`/`V125`（`V123` 是 #542 的，不要动）→ backend → console → platform。无新增环境变量。

部署后先核对版本：后端 `GET /app/version` 的 `commit`、Console `assets/index-*.js`、App 版本号、Refferq `_prisma_migrations` 是否含 `0012`。

**例外**：如果后端 commit 早于 #560，充值送券会表现为"付款成功但钱包回滚/券没发"——记阻塞 bug，本轮不继续测。

## 1. 充值送券（核心，本轮必测）

| 步骤 | 期望 | 依赖 |
|---|---|---|
| Console 新建档位，Reward=Voucher | 列表显示 `Voucher £10.00` | #234 |
| App 充值页 | 显示 `+£10 voucher`、`Includes £10.00 voucher` | #1205 |
| 真实 TEST 充值 £100 | 钱包只入账 £100；券包出现 £10 券 | #544 |
| Refferq 侧 | `cash_v2_voucher.source='topup'`、journal `issued` | #544 |
| 券包页面 | 正常显示该券，不报 "temporarily unavailable" | #1214 |
| 全额退款 | 券 `recalled`；退款记录 `voucher_claw_minor` 有数；钱包回退 | #544/#560 |

## 2. 赠金/券参数

| 步骤 | 期望 | 依赖 |
|---|---|---|
| 参数树改 `topup.used_bonus_recall` | 30 秒内新退款按新策略 | #541 |
| Console「Refund policy」页 | 能读到并保存 6 个参数 | #236 |
| 订单页退款说明 | 文案与 `refund.voucher_destination` 一致 | **不在包内**（#564/#1217）→ 预期仍是旧的"退 Wallet"，记下一版 |

## 3. 本轮已知缺陷（预期出现，直接开下一版 issue）

1. 订单页退款说明写死"voucher value returns to your Wallet"，部分退款也这么写 → #564 + #1217
2. 建批次填数量 0 被静默钳成 1；创建失败无提示 → #237
3. 起充派发后桩不回话，券永久挂在 `reserved_minor`（无回收任务）→ #563
4. 券包里看不到"预留中"的券，也没有取消入口 → platform#1216
5. 券"已花部分"退款回收（`voucher_claw_minor > 0`）需真充电消耗后才有数据
