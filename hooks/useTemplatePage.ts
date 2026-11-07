import {qualityText as qt} from '../shared/i18n'
import {computed,onMounted,reactive,ref,watch} from 'vue'
import {quality} from '../api/quality'
import {messageOf,type Configuration,type LineWeight} from '../shared/types'
import {useQualityAccess} from './useQualityAccess'
export function useTemplatePage(level:number){
 const access=useQualityAccess(),projectId=access.projectId,rows=ref<Configuration[]>([]),configs=ref<Configuration[]>([]),open=ref(false),loading=ref(false),saving=ref(false),error=ref(''),viewOnly=ref(false)
 const filterName=ref(''),filterType=ref<number>(),filterStatus=ref<number>(),filterLine=ref<string>()
 const displayRows=computed(()=>rows.value.filter(r=>(!filterName.value||r.name.includes(filterName.value))&&(filterType.value===undefined||r.data.templateType===filterType.value)&&(filterStatus.value===undefined||r.status===filterStatus.value)&&(!filterLine.value||r.data.snapshot?.some(s=>s.subjectParentId===filterLine.value))))
 const lineOptions=computed(()=>[...new Map(rows.value.flatMap(r=>(r.data.snapshot||[]).map(s=>[s.subjectParentId,{value:s.subjectParentId,label:s.subjectParentName||s.subjectParentId}] as const))).values()])
 const form=reactive<Configuration>({kind:'template',name:'',configLevel:level,status:1,data:{configItems:[],lineWeights:[],templateType:1}})
 const load=async()=>{loading.value=true;error.value='';try{if(level===2&&!projectId.value){rows.value=[];return}rows.value=(await quality.configs({paging:false,terms:[{column:'kind',value:'template'},{column:'configLevel',value:level},...(projectId.value?[{column:'projectId',value:projectId.value}]:[])]})).data}catch(e){error.value=messageOf(e)}finally{loading.value=false}}
 const start=async(row?:Configuration,copy=false,readonly=false)=>{try{configs.value=(await quality.configs({paging:false,terms:[{column:'kind',value:'inspection-content'},{column:'configLevel',value:level},{column:'status',value:1},...(level===2?[{column:'projectId',value:projectId.value}]:[])]})).data;Object.keys(form).forEach(k=>delete (form as unknown as Record<string,unknown>)[k]);Object.assign(form,row?JSON.parse(JSON.stringify(row)):{kind:'template',name:'',configLevel:level,projectId:projectId.value,status:1,data:{configItems:[],lineWeights:[],templateType:1}});if(copy){delete form.id;form.name+=qt('copy');form.data.templateType=1}viewOnly.value=readonly;open.value=true}catch(e){error.value=messageOf(e)}}
 const availableConfigs=computed(()=>configs.value.filter(c=>c.projectId===form.projectId&&(level===1||c.data.inspectionFrequency===form.data.inspectionFrequency)))
 const selected=computed(()=>form.data.configItems?.map(i=>i.configId)||[])
 const changeFrequency=()=>{select([])}
 const select=(ids:string[])=>{form.data.configItems=ids.map(id=>form.data.configItems?.find(i=>i.configId===id)||{configId:id,score:configs.value.find(c=>c.id===id)?.data.score||0,deductionStandard:configs.value.find(c=>c.id===id)?.data.deductionStandard||''});const lines=[...new Set(ids.map(id=>configs.value.find(c=>c.id===id)?.data.subjectParentId).filter((v):v is string=>!!v))];form.data.lineWeights=lines.map(id=>form.data.lineWeights?.find(w=>w.subjectParentId===id)||{subjectParentId:id,subjectParentName:configs.value.find(c=>c.data.subjectParentId===id)?.data.subjectParentName,weight:lines.length===1?100:0})}
 const total=computed(()=>form.data.configItems?.reduce((n,i)=>n+i.score,0)||0)
 const weightTotal=computed(()=>form.data.lineWeights?.reduce((n,i)=>n+i.weight,0)||0)
 const save=async()=>{saving.value=true;error.value='';try{await quality.saveConfig(form);open.value=false;await load()}catch(e){error.value=messageOf(e)}finally{saving.value=false}}
 const remove=async(row:Configuration)=>{try{await quality.deleteConfig(row.id!);await load()}catch(e){error.value=messageOf(e)}}
 const configName=(id:string)=>configs.value.find(c=>c.id===id)?.name||id
 watch(projectId,()=>void load());onMounted(async()=>{try{await access.loadAccess();await load()}catch(e){error.value=messageOf(e)}})
 return {...access,filterName,filterType,filterStatus,filterLine,displayRows,lineOptions,projectId,rows,configs,availableConfigs,changeFrequency,form,open,loading,saving,error,viewOnly,load,start,selected,select,total,weightTotal,save,remove,configName}
}
