import { build } from 'esbuild'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import assert from 'node:assert/strict'
import { createRenderer, nextTick } from 'vue'

const root = fileURLToPath(new URL('..', import.meta.url))
const require = createRequire(import.meta.url)
const built = await build({
  stdin: { contents: `export {useTemplatePage} from './hooks/useTemplatePage'; export {useTaskPage} from './hooks/useTaskPage'; export {useQualityReports} from './hooks/useQualityReports'; export {useConfigurationPage} from './hooks/useConfigurationPage'`, resolveDir: root, loader: 'ts' },
  bundle: true, write: false, platform: 'node', format: 'cjs', external: ['vue'],
  plugins: [{ name: 'api-boundary', setup(build) {
    build.onResolve({ filter: /(^ant-design-vue$|\/api\/quality$|\/useQualityAccess$)/ }, args => ({ path: args.path, namespace: 'test-boundary' }))
    build.onLoad({ filter: /.*/, namespace: 'test-boundary' }, args => ({ loader: 'js', contents:
      args.path === 'ant-design-vue' ? `export const message={success(){}}` :
      args.path.endsWith('/useQualityAccess') ? `import {ref} from 'vue'; export function useQualityAccess(){return {projectId:ref(),projects:ref([{id:'a',name:'项目A'},{id:'b',name:'项目B'}]),can:()=>true,loadAccess:async()=>{}}}` :
      `export const quality = new Proxy({}, {get(_,key){return (...args)=>globalThis.__qualityApi[key](...args)}})`
    }))
  }}],
})
const compiled = { exports: {} }
new Function('module', 'exports', 'require', built.outputFiles[0].text)(compiled, compiled.exports, require)
const hooks = compiled.exports
const renderer = createRenderer({
  createElement: () => ({}), createText: () => ({}), createComment: () => ({}),
  insert() {}, remove() {}, setText() {}, setElementText() {}, patchProp() {}, parentNode() {}, nextSibling() {},
})
const flush = async () => { await nextTick(); await new Promise(resolve => setImmediate(resolve)); await nextTick() }
async function mount(name, level, api) {
  globalThis.__qualityApi = api
  let vm
  const app = renderer.createApp({ setup() { vm = hooks[name](level); return () => null } })
  app.mount({}); await flush()
  return { vm, close: () => app.unmount() }
}
const config = (id, projectId, kind = 'inspection-content') => ({ id, projectId, kind, configLevel: 1, name: id, status: 1, data: {score: 100, subjectParentId:'line',subjectParentName:'条线'} })
const configs = [config('item-a','a'),config('item-b','b'),config('template-a','a','template'),config('template-b','b','template')]
const api = () => ({
  configs: async q => ({data: configs.filter(c => (q.terms || []).every(t => c[t.column] === t.value)),total: 0}),
  tasks: async () => ({data:[],total:0}),assignmentCandidates:async()=>[],roles:async()=>[],
  taskStatistics:async()=>[],lineStatistics:async()=>[],problems:async()=>({data:[],total:0}),
})

test('公司模板按真实项目筛检查项，复制后切换项目清空旧项目检查项和权重', async () => {
  const {vm,close} = await mount('useTemplatePage',1,api())
  await vm.start(); vm.form.projectId='a'
  assert.deepEqual(vm.availableConfigs.value.map(c=>c.id),['item-a'])
  vm.select(['item-a']); assert.equal(vm.total.value,100); assert.equal(vm.weightTotal.value,100)
  const original={...config('original','a','template'),data:JSON.parse(JSON.stringify(vm.form.data))}
  await vm.start(original,true)
  assert.equal(vm.form.id,undefined);assert.equal(vm.form.projectId,'a')
  vm.form.projectId='b';vm.changeFrequency()
  assert.deepEqual(vm.availableConfigs.value.map(c=>c.id),['item-b'])
  assert.deepEqual(vm.selected.value,[]);assert.equal(vm.weightTotal.value,0)
  close()
})

test('公司任务必须先选项目，项目切换后只加载本项目模板并清空旧选择', async () => {
  const {vm,close} = await mount('useTaskPage',1,api())
  await vm.start(); assert.deepEqual(vm.templates.value,[])
  vm.form.projectId='a';await flush()
  assert.deepEqual(vm.templates.value.map(c=>c.id),['template-a'])
  vm.form.templateId='template-a';vm.form.lineAssignees=[{subjectParentId:'line',inspectorId:'user'}]
  vm.form.projectId='b';await flush()
  assert.equal(vm.form.templateId,'');assert.deepEqual(vm.form.lineAssignees,[])
  assert.deepEqual(vm.templates.value.map(c=>c.id),['template-b'])
  close()
})

test('公司报表从项目钻取条线和问题，查询与导出始终保留同一项目条件', async () => {
  const calls=[]
  const mock={...api(),lineStatistics:async f=>{calls.push(['line',f]);return[]},problems:async(q,r)=>{calls.push(['problems',q,r]);return{data:[],total:0}},exportProblems:async(q,r)=>calls.push(['export',q,r])}
  const {vm,close} = await mount('useQualityReports',1,mock)
  vm.drill({projectId:'a',projectName:'项目A'});await flush()
  assert.equal(vm.projectId.value,'a');assert.equal(calls.find(c=>c[0]==='line')[1].projectId,'a')
  vm.drill({lineId:'line'});await flush();await vm.exportRows()
  for(const kind of ['problems','export']){
    const call=calls.find(c=>c[0]===kind)
    assert.ok(call[1].terms.some(t=>t.column==='projectId'&&t.value==='a'))
    assert.ok(call[2].terms.some(t=>t.column==='subjectParentId'&&t.value==='line'))
  }
  assert.equal(vm.columns.value.some(c=>c.dataIndex==='businessTypeName'),false)
  close()
})

test('公司配置不再提供业态维护，项目检查配置仍可引用公司共用检查要求', async () => {
  const mock=api();mock.configs=async()=>({data:[{...config('shared',undefined,'content'),projectId:null}],total:1})
  const {vm,close} = await mount('useConfigurationPage',1,mock)
  assert.equal(vm.configKinds.value.some(k=>k.value==='business-type'),false)
  vm.kind.value='inspection-content';vm.projectId.value='a';await flush();await vm.edit()
  assert.equal(vm.form.projectId,'a')
  assert.deepEqual(vm.options('content'),[{value:'shared',label:'shared'}])
  close()
})

test('快速切换任务项目时迟到的旧项目模板响应不会覆盖新项目', async () => {
  let completeA
  const mock=api();const base=mock.configs
  mock.configs=q=>q.terms.some(t=>t.column==='projectId'&&t.value==='a')?new Promise(resolve=>{completeA=resolve}):base(q)
  const {vm,close}=await mount('useTaskPage',1,mock)
  await vm.start();vm.form.projectId='a';await flush()
  vm.form.projectId='b';await flush()
  assert.deepEqual(vm.templates.value.map(c=>c.id),['template-b'])
  completeA({data:[config('template-a','a','template')]});await flush()
  assert.deepEqual(vm.templates.value.map(c=>c.id),['template-b'])
  close()
})
