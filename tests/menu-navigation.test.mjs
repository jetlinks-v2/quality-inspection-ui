import { build } from 'esbuild'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

const root = fileURLToPath(new URL('..', import.meta.url))
const host = process.env.RUNTIME_UI_ROOT || [resolve(root, '../../../sass平台/cloud.jetlinks/runtime-ui'), resolve(root, '../..')]
  .find(path => existsSync(resolve(path, 'jetlinks-web-core/src/utils/application-scope.ts')))
const built = await build({
  entryPoints: [resolve(root, 'utils/menuNavigation.ts')],
  bundle: true, write: false, platform: 'node', format: 'cjs',
  alias: { '@jetlinks-web-core': resolve(host, 'jetlinks-web-core/src') },
})
const compiled = { exports: {} }
new Function('module', 'exports', built.outputFiles[0].text)(compiled, compiled.exports)
const filter = compiled.exports.qualityMenuFilter.filter
const definitions = JSON.parse(readFileSync(resolve(root, 'baseMenu.json'), 'utf8'))
const system = definitions[0]
const other = { id: 'other-system', code: 'other-system', name: '其他系统', url: '/other', children: [] }

test('菜单初始化保留系统根与原业务菜单，模块注册导航扩展', () => {
  assert.equal(definitions.length, 1)
  assert.equal(system.code, 'quality-inspection')
  assert.ok(system.children.length)
  const visit = items => items.flatMap(item => [item, ...visit(item.children || [])])
  const nodes = visit(definitions)
  assert.equal(new Set(nodes.map(item => item.id)).size, nodes.length)
  assert.match(readFileSync(resolve(root, 'index.ts'), 'utf8'), /getMenuFilters/)
})

test('项目权限树与无应用上下文保留根节点及完整授权', () => {
  const menus = [other, system]
  for (const applicationScope of [undefined, '', '  ', '__jetlinks_project__', 'business_application:__jetlinks_project__']) {
    assert.strictEqual(filter(menus, { applicationScope }), menus)
  }
})

test('独立应用只展开本系统一层，不修改数据和其他系统，重复处理结果稳定', () => {
  const menus = structuredClone([other, system])
  const before = structuredClone(menus)
  const navigation = filter(menus, { applicationScope: 'business_application:test-app' })
  assert.deepEqual(navigation, [other, ...system.children])
  assert.deepEqual(menus, before)
  assert.deepEqual(filter(navigation, { applicationScope: 'test-app' }), navigation)
})

test('部分授权只使用服务端子节点，不补页面、按钮或空根；兼容旧平铺菜单', () => {
  const page = { ...system.children[0], buttons: [{ id: 'query' }], children: [] }
  assert.deepEqual(filter([{ ...system, children: [page] }], { applicationScope: 'test-app' }), [page])
  for (const children of [undefined, []]) {
    assert.deepEqual(filter([{ ...system, children }], { applicationScope: 'test-app' }), [])
  }
  const flat = [other, page]
  assert.deepEqual(filter(flat, { applicationScope: 'test-app' }), flat)
})
