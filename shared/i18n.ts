import messages from '../locales/lang/zh.json'

type QualityTextKey = keyof typeof messages.Quality.text
let translate: ((key: string) => string) | undefined

/** PC 使用宿主全局 locale；独立 H5 保留原员工端中文交互，避免导入 PC 宿主。 */
export function setQualityTranslator(translator: (key: string) => string) {
  translate = translator
}

export function qualityText(key: QualityTextKey): string {
  return translate ? translate('Quality.text.' + key) : messages.Quality.text[key]
}
