import {onBeforeUnmount,onMounted,ref} from 'vue'
import {quality} from '../api/quality'
import {saveBlob} from '../shared/client'
import {messageOf,type ExportTask} from '../shared/types'
export function useQualityExports(){
 const rows=ref<ExportTask[]>([]),current=ref(1),total=ref(0),loading=ref(false),error=ref(''),downloading=ref('');let timer:ReturnType<typeof setTimeout>|undefined,stopped=false
 const load=async()=>{loading.value=true;error.value='';try{const page=await quality.exports({pageIndex:current.value-1,pageSize:20,sorts:[{name:'createTime',order:'desc'}]});rows.value=page.data;total.value=page.total;if(rows.value.some(r=>r.status<2)&&!stopped){clearTimeout(timer);timer=setTimeout(()=>void load(),5000)}}catch(e){error.value=messageOf(e)}finally{loading.value=false}}
 const download=async(row:ExportTask)=>{downloading.value=row.id;try{const blob=await quality.downloadExport(row.id);if(blob.type.includes('json'))throw Error('文件下载失败');saveBlob(blob,row.name)}catch(e){error.value=messageOf(e)}finally{downloading.value=''}}
 onMounted(()=>void load());onBeforeUnmount(()=>{stopped=true;clearTimeout(timer)});return {rows,current,total,loading,error,downloading,load,download}
}
