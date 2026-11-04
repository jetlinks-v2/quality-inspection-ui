import {onMounted,ref,watch} from 'vue'
import {useRoute} from 'vue-router'
import {quality} from '../api/quality'
import {messageOf,type Person,type WorkOrder} from '../../../shared/types'
export function useQualityList(){const route=useRoute(),rows=ref<WorkOrder[]>([]),projects=ref<Person[]>([]),projectId=ref<string>(),current=ref(1),total=ref(0),loading=ref(false),error=ref('');let revision=0
 const load=async()=>{const own=++revision;loading.value=true;error.value='';try{const page=await quality.orders({pageIndex:current.value-1,pageSize:10,terms:projectId.value?[{column:'projectId',value:projectId.value}]:[]},String(route.query.mode||'inspect'));if(own===revision){rows.value=page.data;total.value=page.total}}catch(e){if(own===revision)error.value=messageOf(e)}finally{if(own===revision)loading.value=false}}
 watch([()=>route.query.mode,projectId],()=>{current.value=1;void load()});onMounted(async()=>{try{projects.value=await quality.projects();await load()}catch(e){error.value=messageOf(e)}});return {rows,projects,projectId,current,total,loading,error,load}}
