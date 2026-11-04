import {computed,onMounted,ref,watch} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import {buildQueryFilter,decodeConditionFilterQuery,encodeConditionFilterQuery,type ConditionFilterField,type ConditionTerm} from '@jetlinks-web-core/components/ConditionFilter'
import {quality} from '../api/quality'
import {messageOf,orderStates,type WorkOrder} from '../shared/types'
import {useQualityAccess} from './useQualityAccess'
export function useOrderPage(level:number){
 const access=useQualityAccess(),route=useRoute(),router=useRouter(),projectId=ref<string>(),status=ref<number>(),mode=ref('pool'),rows=ref<WorkOrder[]>([]),current=ref(1),total=ref(0),loading=ref(false),error=ref(''),selected=ref(''),detailOpen=ref(false)
 const fields:ConditionFilterField[]=[{title:'任务名称',dataIndex:'taskName',search:{type:'string'}},{title:'工单编号',dataIndex:'taskCode',search:{type:'string'}},{title:'生成时间',dataIndex:'scheduledTime',search:{type:'date'}},{title:'回传时限',dataIndex:'reportDeadline',search:{type:'date'}},{title:'评价',dataIndex:'evaluationName',search:{type:'string'}}]
 const terms=ref<ConditionTerm[]>(decodeConditionFilterQuery(route.query.q,fields))
 const query=()=>({pageIndex:current.value-1,pageSize:20,terms:[{column:'taskLevel',value:level},...(projectId.value?[{column:'projectId',value:projectId.value}]:[]),...(status.value!==undefined?[{column:'workOrderStatus',value:status.value}]:[]),...buildQueryFilter(terms.value,fields).terms]})
 let revision=0
 const load=async()=>{const own=++revision;loading.value=true;error.value='';try{const page=await quality.orders(query(),mode.value);if(own===revision){rows.value=page.data;total.value=page.total}}catch(e){if(own===revision)error.value=messageOf(e)}finally{if(own===revision)loading.value=false}}
 const filter=()=>{current.value=1;void load()};watch([projectId,status,mode],filter)
 const search=()=>{void router.replace({query:{...route.query,q:encodeConditionFilterQuery(terms.value,fields)||undefined}})}
 watch(()=>route.query.q,()=>{terms.value=decodeConditionFilterQuery(route.query.q,fields);filter()})
 const detail=(row:WorkOrder)=>{selected.value=row.id;detailOpen.value=true}
 const exportRows=async()=>{try{await quality.export(query(),'orders');error.value='';await router.push('/quality/exports')}catch(e){error.value=messageOf(e)}}
 onMounted(async()=>{try{await access.loadAccess();await load()}catch(e){error.value=messageOf(e)}})
 return {...access,projectId,status,mode,rows,current,total,loading,error,selected,detailOpen,fields,terms,query,load,filter,search,detail,exportRows}
}
