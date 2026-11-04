import type {Action,CheckRecord,Configuration,Context,Detail,ExportTask,FileInfo,Pager,Person,Query,RepairInfo,RepairInput,RepairOption,Task,WorkOrder} from './types'
export interface Transport {get<T>(url:string):Promise<T>;post<T>(url:string,data:unknown):Promise<T>;remove<T>(url:string):Promise<T>;download(url:string):Promise<Blob>;upload(url:string,file:File):Promise<unknown>}
/** 跨端请求共享同一业务路径；会话和文件传输由各端既有宿主适配器负责。 */
export function qualityClient(http:Transport){
 const prefix='/quality',id=encodeURIComponent
 return {
  context:()=>http.get<Context>(prefix+'/context'),projects:()=>http.get<Person[]>(prefix+'/context/projects'),people:()=>http.get<Person[]>(prefix+'/context/employees'),
  configs:(q:Query)=>http.post<Pager<Configuration>>(prefix+'/configurations/_query',q),saveConfig:(r:Configuration)=>http.post<Configuration>(prefix+'/configurations',r),deleteConfig:(key:string)=>http.remove<void>(prefix+'/configurations/'+id(key)),
  tasks:(q:Query)=>http.post<Pager<Task>>(prefix+'/tasks/_query',q),task:(key:string)=>http.get<Task>(prefix+'/tasks/'+id(key)),saveTask:(r:Task)=>http.post<Task>(prefix+'/tasks',r),taskAction:(key:string,action:string)=>http.post<Task>(prefix+'/tasks/'+id(key)+'/'+action,{}),deleteTask:(key:string)=>http.remove<void>(prefix+'/tasks/'+id(key)),schedules:(key:string)=>http.get<{id:string;scheduledTime:number;cycleStartTime:number;cycleEndTime:number;status:number}[]>(prefix+'/tasks/'+id(key)+'/schedules'),
  orders:(q:Query,mode='pool')=>http.post<Pager<WorkOrder>>(prefix+'/work-orders/_query?mode='+id(mode),q),detail:(key:string)=>http.get<Detail>(prefix+'/work-orders/'+id(key)),candidates:(key:string,action:string)=>http.get<Person[]>(prefix+'/work-orders/'+id(key)+'/candidates?action='+id(action)),
  orderAction:(key:string,action:string,data:Action)=>http.post<WorkOrder>(prefix+'/work-orders/'+id(key)+'/'+action,data),rectAction:(key:string,action:string,data:Action)=>http.post<WorkOrder>(prefix+'/rectifications/'+id(key)+'/'+action,data),
  summary:(q:Query)=>http.post<Record<string,number>>(prefix+'/statistics',q),report:(q:Query,group:string)=>http.post<Record<string,string|number>[]>(prefix+'/reports/'+id(group),q),problems:(q:Query)=>http.post<Pager<CheckRecord>>(prefix+'/problems/_query',q),
  export:(q:Query,type:string)=>http.post<ExportTask>(prefix+'/exports?type='+id(type),q),exports:(q:Query)=>http.post<Pager<ExportTask>>(prefix+'/exports/_query',q),downloadExport:(key:string)=>http.download(prefix+'/exports/'+id(key)+'/file'),
  import:(target:string,level:number,project:string|undefined,file:File)=>http.upload(prefix+'/import/'+id(target)+'?level='+level+(project?'&projectId='+id(project):''),file),template:(target:string,level:number)=>http.download(prefix+'/import/'+id(target)+'/template?level='+level),
  upload:async(file:File)=>await http.upload('/file/upload',file) as FileInfo,file:(key:string)=>http.download('/file/'+id(key)),
  repairOptions:(project:string)=>http.get<RepairOption[]>(prefix+'/work-orders/repair/options/'+id(project)),transfer:(record:string,request:RepairInput)=>http.post<RepairInfo>(prefix+'/work-orders/records/'+id(record)+'/repair',{request}),linked:(record:string)=>http.get<RepairInfo>(prefix+'/work-orders/records/'+id(record)+'/repair')
 }
}
export type QualityClient=ReturnType<typeof qualityClient>
export function saveBlob(blob:Blob,name:string){const link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
