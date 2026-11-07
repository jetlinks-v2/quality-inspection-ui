import 'altcha/external'
import 'altcha/altcha.css'
import 'altcha/i18n/zh-cn'
import Pbkdf2Worker from 'altcha/workers/pbkdf2?worker'
import {onBeforeUnmount,onMounted,ref} from 'vue'
import {loginRequest} from '../api/login'
import {state} from '../services/session'
import type {CaptchaRequirement,CaptchaResult} from '../services/projectLogin'

interface Widget extends HTMLElement {configure(options:Record<string,unknown>):Promise<void>}
declare const $altcha:{algorithms:Map<string,()=>Worker>}
for(const algorithm of ['SHA-256','SHA-384','SHA-512'])$altcha.algorithms.set('PBKDF2/'+algorithm,()=>new Pbkdf2Worker())
/** 安全验证只返回本次登录的凭证，卸载时取消未完成的请求。 */
export function useLoginVerification(requirement:CaptchaRequirement,onSuccess:(result:CaptchaResult)=>void){
 const widget=ref<Widget>(),error=ref(''),loading=ref(true),image=ref(''),imageKey=ref(''),imageCode=ref('')
 const controller=new AbortController()
 const context=requirement.key?{key:requirement.key}:{contextToken:requirement.contextToken}
 let disposed=false

 async function complete(params:Record<string,string>){
  if(requirement.key){
   const result=await loginRequest<{token:string}>(state.config,'/verify/captcha/_confirm',{key:requirement.key,provider:requirement.config.type,params},{signal:controller.signal})
   if(!result.token)throw Error('安全验证失败，请重新登录')
   if(!disposed)onSuccess({verification:{key:requirement.key,token:result.token}})
  }else if(!disposed){onSuccess(requirement.config.type==='altcha'?{...params,contextToken:requirement.contextToken}:params)}
 }
 async function verified(event:Event){
  const payload=(event as CustomEvent<{payload?:string}>).detail?.payload
  if(!payload||loading.value)return
  loading.value=true;error.value=''
  try{
   const config=requirement.config.altcha
   if(!config)throw Error('安全验证配置不可用')
   const result=await loginRequest<{proof:string;expiresAt:number}>(state.config,config.prevalidateUrl,{...context,payload},{signal:controller.signal})
   if(!result.proof||!Number.isFinite(result.expiresAt)||result.expiresAt<=Date.now())throw Error('安全验证已过期，请重试')
   await complete({proof:result.proof})
  }catch(e){if(!disposed)error.value=e instanceof Error?e.message:'安全验证失败'}finally{if(!disposed)loading.value=false}
 }
 async function load(){
  loading.value=true;error.value='';imageCode.value=''
  try{
   if(requirement.config.type==='image'){
    const result=await loginRequest<{base64:string;key:string}>(state.config,'/authorize/captcha/image?width=160&height=44',undefined,{signal:controller.signal})
    image.value=result.base64;imageKey.value=result.key
   }else if(requirement.config.type==='altcha'){
    const config=requirement.config.altcha
    if(!config||(!requirement.key&&!requirement.contextToken))throw Error('安全验证配置不可用')
    const challenge=await loginRequest<Record<string,unknown>>(state.config,config.challengeUrl,context,{signal:controller.signal})
    if(disposed)return
    await widget.value?.configure({auto:'off',challenge,hideFooter:true,hideLogo:true,language:'zh-cn',workers:2,retryOnOutOfMemoryError:false})
   }else throw Error('当前验证方式暂不支持，请联系项目管理员')
  }catch(e){if(!disposed)error.value=e instanceof Error?e.message:'无法加载安全验证'}finally{if(!disposed)loading.value=false}
 }
 async function confirmImage(){
  if(!imageCode.value.trim()||loading.value)return
  loading.value=true;error.value=''
  try{await complete({verifyKey:imageKey.value,verifyCode:imageCode.value.trim()})}
  catch(e){error.value=e instanceof Error?e.message:'安全验证失败'}finally{loading.value=false}
 }
 onMounted(()=>{widget.value?.addEventListener('verified',verified);void load()})
 onBeforeUnmount(()=>{disposed=true;controller.abort();widget.value?.removeEventListener('verified',verified)})
 return {widget,error,loading,image,imageCode,load,confirmImage}
}
