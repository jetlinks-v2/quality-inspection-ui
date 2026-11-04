import {computed,onMounted,reactive,ref,watch} from 'vue'
import {message} from 'ant-design-vue'
import {quality} from '../api/quality'
import {saveBlob} from '../shared/client'
import {messageOf,type Configuration} from '../shared/types'
import {useQualityAccess} from './useQualityAccess'
export const configKinds=[{value:'category',label:'业务板块'},{value:'line',label:'条线'},{value:'subject',label:'科目'},{value:'content',label:'检查内容'},{value:'inspection-content',label:'巡检内容配置'},{value:'business-type',label:'业态'}]
export function useConfigurationPage(level:number,special?:string){
 const access=useQualityAccess(),kind=ref(special||'category'),projectId=ref<string>(),rows=ref<Configuration[]>([]),all=ref<Configuration[]>([]),loading=ref(false),saving=ref(false),error=ref(''),open=ref(false),current=ref(1),total=ref(0),name=ref('')
 const fresh=():Configuration=>({kind:kind.value,name:'',configLevel:level,projectId:level===2?projectId.value:undefined,status:1,sortOrder:0,data:{}})
 const form=reactive<Configuration>(fresh())
 const load=async()=>{loading.value=true;error.value='';try{const terms=[{column:'kind',value:kind.value},{column:'configLevel',value:level},...(level===2?[{column:'projectId',value:projectId.value}]:[]),...(name.value?[{column:'name',termType:'like',value:'%'+name.value+'%'}]:[])];if(level===2&&!projectId.value){rows.value=[];total.value=0;return}const page=await quality.configs({pageSize:20,pageIndex:current.value-1,terms});rows.value=page.data;total.value=page.total}catch(e){error.value=messageOf(e)}finally{loading.value=false}}
 const references=async()=>{all.value=(await quality.configs({paging:false,terms:[{column:'status',value:1}]})).data}
 const options=(k:string)=>all.value.filter(r=>r.kind===k&&(r.configLevel===level&&r.projectId===(level===2?projectId.value:undefined)||k==='content'&&r.configLevel===1)).map(r=>({value:r.id!,label:r.name}))
 const edit=async(row?:Configuration)=>{error.value='';try{await references();Object.keys(form).forEach(k=>delete (form as unknown as Record<string,unknown>)[k]);Object.assign(form,row?JSON.parse(JSON.stringify(row)):fresh());if(form.kind==='evaluation'){form.data.minScore??=0;form.data.maxScore??=100}open.value=true}catch(e){error.value=messageOf(e)}}
 const save=async()=>{if(saving.value)return;saving.value=true;error.value='';try{await quality.saveConfig(form);open.value=false;await load();message.success('保存成功')}catch(e){error.value=messageOf(e)}finally{saving.value=false}}
 const remove=async(row:Configuration)=>{try{await quality.deleteConfig(row.id!);await load()}catch(e){error.value=messageOf(e)}}
 const parentKind=computed(()=>form.kind==='subject'?'line':form.kind==='content'?'subject':undefined)
 const search=()=>{current.value=1;void load()}
 watch([kind,projectId],search)
 const importTarget=ref('basic'),importing=ref(false)
 const importFile=async(file:File)=>{importing.value=true;error.value='';try{const result=await quality.import(importTarget.value,level,projectId.value,file) as {imported:number};message.success('已导入 '+result.imported+' 行');await load()}catch(e){error.value=messageOf(e)}finally{importing.value=false}return false}
 const downloadTemplate=async()=>{try{saveBlob(await quality.template(importTarget.value,level),'品质核查导入模板.xlsx')}catch(e){error.value=messageOf(e)}}
 onMounted(async()=>{try{await access.loadAccess();if(level===2)projectId.value=access.projects.value[0]?.id;await load()}catch(e){error.value=messageOf(e)}})
 return {...access,configKinds,kind,projectId,rows,all,loading,saving,error,open,current,total,name,form,load,edit,save,remove,options,parentKind,search,importTarget,importing,importFile,downloadTemplate}
}
