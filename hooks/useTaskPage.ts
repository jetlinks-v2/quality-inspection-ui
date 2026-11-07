import {computed,onMounted,reactive,ref,watch} from 'vue'
import {quality} from '../api/quality'
import {messageOf,type Configuration,type Snapshot,type Task,type Person} from '../shared/types'
import {useQualityAccess} from './useQualityAccess'
export function useTaskPage(level:number){
 const access=useQualityAccess(),projectId=access.projectId,rows=ref<Task[]>([]),templates=ref<Configuration[]>([]),loading=ref(false),saving=ref(false),error=ref(''),open=ref(false),current=ref(1),total=ref(0),name=ref(''),status=ref<number>(),readonly=ref(false),plan=ref<Awaited<ReturnType<typeof quality.schedules>>>([]),planOpen=ref(false)
 const selectedKeys=ref<string[]>([])
 const removeSelected=async()=>{try{await quality.deleteTasks(selectedKeys.value);selectedKeys.value=[];await load()}catch(e){error.value=messageOf(e)}}
 const fresh=():Task=>({taskName:'',taskLevel:level,taskType:level===1?1:2,projectId:projectId.value,templateId:'',lineAssignees:[],startTime:Date.now(),endTime:Date.now()+86400000,firstGenerateTime:Date.now(),reportDeadline:Date.now()+86400000,intervalValue:1,intervalUnit:3,inspectionFrequency:1,operationFrequency:1,scheduleRules:{dayTimes:['09:00'],weekTimes:[{weekDay:1,time:'09:00'}],monthDateTimes:[]},configItems:[]})
 const form=reactive<Task>(fresh()),roles=ref<Person[]>([]),candidates=ref<Person[]>([])
 let candidateRevision=0
 const loadCandidates=async()=>{const own=++candidateRevision;if(!form.projectId){candidates.value=[];roles.value=[];return}try{const [available,roleOptions]=await Promise.all([quality.assignmentCandidates(form.projectId,form.checkRole),quality.roles(form.projectId)]);if(own===candidateRevision){candidates.value=available;roles.value=roleOptions}}catch(e){if(own===candidateRevision)error.value=messageOf(e)}}
 watch([()=>form.projectId,()=>form.checkRole],()=>void loadCandidates())
 const query=()=>({pageIndex:current.value-1,pageSize:20,terms:[{column:'taskLevel',value:level},...(projectId.value?[{column:'projectId',value:projectId.value}]:[]),...(status.value!==undefined?[{column:'taskStatus',value:status.value}]:[]),...(name.value?[{column:'taskName',termType:'like',value:'%'+name.value+'%'}]:[])]})
 const load=async()=>{loading.value=true;error.value='';try{const page=await quality.tasks(query());rows.value=page.data;total.value=page.total}catch(e){error.value=messageOf(e)}finally{loading.value=false}}
 let templateRevision=0
 // 快速切换项目时丢弃旧请求，避免旧项目模板覆盖当前选择。
 const loadTemplates=async()=>{const revision=++templateRevision,project=form.projectId;templates.value=[];if(!project)return;const page=await quality.configs({paging:false,terms:[{column:'kind',value:'template'},{column:'status',value:1},{column:'configLevel',value:level},{column:'projectId',value:project}]});if(revision===templateRevision)templates.value=page.data.filter(t=>t.data.templateType!==2)}
 watch(()=>form.projectId,async()=>{if(open.value&&!readonly.value){form.templateId='';form.lineAssignees=[];form.configItems=[];try{await loadTemplates()}catch(e){error.value=messageOf(e)}}})
 const start=async(row?:Task,view=false)=>{error.value='';try{Object.keys(form).forEach(k=>delete (form as unknown as Record<string,unknown>)[k]);Object.assign(form,row?await quality.task(row.id!):fresh());readonly.value=view;await loadTemplates();open.value=true}catch(e){error.value=messageOf(e)}}

 const snapshots=computed<Snapshot[]>(()=>templates.value.find(t=>t.id===form.templateId)?.data.snapshot||form.templateSnapshot||[])
 const lines=computed(()=>[...new Map(snapshots.value.map(s=>[s.subjectParentId,{id:s.subjectParentId,name:s.subjectParentName||s.subjectParentId}])).values()])
 // 两个层级只加载当前项目模板，作业频次与检查项跟随模板快照。
 const selectTemplate=()=>{const template=templates.value.find(t=>t.id===form.templateId);if(level===2)form.inspectionFrequency=template?.data.inspectionFrequency;form.lineAssignees=lines.value.map(l=>({subjectParentId:l.id,inspectorId:''}));form.configItems=snapshots.value.map(s=>({configId:s.configId,deductionStandard:s.deductionStandard||''}))}
 const setAssignee=(line:string,user:unknown)=>{const row=form.lineAssignees.find(a=>a.subjectParentId===line);if(row)row.inspectorId=String(user||'')}
 const save=async()=>{if(saving.value)return;saving.value=true;error.value='';try{await quality.saveTask(form);open.value=false;await load()}catch(e){error.value=messageOf(e)}finally{saving.value=false}}
 const act=async(row:Task,action:string)=>{saving.value=true;error.value='';try{if(action==='delete')await quality.deleteTask(row.id!);else await quality.taskAction(row.id!,action);await load()}catch(e){error.value=messageOf(e)}finally{saving.value=false}}
 const showPlan=async(row:Task)=>{try{plan.value=await quality.schedules(row.id!);planOpen.value=true}catch(e){error.value=messageOf(e)}}
 const search=()=>{current.value=1;void load()};watch([projectId,status],search)
 onMounted(async()=>{try{await access.loadAccess();await load()}catch(e){error.value=messageOf(e)}})
 return {...access,selectedKeys,removeSelected,roles,candidates,projectId,rows,templates,loading,saving,error,open,current,total,name,status,readonly,plan,planOpen,form,snapshots,lines,query,load,start,selectTemplate,setAssignee,save,act,showPlan,search}
}
