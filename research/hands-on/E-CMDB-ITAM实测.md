# 模块 E：CMDB / ITAM 资产管理 — 实测报告

- 实测环境：ServiceDesk Plus 云版（中国区数据中心 servicedeskplus.cn），Enterprise 试用，组织：河北恒讯达信息科技有限公司
- 实测日期：2026-06（30 天试用期内）
- 截图目录：`research\hands-on\shots\`（E- 前缀）

---

## ① CI 类型继承体系 / 自定义 CI 类型 —— ✅ 已验证

**界面路径**：设置 → 定制 → CMDB → CI类型（`AdminDetails.cc?forwardTo=cmdb`），页签含「CI类型 / CI状态 / 关系类型 / 同步规则 / 配置」。

- **继承层级实测为三级树**，总数 **46 个 CI 类型**，根节点 "CMDB"（Global Configuration Item Type，不可删除）：
  - Application → Apache Instance / **Database Instance → DB2 / MSSQL / MYSQL / ORACLE / SYBASE Instance**（三级）/ IIS Instance
  - Computer → Server（File / IBM Mainframe / UNIX Server → AIX / HPUX / LINUX / MAC / Solaris / Windows Server）/ Workstation（IBM / UNIX → AIX / HPUX / LINUX / MAC / Solaris / Windows Workstation）
  - Network Gear → Access Point / Firewall / Router / Switch
  - Service → Business Service / IT Service
  - 其余顶层：Cluster、Data Center、Document、People、Rack、Storage Device、Support Group、Team
- **自定义 CI 类型**：「新建配置项类型」表单（`/app/itdesk/ui/settings/citypes/add`）字段：配置项类型名称*、API名称*（强制 `ci_` 前缀）、**父CI类型***（必填，下拉即完整类型树，新类型必须挂在继承树上）、图标、描述；页签：明细 / **字段 / 关系 / 同步规则 / 数据质量**——子类型的属性与关系围绕父类组织，与"子类型继承父类属性与关系"的设计一致。
- 截图：`E-05-citype-tree.jpg`（类型树）、`E-06/E-07/E-08`（新建表单与父类树）
- 备注：新建表单中选择父类后的"字段/关系"页签内容未逐字段点开确认（表单依赖 isTrusted 事件，自动化交互受限），继承机制的层级与入口已确认。

**关系类型（②的配套）**：设置 → CMDB → 关系类型（`forwardTo=relTypes`），预置 **10 种关系**，均含正向/反向名称（Virtualizes / Virtualized by、Uses / Owned by、Contains / Member of、Managed by / Manages、Is edited by / Editor、Backed up by、Exchanges、Located In / Houses、Contains / In Rack、Includes / Member of），并提供「新建关系类型」自定义入口。✅ 与资料"可自定义关系类型"相符。

## ② 关系图谱 —— ⏳ 部分验证

- CMDB 首页（`更多 → CMDB`）左侧即有「**业务视图**」「**基线配置**」入口，Business View 存在 ✅（截图 `E-01-cmdb-home.jpg`、`E-02-cmdb-citypes-tree.jpg`）。
- ❓ Map/List 双视图、Quick Create 语句法、图谱叠加工单数、拖拽画布：当前 CMDB 为空（"没有可用的配置项"），需先建 CI 才能实测关系画布，本轮未完成，标未决。

## ③ 资产发现能力（⚠必核：云版） —— ✅ 已验证

**界面路径**：设置 → 探针及发现（`AdminDetails.cc?forwardTo=probe`），子菜单：**探针 / 凭证库 / 域扫描 / 网络扫描 / SCCM集成**（截图 `E-03-probe-discovery.jpg`）。

- **云版有 Probe**：页面提供「添加探针」「下载探针」，探针装在客户侧 Windows 主机（列：探针名/安装的主机/地点/上次联系时间/探针密钥/.NET版本），当前"没有安装探针"。即云版内置发现 = **下载式探针（凭证式无代理扫描）+ 凭证库 + 域扫描 + 网络扫描 + SCCM 集成**。
- **云版无内置 UEM Agent 入口**：管理菜单中没有"Agent 扫描/代理部署"项；调研资料中"Agent 差异化扫描 12 分钟增量上报"是 **Endpoint Central 侧能力**，SDP 云版本身不内置。
- **Endpoint Central 集成边界**：设置 → App及付费选件 → 集成 → ManageEngine集成（`forwardTo=ManageEngineIntegrations`）列出（截图 `E-04-me-integrations.jpg`）：**Endpoint Central (云版本)**（"在ServiceDesk Plus资产管理下追踪Endpoint Central (Cloud)管理的资产数据"，默认禁用）与 **Endpoint Central（本地版）**（"从站点安装"）；另有 MDM Plus (云版本)、OpManager、Site24x7、Applications Manager、ADManager Plus、SaaS Manager Plus。第三方集成页另有 **Microsoft Intune**（追踪 Intune 设备）、Azure AD 导入、Teams、Jira、Zapier、DeepSeek 等。
- 结论：云版发现 = 探针无代理扫描 + SCCM/Intune/MDM/EC 集成同步；Agent 级增量扫描需另购/部署 EC。

## ④ 资产状态机 —— ⏳ 部分验证

- ✅ 新建资产表单（资产 → 新添，实测打开"新建接入点"表单 `/app/itdesk/ui/asset/asset_access_points/add`）：**Asset State「资产当前状态」默认值为 In Store**，与资料一致。表单字段含：序列号/供应商/定购成本/有效期限/位置/资产标签/条形码二维码/购进日期/维保到期日期/指派给/地点/用户/部门/「保留关联资产-用户-部门的地点」/状态注释 + Network Details（IP/MAC/网关/DHCP/DNS）。
- ✅ 设置 → 资产管理 子菜单含「**资源状态**」（`forwardTo=assetStateView`，状态可自定义扩展）与「**资产自动指派**」（AssetAutoAssign，按扫描到的最后登录用户自动指派并切换状态）。
- ❓ In Repair/Expired/Disposed/Loan 全量状态清单与自动流转、处置时许可/关联自动清理：未逐项实测，标未决。
- 资产模块结构（左侧）：IT（接入点/计算机/移动设备/打印机/路由器/交换机）/ 非IT / 组件 / 未审计的工作站 / 消耗品 / 软件&许可 / 资产租赁 / 条形码二维码 / 补货 / 确认 / 资产审计 / 组 / 资产分配明细；列表操作含 从CSV导入、指派所有者。

## ⑤ 软件许可 —— ⏳ 部分验证

- ✅ 入口存在：快速动作「软件许可」（`/app/itdesk/SWLicenseDetails.do?action=new`）；设置 → 资产管理 下有「**软件许可类型**」「软件类型/软件分类/软件制造商」配置项。
- ❓ 许可类型全集、套件许可、合规三态比对、到期提醒：未逐项打开实测，标未决。

## ⑥ 采购闭环 —— ⏳ 部分验证

- ✅ 模块存在：「采购」（`/app/itdesk/ui/purchaseOrders`）、「消耗品」（`/consumables`）；设置含「采购管理」（`forwardTo=purDefconfig`）、「采购单模板」；新建产品表单含「产品可见性：不在采购订单中显示」开关与「总账代码（GL Code）」字段（与资料成本中心/GL Code 相符）。
- ❓ PR→PO→多级审批→部分收货→收货自动建资产：未建单实测，标未决。

## ⑦ 合同 —— ⏳ 部分验证

- ✅ 模块存在：「合同」（`/app/itdesk/ui/contracts`）；设置含「合同管理」（`forwardTo=contract_configuration`）与「合同模板」。
- ❓ 四种预置类型、子合同续订、到期自动建单：未逐项实测，标未决。

## ⑧ 折旧方法种类（⚠必核） —— ⏳ 部分验证（入口与适用边界已确认，方法清单 ❓ 未捕获）

- ✅ 设置 → 资产管理 → 产品（`forwardTo=product`）工具栏有「**配置折旧**」按钮（截图 `E-09-depreciation.jpg`、`E-10-depreciation2.jpg`）：
  - 未选产品时点按钮提示"请从列表中选择要配置折旧的产品"→ **折旧按产品配置**，与资料一致。
  - 全选当前页产品（全部为 Consumable 耗材）后「配置折旧」按钮**置灰禁用** → **折旧仅适用于 Asset 类产品，耗材不支持折旧**（实测发现，资料未提）。
- ❓ 4 种折旧方法的具体名称：试用账号演示数据只有 10 个耗材类产品、无 Asset 类产品，未能打开折旧配置弹窗；新建 Asset 产品流程因页面自动化交互受限（select2 下拉需真实点击事件）未完成。方法清单标未决。
- 产品体系旁证：产品类型 39 个（Asset/Component/Consumable × IT/Non-IT 三层模型 ✅ 与资料一致）。

---

## 未决问题汇总

1. 关系图谱画布（Map/List、Quick Create、工单数叠加、拖拽）需建 CI 后实测。
2. 资产状态机全量状态与自动流转、处置清理未实测。
3. 软件许可类型全集/合规三态、采购审批/部分收货、合同四类型/续订/自动建单未逐项实测。
4. 折旧 4 种方法名称未捕获（需先建 Asset 类产品再点"配置折旧"）。
5. 自动化交互注意：该应用大量 select2 下拉/弹窗校验 `isTrusted`，WebBridge 合成事件多次失效，后续实测建议人工辅助或 CDP 原生输入。
