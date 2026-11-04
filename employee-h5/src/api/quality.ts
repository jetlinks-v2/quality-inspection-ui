import {request} from './http'
import {state,clearSession} from '../services/session'
import {qualityClient} from '../../../shared/client'
import type {Authorization} from '../types'
export const authorize=()=>request<Authorization>('/authorize/me')
export const quality=qualityClient({get:<T>(url:string)=>request<T>(url),post:<T>(url:string,data:unknown)=>request<T>(url,data),remove:<T>(url:string)=>request<T>(url,undefined,'DELETE'),upload:async(url:string,file:File)=>{const form=new FormData();form.append('file',file);return request(url,form)},download:async(url:string)=>{
 const session=state.session;if(!session)throw Error('请先登录');const response=await fetch(state.config.apiBase+url,{headers:{'X-Access-Token':session.token,'X-Tenant-Domain':session.tenantDomain,'X-Asset-Scope':'business_application:'+session.applicationId}});if(response.status===401){clearSession();window.dispatchEvent(new Event('quality:session-expired'))}if(!response.ok)throw Error('文件不可访问');const blob=await response.blob();if(blob.type.includes('json')){const error=JSON.parse(await blob.text());throw Error(error.message||'文件不可访问')}return blob
}})
