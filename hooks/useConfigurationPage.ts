import {qualityText as qt} from '../shared/i18n'
import {computed,onMounted,reactive,ref,watch} from 'vue'
import {message} from 'ant-design-vue'
import {quality} from '../api/quality'
import {saveBlob} from '../shared/client'
import {messageOf,type Configuration} from '../shared/types'
import {useQualityAccess} from './useQualityAccess'
const configKinds=computed(()=>[{value:'category',label:qt('businessSector')},{value:'line',label:qt('inspectionLine')},{value:'subject',label:qt('subject')},{value:'content',label:qt('checkRequirements')},{value:'inspection-content',label:qt('inspectionContentConfiguration')}])
export function useConfigurationPage(level:number,special?:string){
 const access=useQualityAccess(),targetLevel=ref(level),viewOnly=ref(false),kind=ref(special||'category'),projectId=access.projectId,rows=ref<Configuration[]>([]),all=ref<Configuration[]>([]),loading=ref(false),saving=ref(false),error=ref(''),open=ref(false),current=ref(1),total=ref(0),name=ref('')
 const selectedKeys=ref<string[]>([]),lineIds=ref<string[]>([]),subjectIds=ref<string[]>([]),filterStatus=ref<number>(),filterSource=ref<number>(),frequency=ref<number>()
 const removeSelected=async()=>{try{await quality.deleteConfigs(selectedKeys.value,level===1);selectedKeys.value=[];await load()}catch(e){error.value=messageOf(e)}}
 const fresh=():Configuration=>({kind:kind.value,name:'',configLevel:targetLevel.value,projectId:targetLevel.value===2||kind.value==='inspection-content'?projectId.value:undefined,status:1,sortOrder:0,data:{}})
 const form=reactive<Configuration>(fresh())
 const load=async()=>{loading.value=true;error.value='';try{const terms=[{column:'kind',value:kind.value},{column:'configLevel',value:targetLevel.value},...((targetLevel.value===2||kind.value==='inspection-content')&&projectId.value?[{column:'projectId',value:projectId.value}]:[]),...(lineIds.value.length?[{column:'lineId',termType:'in',value:lineIds.value}]:[]),...(subjectIds.value.length?[{column:'subjectId',termType:'in',value:subjectIds.value}]:[]),...(filterStatus.value!==undefined?[{column:'status',value:filterStatus.value}]:[]),...(filterSource.value!==undefined?[{column:'sourceType',value:filterSource.value}]:[]),...(frequency.value?[{column:'inspectionFrequency',value:frequency.value}]:[]),...(name.value?[{column:'name',termType:'like',value:'%'+name.value+'%'}]:[])];if(targetLevel.value===2&&!projectId.value){rows.value=[];total.value=0;return}const page=await quality.configs({pageSize:20,pageIndex:current.value-1,terms});rows.value=page.data;total.value=page.total}catch(e){error.value=messageOf(e)}finally{loading.value=false}}
 const references=async()=>{all.value=(await quality.configs({paging:false,terms:[{column:'status',value:1}]})).data}
 const options=(k:string)=>all.value.filter(r=>r.kind===k&&r.configLevel===targetLevel.value&&(targetLevel.value===2?r.projectId===projectId.value:!r.projectId)).map(r=>({value:r.id!,label:r.name}))
 const edit=async(row?:Configuration,readonly=false)=>{error.value='';try{await references();Object.keys(form).forEach(k=>delete (form as unknown as Record<string,unknown>)[k]);Object.assign(form,row?JSON.parse(JSON.stringify(row)):fresh());if(form.kind==='evaluation'){form.data.minScore??=0;form.data.maxScore??=100}viewOnly.value=readonly;open.value=true}catch(e){error.value=messageOf(e)}}
 const save=async()=>{if(saving.value)return;saving.value=true;error.value='';try{await (level===1?quality.saveCompanyConfig(form):quality.saveConfig(form));open.value=false;await load();message.success(qt('saved'))}catch(e){error.value=messageOf(e)}finally{saving.value=false}}
 const remove=async(row:Configuration)=>{try{await (level===1?quality.deleteCompanyConfig(row.id!):quality.deleteConfig(row.id!));await load()}catch(e){error.value=messageOf(e)}}
 const parentKind=computed(()=>form.kind==='subject'?'line':form.kind==='content'?'subject':undefined)
 const search=()=>{current.value=1;void load()}
 watch([kind,projectId,targetLevel],()=>{lineIds.value=[];subjectIds.value=[];frequency.value=undefined;selectedKeys.value=[];void references();search()})
 watch([lineIds,subjectIds,filterStatus,filterSource,frequency],search)
 const canMutate=(row:Configuration)=>level===1||row.sourceType!==1
 const importTarget=ref('basic'),importing=ref(false)
 const importFile=async(file:File)=>{importing.value=true;error.value='';try{const result=await quality.import(importTarget.value,targetLevel.value,projectId.value,file,level===1) as {imported:number};message.success(qt('imported')+result.imported+qt('rows'));await load()}catch(e){error.value=messageOf(e)}finally{importing.value=false}return false}
 const downloadTemplate=async()=>{try{saveBlob(await quality.template(importTarget.value,targetLevel.value),qt('qualityImportTemplateXlsx'))}catch(e){error.value=messageOf(e)}}
 onMounted(async()=>{try{await access.loadAccess();await references();await load()}catch(e){error.value=messageOf(e)}})
 return {...access,lineIds,subjectIds,filterStatus,filterSource,frequency,selectedKeys,removeSelected,targetLevel,viewOnly,canMutate,configKinds,kind,projectId,rows,all,loading,saving,error,open,current,total,name,form,load,edit,save,remove,options,parentKind,search,importTarget,importing,importFile,downloadTemplate}
}
