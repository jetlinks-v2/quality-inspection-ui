import { clearSession,state } from '../services/session'
import type { Session } from '../types'
export class ApiError extends Error {constructor(message:string,public status:number){super(message)}}
/** 统一携带当前标签页的 SaaS 会话；候选登录会话可在持久化前进行应用授权。 */
export async function request<T>(path:string,body?:unknown,method=body===undefined?'GET':'POST',scoped=true,session:Session|undefined=state.session):Promise<T>{
 const headers:Record<string,string>={}
 if(scoped&&session){headers['X-Access-Token']=session.token;headers['X-Tenant-Domain']=session.tenantDomain;headers['X-Asset-Scope']='business_application:'+session.applicationId}
 const multipart=body instanceof FormData
 if(body!==undefined&&!multipart)headers['Content-Type']='application/json'
 const response=await fetch(state.config.apiBase+path,{method,headers,body:body===undefined?undefined:multipart?body as FormData:JSON.stringify(body),signal:AbortSignal.timeout(60000)})
 const data=await response.json() as {status?:number;message?:string;result:T}
 const status=data.status||response.status
 if(!response.ok||status!==200){if(scoped&&status===401){clearSession();window.dispatchEvent(new Event('quality:session-expired'))}throw new ApiError(data.message||'请求失败',status)}
 return data.result
}
export const errorText=(e:unknown)=>e instanceof Error?e.message:'操作失败，请重试'
