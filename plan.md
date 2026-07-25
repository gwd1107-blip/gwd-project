# ITSM 服务台系统 — 前期调研消化计划

## 目标
仿照 ManageEngine ServiceDesk Plus 自研一套 ITSM IT 服务台管理系统。
本阶段只做调研与消化，**不写任何实现代码**。
后续用户会提供 ServiceDesk Plus 试用账号做深度功能实测（第二阶段）。

## 阶段 1 — 并行调研（explore 子代理 × 10）
| # | 调研员 | 范围 |
|---|--------|------|
| 1 | 调研员_SDP核心流程 | ServiceDesk Plus 核心 ITSM 流程：事件/问题/变更/发布、服务目录、SLA、知识库 |
| 2 | 调研员_SDP资产CMDB | CMDB、IT 资产管理、采购与合同、软件许可 |
| 3 | 调研员_SDP自动化AI | 工作流/业务规则/自动化、Zia AI、GenAI、无代码自定义、集成生态 |
| 4 | 调研员_SDP体验与版本 | 自助门户、技术员界面、报表仪表盘、多实例 ESM、部署方式与版本对比 |
| 5 | 调研员_ITIL框架 | ITIL 4 / ITSM 最佳实践框架，作为自研的流程理论底座 |
| 6 | 调研员_GLPI | 开源 GLPI 的功能、架构、插件生态、可借鉴点 |
| 7 | 调研员_iTop | 开源 iTop（CMDB 驱动 ITSM）调研 |
| 8 | 调研员_开源工单 | Zammad、osTicket 等开源 helpdesk 调研 |
| 9 | 调研员_国产开源 | 蓝鲸 bk-itsm 等中文开源 ITSM + Snipe-IT（资产） |
| 10 | 调研员_架构建议 | 自研 ITSM 系统的领域模型、模块划分、技术栈选型建议 |

## 阶段 2 — 汇总整合（Orchestrator 本人）
- 将 10 份调研简报整合为 `research/` 目录下的系列 Markdown 文档
- 输出《调研消化总报告》：对标功能清单 + 差异化自研建议（自己的风格与特点）

## 阶段 3（后续，等用户提供账号）
- 登录 ServiceDesk Plus 实测，验证与补充调研结论

## 约束
- 本阶段禁止写实现代码
- 所有产出保存在当前工作区 `C:\Users\54831\Documents\Kimi\Workspaces\ITSM`
