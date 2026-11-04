# 品质核查前端

根目录为 Cloud PC 品质模块，`employee-h5/` 为独立员工 H5。后端为 `property-management` 的 `property-quality-service`，通过网关提供 `/quality/**`；系统管理共用 `/property/**` 基础档案。

将本仓库作为 `saas-runtime-ui` 的 `modules/quality-inspection-ui` 子模块检出，分支 `2.20`。PC 依赖同版 SaaS 宿主及共享核心，不能单独在本仓库安装宿主依赖。

在宿主根目录执行：

```sh
pnpm install --frozen-lockfile
pnpm exec vue-tsc --noEmit -p modules/quality-inspection-ui/tsconfig.json
pnpm -F jetlinks-web-core exec node --max-old-space-size=12288 --max-semi-space-size=64 ../node_modules/vite/bin/vite.js build
```

构建输出为宿主 `dist/` 完整 Cloud 运行时站点，品质与报修、巡更一起部署到既有 Cloud 前端。保留宿主中已部署的其他业务模块，并固定各模块提交。完整宿主构建需要足够的 Node 堆内存。仅指定 `quality-inspection-ui` 会生成模块资源，不是完整站点。

品质应用的 `customDomain` 保持为空，从 Cloud 应用入口进入同一站点的应用路由。登录、应用上下文、菜单和右上角中英文切换均复用 SaaS；系统管理的组织、用户、空间、客户和字典读取统一基础档案服务的公共表。

H5 独立构建：

```sh
cd employee-h5
npm ci
npm run build
```

部署前填写 H5 `public/config.json` 的 `applicationId`、`tenantDomain` 和允许的 Cloud 宿主来源；API 使用同源 `/api` 代理到 Cloud 网关。PC 与 H5 共用同一品质应用和权限。网关须将 `/file/**` 固定路由到公共文件服务，避免其他业务服务的公共接口注册影响附件归属。不得将会话令牌或服务器凭证提交到仓库。

应用菜单、模板和资产策略位于后端 `deploy/quality/`。配置、核查、整改、复验、统计导出和转报修均使用真实接口。设备维保抽查本轮延期。
