import {qualityText as qt} from '../../../shared/i18n'

export type QualityMode='inspect'|'rectify'|'review'|'completed'|'related'

/** 首页、列表和个人页共用同一组业务入口。 */
export const qualityModes: {value:QualityMode;label:string;description:string}[]=[
 {value:'inspect',label:qt('pendingInspection'),description:qt('h5InspectHint')},
 {value:'rectify',label:qt('pendingRectification'),description:qt('h5RectifyHint')},
 {value:'review',label:qt('pendingReview'),description:qt('h5ReviewHint')},
 {value:'completed',label:qt('completed'),description:qt('h5CompletedHint')},
 {value:'related',label:qt('h5History'),description:qt('h5HistoryHint')}
]
