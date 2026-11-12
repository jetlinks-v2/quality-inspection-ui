# 品质核查前端

本仓库仅维护 Cloud PC 品质模块。后端为 `property-management` 的 `property-quality-service`，通过网关提供 `/quality/**`；公共基础管理由 `property-base-ui` 提供，后端共用 `/property/**` 基础档案。

项目权限配置以“品质核查”（`quality-inspection`）为根节点。独立应用通过宿主已有的 `getMenuFilters` 扩展展开这一层，只展示服务端已授权的子菜单；原子菜单 ID、按钮和权限标识保持不变，不修改 SaaS 平台源码。

已有环境需将新版菜单定义同步到菜单管理与对应应用模板，核对原有子菜单授权；仅更新前端代码不会改变服务端保存的菜单树。

将本仓库作为 `saas-runtime-ui` 的 `modules/quality-inspection-ui` 子模块检出，分支 `2.20`。PC 依赖同版 SaaS 宿主及共享核心，不能单独在本仓库安装宿主依赖。

在宿主根目录执行：

```sh
pnpm install --frozen-lockfile
pnpm exec vue-tsc --noEmit -p modules/quality-inspection-ui/tsconfig.json
pnpm -F jetlinks-web-core build -- --module-name quality-inspection-ui,property-base-ui,saas-runtime-ui,authentication-manager-ui,device-manager-ui,edge-master-ui,jetlinks-media-ui
```

构建输出为宿主 `dist/` 完整站点；登录、应用上下文和菜单复用 SaaS。仅指定 `quality-inspection-ui` 会生成模块资源，不是完整站点。

H5 已分仓至 [quality-inspection-wx-ui](https://github.com/jetlinks-v2/quality-inspection-wx-ui)，采用 Vant 4，保留账号密码独立登录。正式版本由移动主工程 `cloud.jetlinks.mobile` 执行 `pnpm build:app quality-app`，真实模板编码为 `QualityInspection`，授权上下文由外壳提供。

应用菜单、模板和资产策略位于后端 `deploy/quality/`。配置、核查、整改、复验、统计导出和转报修均使用真实接口。设备维保抽查本轮延期。

## 公共基础前端

宿主同时检出并加载 `modules/property-base-ui`（`2.20`）。本模块不再提供组织、用户、空间、客户、字典的菜单、页面、接口封装或语言副本。公共菜单由公共模块唯一提供给宿主初始化，各应用按职责引用并授权公共 `charging/*` 菜单；不在业务 `baseMenu.json` 中复制公共定义。后端仍由独立基础服务维护统一数据。

在宿主执行 `pnpm --filter quality-inspection-ui dev` 联合调试公共和认证模块；`build` 输出单业务远程包，`build:with-base` 输出宿主 `dist/`。正式 SaaS 集成构建还须包含运行端、认证与实际使用的其他模块；宿主 `pnpm build:quality` 包含品质、公共模块及必要的 SaaS 依赖。

已有环境的旧菜单不会因源码删除自动消失，按后端 `deploy/property-base/README.md` 增量迁移模板、套餐、订阅与角色，保留原资产范围，验收后停用旧基础副本。不重置业务菜单，也不全量初始化其他系统。

品质项目、员工和分配候选继续使用 `/quality/context/**`，由品质后端筛选业务资格，不以公共人员列表替代。独立员工 H5 沿用自己的业务客户端。

## 业务导航

品质应用采用 Cloud 两级导航：左侧按公司基础配置、公司核查、项目基础配置、项目核查和应用管理分组，组内页面在内容区顶部切换。叶子菜单 ID 与 URL 保持稳定，权限由原动作和资产范围控制。公共基础管理只使用 property-base-ui 的菜单与页面，不重复维护品质系统管理副本。

已有环境须同步后端 deploy/quality 中的菜单层级以及模板、套餐、订阅和角色快照；仅部署前端不会更新持久化菜单。

公司条线、科目和检查要求在当前品质应用内共用；检查内容配置与任务模板直接选择基础档案项目，不维护独立业态。任务只加载同项目模板，复制模板切换项目后须重新选择检查项；公司与项目报表均按真实项目筛选、钻取和导出。既有配置的数据迁移按后端 `deploy/quality/README.md` 的项目绑定规则执行。

## 员工 H5

独立仓库：[quality-inspection-wx-ui](https://github.com/jetlinks-v2/quality-inspection-wx-ui)，使用 Vant 4；统一外壳构建命令为 `pnpm build:app quality-app`，模板编码 `QualityInspection`。PC 共享定义仍保留在 `shared/`。
