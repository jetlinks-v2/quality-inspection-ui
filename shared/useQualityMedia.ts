import {qualityText as qt} from './i18n'
import {onBeforeUnmount,ref,watch} from 'vue'
import type {QualityClient} from './client'
import {messageOf} from './types'
interface QualityPhoto {url:string;loading:boolean;error:string}

/** 文件按当前会话鉴权读取，缩略图与大图复用同一对象地址，移除或离开页面时释放。 */
export function useQualityMedia(api:QualityClient,ids:()=>string[],changed:(ids:string[])=>void){
 const busy=ref(false),error=ref(''),names=ref<Record<string,string>>({}),photos=ref<Record<string,QualityPhoto>>({})
 let disposed=false
 const release=(id:string)=>{const photo=photos.value[id];if(photo?.url)URL.revokeObjectURL(photo.url);delete photos.value[id]}
 const load=async(id:string)=>{
  if(disposed||photos.value[id])return
  photos.value[id]={url:'',loading:true,error:''}
  const photo=photos.value[id]
  try{
   const blob=await api.file(id)
   if(blob.type.includes('json'))throw Error(qt('photoUnavailable'))
   // 切换工单、删除照片或卸载后，忽略已失效的读取结果。
   if(!disposed&&photos.value[id]===photo)photo.url=URL.createObjectURL(blob)
  }catch(e){if(!disposed&&photos.value[id]===photo)photo.error=messageOf(e)}
  finally{photo.loading=false}
 }
 const retry=(id:string)=>{release(id);if(ids().includes(id))void load(id)}
 const unavailable=(id:string)=>{const photo=photos.value[id];if(photo){if(photo.url)URL.revokeObjectURL(photo.url);photo.url='';photo.error=qt('photoUnavailable')}}
 watch(()=>[...ids()],current=>{
  const retained=new Set(current)
  Object.keys(photos.value).filter(id=>!retained.has(id)).forEach(release)
  current.forEach(id=>void load(id))
 },{immediate:true})
 const upload=async(file:File,current:string[])=>{busy.value=true;error.value='';try{if(current.length>=50)throw Error(qt('upTo50PhotosAreAllowed'));const result=await api.upload(file);names.value[result.id]=file.name;changed([...current,result.id])}catch(e){error.value=messageOf(e)}finally{busy.value=false}return false}
 onBeforeUnmount(()=>{disposed=true;Object.keys(photos.value).forEach(release)})
 return {busy,error,names,photos,upload,retry,unavailable}
}
