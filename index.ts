import { getModuleRoutesMap } from '@jetlinks-web/utils'
const views=import.meta.glob('./views/**/index.vue')
export default {getAsyncRoutesMap:()=>getModuleRoutesMap(views)}
