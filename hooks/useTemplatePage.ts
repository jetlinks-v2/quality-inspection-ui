import {computed,onMounted,reactive,ref,watch} from 'vue'
import {quality} from '../api/quality'
import {messageOf,type Configuration,type LineWeight} from '../shared/types'
import {useQualityAccess} from './useQualityAccess'
export function useTemplatePage(level:number){
 const access=useQualityAccess(),projectId=ref<string>(),rows=ref<Configuration[]>([]),configs=ref<Configuration[]>([]),open=ref(false),loading=ref(false),saving=ref(false),error=ref(''),viewOnly=ref(false)
 const form=reactive<Configuration>({kind:'template',name:'',configLevel:level,status:1,data:{configItems:[],lineWeights:[],templateType:1}})
 const load=async()=>{loading.value=true;error.value='';try{rows.value=(await quality.configs({paging:false,terms:[{column:'kind',value:'template'},{column:'configLevel',value:level},...(level===2?[{column:'projectId',value:projectId.value}]:[])]})).data}catch(e){error.value=messageOf(e)}finally{loading.value=false}}
 const start=async(row?:Configuration,copy=false,readonly=false)=>{try{configs.value=(await quality.configs({paging:false,terms:[{column:'kind',value:'inspection-content'},{column:'configLevel',value:level},{column:'status',value:1},...(level===2?[{column:'projectId',value:projectId.value}]:[])]})).data;Object.keys(form).forEach(k=>delete (form as unknown as Record<string,unknown>)[k]);Object.assign(form,row?JSON.parse(JSON.stringify(row)):{kind:'template',name:'',configLevel:level,projectId:level===2?projectId.value:undefined,status:1,data:{configItems:[],lineWeights:[],templateType:1}});if(copy){delete form.id;form.name+='（副本）';form.data.templateType=1}viewOnly.value=readonly;open.value=true}catch(e){error.value=messageOf(e)}}
 const selected=computed(()=>form.data.configItems?.map(i=>i.configId)||[])
 const select=(ids:string[])=>{form.data.configItems=ids.map(id=>form.data.configItems?.find(i=>i.configId===id)||{configId:id,score:configs.value.find(c=>c.id===id)?.data.score||0,deductionStandard:configs.value.find(c=>c.id===id)?.data.deductionStandard||''});const lines=[...new Set(ids.map(id=>configs.value.find(c=>c.id===id)?.data.subjectParentId).filter((v):v is string=>!!v))];form.data.lineWeights=lines.map(id=>form.data.lineWeights?.find(w=>w.subjectParentId===id)||{subjectParentId:id,subjectParentName:configs.value.find(c=>c.data.subjectParentId===id)?.data.subjectParentName,weight:lines.length===1?100:0})}
 const total=computed(()=>form.data.configItems?.reduce((n,i)=>n+i.score,0)||0)
 const weightTotal=computed(()=>form.data.lineWeights?.reduce((n,i)=>n+i.weight,0)||0)
 const save=async()=>{saving.value=true;error.value='';try{await quality.saveConfig(form);open.value=false;await load()}catch(e){error.value=messageOf(e)}finally{saving.value=false}}
 const remove=async(row:Configuration)=>{try{await quality.deleteConfig(row.id!);await load()}catch(e){error.value=messageOf(e)}}
 const configName=(id:string)=>configs.value.find(c=>c.id===id)?.name||id
 watch(projectId,()=>void load());onMounted(async()=>{try{await access.loadAccess();if(level===2)projectId.value=access.projects.value[0]?.id;await load()}catch(e){error.value=messageOf(e)}})
 return {...access,projectId,rows,configs,form,open,loading,saving,error,viewOnly,load,start,selected,select,total,weightTotal,save,remove,configName}
}
