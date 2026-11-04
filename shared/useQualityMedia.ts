import {qualityText as qt} from './i18n'
import {onBeforeUnmount,ref} from 'vue'
import type {QualityClient} from './client'
import {messageOf} from './types'
export function useQualityMedia(api:QualityClient,changed:(ids:string[])=>void){
 const busy=ref(false),error=ref(''),preview=ref(''),previewType=ref(''),names=ref<Record<string,string>>({})
 const upload=async(file:File,ids:string[])=>{busy.value=true;error.value='';try{if(ids.length>=50)throw Error(qt('upTo50PhotosAreAllowed'));const result=await api.upload(file);names.value[result.id]=file.name;changed([...ids,result.id])}catch(e){error.value=messageOf(e)}finally{busy.value=false}return false}
 const show=async(id:string)=>{error.value='';try{const blob=await api.file(id);if(blob.type.includes('json'))throw Error(qt('photoUnavailable'));close();preview.value=URL.createObjectURL(blob);previewType.value=blob.type}catch(e){error.value=messageOf(e)}}
 const close=()=>{if(preview.value)URL.revokeObjectURL(preview.value);preview.value=''}
 onBeforeUnmount(close);return {busy,error,preview,previewType,names,upload,show,close}
}
