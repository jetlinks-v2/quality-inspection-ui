import { getModuleRoutesMap } from '@jetlinks-web/utils'
import { qualityMenuFilter } from './utils/menuNavigation'
const views=import.meta.glob('./views/**/index.vue')
export default {
  getAsyncRoutesMap: () => getModuleRoutesMap(views),
  getMenuFilters: () => [qualityMenuFilter],
}
