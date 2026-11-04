import {qualityText as qt} from './i18n'
import {computed,ref} from 'vue'
import type {QualityClient} from './client'
import {messageOf,type Action,type CheckRecord,type Context,type Detail,type Person,type Result} from './types'
/** 两端共用处置编排；提交失败保留表单，成功后重读版本及状态。 */
export function useQualityDetail(api:QualityClient){
 const data=ref<Detail>(),context=ref<Context>(),loading=ref(false),saving=ref(false),error=ref(''),action=ref(''),rectificationId=ref(''),description=ref(''),assigneeIds=ref<string[]>([]),recordIds=ref<string[]>([]),results=ref<Result[]>([]),candidates=ref<Person[]>([]),success=ref('')
 const can=(name:string)=>!!context.value?.actions.includes(name)
 const load=async(id:string)=>{loading.value=true;error.value='';try{const [d,c]=await Promise.all([api.detail(id),api.context()]);data.value=d;context.value=c}catch(e){error.value=messageOf(e)}finally{loading.value=false}}
 const owned=computed(()=>data.value?.records.filter(r=>r.executorId===data.value?.currentUserId&&r.recordStatus!==2)||[])
 const editableRects=computed(()=>data.value?.rectifications.filter(r=>[1,4].includes(r.rectificationStatus)&&r.executorIds.includes(data.value!.currentUserId))||[])
 const reviewable=computed(()=>data.value?.rectifications.filter(r=>r.rectificationStatus===2&&r.reviewerId===data.value!.currentUserId)||[])
 const close=()=>{action.value='';rectificationId.value='';results.value=[]}
 const start=async(name:string,rectId='')=>{
  if(!data.value)return;error.value='';success.value='';rectificationId.value=rectId;description.value='';assigneeIds.value=[];recordIds.value=[];results.value=[]
  try{
   const d=data.value,rect=d.rectifications.find(r=>r.id===rectId)
   const source=name==='inspect'?owned.value:name==='submit'?d.records.filter(r=>rect?.recordIds.includes(r.id)):[]
   results.value=source.map(r=>name==='inspect'?d.draft.results?.find(s=>s.recordId===r.id)||{recordId:r.id,score:r.score??r.originalScore,isQualified:r.isQualified??1,checkResult:r.checkResult||'',photoIds:r.photoIds||[]}:{recordId:r.id,score:r.score??r.originalScore,isQualified:r.isQualified??0,checkResult:r.checkResult||'',photoIds:r.rectificationPhotoIds||[]})
   if(name==='submit'&&rect)description.value=rect.rectificationDesc||''
   if(['inspect','reassign','dispatch','rectReassign'].includes(name))candidates.value=await api.candidates(d.workOrder.id,name==='inspect'||name==='rectReassign'?'rectify':'inspect')
   action.value=name
  }catch(e){error.value=messageOf(e)}
 }
 const submit=async(draft=false)=>{
  if(!data.value||saving.value)return;saving.value=true;error.value=''
  try{
   if(!draft&&action.value==='inspect'&&results.value.some(r=>r.isQualified===0)&&!assigneeIds.value.length)throw Error(qt('selectARectifier'))
   const request:Action={version:data.value.workOrder.version,results:results.value,assigneeIds:assigneeIds.value,recordIds:recordIds.value,description:description.value}
   if(['submit','pass','reject','rectReassign'].includes(action.value))await api.rectAction(rectificationId.value,action.value==='rectReassign'?'reassign':action.value,request)
   else await api.orderAction(data.value.workOrder.id,draft?'draft':action.value,request)
   const id=data.value.workOrder.id;success.value=draft?qt('draftSaved'):qt('operationCompleted');if(!draft)close();await load(id)
  }catch(e){error.value=messageOf(e)}finally{saving.value=false}
 }
 const record=(id:string)=>data.value?.records.find(r=>r.id===id)
 const lineOptions=computed(()=>[...new Map(data.value?.records.filter(r=>r.recordStatus!==2&&(action.value==='dispatch'||r.executorId===data.value!.currentUserId)).map(r=>[r.subjectParentId,{value:r.subjectParentId,label:r.subjectParentName}])).values()])
 const selectLines=(lines:string[])=>{recordIds.value=data.value?.records.filter(r=>lines.includes(r.subjectParentId)).map(r=>r.id)||[]}
 return {data,context,loading,saving,error,success,action,rectificationId,description,assigneeIds,recordIds,results,candidates,owned,editableRects,reviewable,can,load,start,close,submit,record,lineOptions,selectLines}
}
