import {qualityText as qt} from '../shared/i18n'
import { request } from '@jetlinks-web/core'
import i18n from '@jetlinks-web-core/locales'
import {setQualityTranslator} from '../shared/i18n'
import { qualityClient } from '../shared/client'
interface Response<T> {success:boolean;status?:number;result:T;message?:string}
interface Http {get<T>(url:string,data?:unknown,options?:unknown):Promise<Response<T>>;post<T>(url:string,data?:unknown):Promise<Response<T>>;remove<T>(url:string):Promise<Response<T>>}
const http=request as Http
setQualityTranslator(key => i18n.global.t(key))
const result=<T>(r:Response<T>)=>{if(!r.success&&r.status!==200)throw Error(r.message||qt('requestFailed'));return r.result}
export const quality=qualityClient({get:async<T>(url:string)=>result(await http.get<T>(url)),post:async<T>(url:string,data:unknown)=>result(await http.post<T>(url,data)),remove:async<T>(url:string)=>result(await http.remove<T>(url)),download:async(url:string)=>{const r=await request.get(url,{}, {responseType:'blob'});return (r instanceof Blob?r:r.data) as Blob},upload:async(url:string,file:File)=>{const form=new FormData();form.append('file',file);return result(await http.post(url,form))}})
