import {computed,onMounted,ref,watch} from 'vue'
import {quality} from '../api/quality'
import {messageOf,type CheckRecord} from '../shared/types'
import {useQualityAccess} from './useQualityAccess'
export function useQualityReports(level?:number){
 const access=useQualityAccess(),projectId=ref<string>(),startTime=ref<string>(),endTime=ref<string>(),group=ref('project'),summary=ref<Record<string,number>>({}),rows=ref<Record<string,string|number>[]>([]),problems=ref<CheckRecord[]>([]),current=ref(1),total=ref(0),loading=ref(false),error=ref(''),selected=ref(''),detailOpen=ref(false),success=ref('')
 const query=()=>({terms:[...(level?[{column:'taskLevel',value:level}]:[]),...(projectId.value?[{column:'projectId',value:projectId.value}]:[]),...(startTime.value?[{column:'scheduledTime',termType:'gte',value:Number(startTime.value)}]:[]),...(endTime.value?[{column:'scheduledTime',termType:'lte',value:Number(endTime.value)}]:[])]})
 const load=async()=>{loading.value=true;error.value='';try{summary.value=await quality.summary(query());if(group.value==='problems'){const page=await quality.problems({...query(),pageIndex:current.value-1,pageSize:20});problems.value=page.data;total.value=page.total}else rows.value=await quality.report(query(),group.value)}catch(e){error.value=messageOf(e)}finally{loading.value=false}}
 const filter=()=>{current.value=1;void load()};watch([projectId,group],filter)
 const exportRows=async()=>{try{await quality.export(query(),group.value);success.value='已创建导出任务，请在导出管理查看'}catch(e){error.value=messageOf(e)}}
 const showDetail=(row:CheckRecord)=>{selected.value=row.workOrderId;detailOpen.value=true}
 const columns=computed(()=>group.value==='project'?[{title:'业务项目',dataIndex:'projectName'},{title:'工单数',dataIndex:'workOrderCount'},{title:'已完成',dataIndex:'completedCount'},{title:'平均分',dataIndex:'averageScore'}]:[{title:'业务项目',dataIndex:'projectName'},{title:'条线',dataIndex:'lineName'},{title:'检查项数',dataIndex:'recordCount'},{title:'已提交',dataIndex:'submittedCount'},{title:'不合格项数',dataIndex:'unqualifiedCount'},{title:'合格率（%）',dataIndex:'qualifiedRate'},{title:'得分合计',dataIndex:'score'}])
 onMounted(async()=>{try{await access.loadAccess();await load()}catch(e){error.value=messageOf(e)}})
 return {...access,projectId,startTime,endTime,group,summary,rows,problems,current,total,loading,error,selected,detailOpen,success,query,load,filter,exportRows,showDetail,columns}
}
