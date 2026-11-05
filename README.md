# 品质核查前端

根目录为 Cloud PC 品质模块，`employee-h5/` 为独立员工 H5。后端为 `property-management` 的 `property-quality-service`，通过网关提供 `/quality/**`；系统管理共用 `/property/**` 基础档案。

项目权限配置以“品质核查”（`quality-inspection`）为根节点。独立应用通过宿主已有的 `getMenuFilters` 扩展展开这一层，只展示服务端已授权的子菜单；原子菜单 ID、按钮和权限标识保持不变，不修改 SaaS 平台源码。

已有环境需将新版菜单定义同步到菜单管理与对应应用模板，核对原有子菜单授权；仅更新前端代码不会改变服务端保存的菜单树。

将本仓库作为 `saas-runtime-ui` 的 `modules/quality-inspection-ui` 子模块检出，分支 `2.20`。PC 依赖同版 SaaS 宿主及共享核心，不能单独在本仓库安装宿主依赖。

在宿主根目录执行：

```sh
pnpm install --frozen-lockfile
pnpm exec vue-tsc --noEmit -p modules/quality-inspection-ui/tsconfig.json
pnpm -F jetlinks-web-core build -- --module-name quality-inspection-ui,saas-runtime-ui,authentication-manager-ui,device-manager-ui,edge-master-ui,jetlinks-media-ui
```

构建输出为宿主 `dist/` 完整站点；登录、应用上下文和菜单复用 SaaS。仅指定 `quality-inspection-ui` 会生成模块资源，不是完整站点。

H5 独立构建：

```sh
cd employee-h5
npm ci
npm run build
```

部署前填写 H5 `public/config.json` 的 `applicationId`、`tenantDomain` 和允许的宿主来源；API 使用同源 `/api` 代理到 Cloud 网关。PC 与 H5 共用同一品质应用和权限。不得将会话令牌或服务器凭证提交到仓库。

应用菜单、模板和资产策略位于后端 `deploy/quality/`。配置、核查、整改、复验、统计导出和转报修均使用真实接口。设备维保抽查本轮延期。
