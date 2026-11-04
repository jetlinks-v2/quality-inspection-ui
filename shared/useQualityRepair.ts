import {reactive,ref} from 'vue'
import type {QualityClient} from './client'
import {messageOf,type CheckRecord,type RepairInfo,type RepairInput,type RepairOption} from './types'
export function useQualityRepair(api:QualityClient,changed:()=>Promise<void>){
 const open=ref(false),loading=ref(false),error=ref(''),options=ref<RepairOption[]>([]),selected=ref<CheckRecord>(),linked=ref<RepairInfo>()
 const form=reactive<RepairInput>({businessProjectId:'',categoryId:'',channelId:'',description:'',contactName:'',contactPhone:'',positionType:1,reportSource:1,urgency:1,labelIds:[],descriptionChoiceIds:[],attachmentIds:[]})
 const show=async(record:CheckRecord)=>{loading.value=true;error.value='';linked.value=undefined;selected.value=record;try{if(record.repairOrderId)linked.value=await api.linked(record.id);else{options.value=await api.repairOptions(record.projectId!);Object.assign(form,{businessProjectId:record.projectId,categoryId:'',channelId:'',description:record.checkContentName+'：'+(record.checkResult||record.checkRequirement),contactName:'',contactPhone:'',positionType:1,reportSource:1,urgency:1,labelIds:[],descriptionChoiceIds:[],attachmentIds:record.photoIds||[]})}open.value=true}catch(e){error.value=messageOf(e);open.value=true}finally{loading.value=false}}
 const choices=(kind:string)=>options.value.filter(r=>r.kind===kind&&(kind!=='category'||!options.value.some(child=>child.kind==='category'&&child.parentId===r.id))&&(kind!=='label'||r.parentId===form.categoryId)).map(r=>({value:r.id,label:r.name}))
 const submit=async()=>{if(!selected.value||loading.value)return;loading.value=true;error.value='';try{linked.value=await api.transfer(selected.value.id,form);await changed()}catch(e){error.value=messageOf(e)}finally{loading.value=false}}
 return {open,loading,error,options,selected,linked,form,show,choices,submit}
}
