import {qualityText as qt} from '../shared/i18n'
import {computed,onMounted,ref,watch} from 'vue'
import {quality} from '../api/quality'
import {messageOf,type CheckRecord,type Configuration,type Query,type ReportFilter,type ReportRow} from '../shared/types'
import {useQualityAccess} from './useQualityAccess'

/** 任务总表、条线和问题各自使用旧源码的统计时间及分母，筛选和导出共用同一组参数。 */
export function useQualityReports(level=1){
 const access=useQualityAccess(),projectId=ref<string>(),businessTypeId=ref<string>(),businessTypes=ref<Configuration[]>([]),lineId=ref<string>(),startTime=ref<string>(),endTime=ref<string>(),group=ref('project'),rows=ref<ReportRow[]>([]),problems=ref<CheckRecord[]>([]),current=ref(1),total=ref(0),loading=ref(false),error=ref(''),selected=ref(''),detailOpen=ref(false),success=ref('')
 const filter=():ReportFilter=>({taskLevel:level,projectId:projectId.value,businessTypeId:businessTypeId.value,lineId:lineId.value,startTime:startTime.value?Number(startTime.value):undefined,endTime:endTime.value?Number(endTime.value):undefined})
 const query=():Query=>({terms:[{column:'taskLevel',value:level},...(projectId.value?[{column:'projectId',value:projectId.value}]:[])]})
 const recordQuery=():Query=>({pageIndex:current.value-1,pageSize:20,terms:[...(lineId.value?[{column:'subjectParentId',value:lineId.value}]:[]),...(businessTypeId.value?[{column:'taskId',termType:'quality-task',value:[{column:'businessTypeId',value:businessTypeId.value}]}]:[]),...(startTime.value?[{column:'completeTime',termType:'gte',value:Number(startTime.value)}]:[]),...(endTime.value?[{column:'completeTime',termType:'lte',value:Number(endTime.value)}]:[])]})
 let sequence=0
 const load=async()=>{const request=++sequence;loading.value=true;error.value='';try{if(group.value==='problems'){const page=await quality.problems(query(),recordQuery());if(request===sequence){problems.value=page.data;total.value=page.total}}else{const data=group.value==='project'?await quality.taskStatistics(filter()):await quality.lineStatistics(filter());if(request===sequence)rows.value=data}}catch(e){if(request===sequence)error.value=messageOf(e)}finally{if(request===sequence)loading.value=false}}
 const search=()=>{current.value=1;void load()};watch([projectId,businessTypeId,group],search)
 const exportRows=async()=>{try{if(group.value==='problems')await quality.exportProblems(query(),recordQuery());else await quality.exportReport(filter(),group.value==='project'?'task-statistics':'line-statistics');success.value=qt('exportQueuedViewItInExportManagement')}catch(e){error.value=messageOf(e)}}
 const showDetail=(row:CheckRecord)=>{selected.value=row.workOrderId;detailOpen.value=true}
 const drill=(row:ReportRow)=>{if(group.value==='project'){if(level===1)businessTypeId.value=String(row.businessTypeId||'');else projectId.value=String(row.projectId);lineId.value=undefined;group.value='line'}else{lineId.value=String(row.lineId);group.value='problems'}}
 const reset=()=>{projectId.value=undefined;businessTypeId.value=undefined;lineId.value=undefined;startTime.value=undefined;endTime.value=undefined;search()}
 const columns=computed(()=>group.value==='project'?[
  {title:level===1?qt('propertyType'):qt('businessProject'),dataIndex:level===1?'businessTypeName':'projectName'},
  {title:qt('totalTasks'),dataIndex:'totalTask'},{title:qt('closedTasks'),dataIndex:'closeTask'},{title:qt('completedTasks'),dataIndex:'completeTask'},
  {title:qt('totalCompletionRate'),dataIndex:'totalRate'},{title:qt('validCompletionRate'),dataIndex:'validRate'},
  {title:qt('qualifiedItems'),dataIndex:'qualifiedContentCount'},{title:qt('unqualifiedItems'),dataIndex:'unqualifiedContentCount'},
  ...(level===1?[{title:qt('rectifiedItems'),dataIndex:'totalRectificationCount'},{title:qt('rectificationRate'),dataIndex:'rectificationRate'}]:[]),
  {title:qt('qualificationRate'),dataIndex:'comprehensiveQualifiedRate'},{title:qt('actions'),key:'actions'}
 ]:[{title:qt('inspectionLine'),dataIndex:'lineName'},{title:qt('unqualifiedItems'),dataIndex:'problemCount'},{title:qt('rectifiedItems'),dataIndex:'rectifiedCount'},{title:qt('unrectifiedItems'),dataIndex:'unrectifiedCount'},{title:qt('totalPointsEarned'),dataIndex:'score'},{title:qt('rectificationRate'),dataIndex:'rectificationRate'},...(level===1?[{title:qt('previousProblems'),dataIndex:'previousProblemCount'},{title:qt('problemGrowthRate'),dataIndex:'problemGrowthRate'}]:[]),{title:qt('actions'),key:'actions'}])
 const ratio=(value:unknown)=>typeof value==='number'?(value*100).toFixed(2)+'%':'—'
 onMounted(async()=>{try{await access.loadAccess();businessTypes.value=(await quality.configs({paging:false,terms:[{column:'kind',value:'business-type'}]})).data;await load()}catch(e){error.value=messageOf(e)}})
 return {...access,projectId,businessTypeId,businessTypes,lineId,startTime,endTime,group,rows,problems,current,total,loading,error,selected,detailOpen,success,query,load,search,exportRows,showDetail,columns,drill,reset,ratio}
}
