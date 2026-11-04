import {onMounted,ref} from 'vue'
import {quality} from '../api/quality'
import {messageOf} from '../../../shared/types'
export function useQualityHome(){const loading=ref(false),error=ref(''),counts=ref<Record<string,number>>({});const load=async()=>{loading.value=true;error.value='';try{const modes=['inspect','rectify','review','completed'];await Promise.all(modes.map(async mode=>{counts.value[mode]=(await quality.orders({pageSize:1},mode)).total}))}catch(e){error.value=messageOf(e)}finally{loading.value=false}};onMounted(()=>void load());return {loading,error,counts,load}}
