import type { MenuFilterDefinition } from '@jetlinks-web-core/types/module'
import { isProjectApplicationScope } from '@jetlinks-web-core/utils/application-scope'

export const QUALITY_ROOT_MENU_CODE = 'quality-inspection'

/** 独立应用展开已授权的品质分组；项目入口保留完整的系统授权树。 */
export const qualityMenuFilter: MenuFilterDefinition = {
  code: 'quality-application-navigation',
  filter(menus, { applicationScope }) {
    if (!applicationScope?.trim() || isProjectApplicationScope(applicationScope)) return menus

    return menus.flatMap(menu => menu.code === QUALITY_ROOT_MENU_CODE ? menu.children || [] : [menu])
  },
}
