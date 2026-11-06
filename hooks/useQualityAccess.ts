import {ref,watch} from 'vue'
import {request} from '@jetlinks-web/core'
import {quality} from '../api/quality'
import type {Context,Person} from '../shared/types'
export function useQualityAccess(){
 const context=ref<Context>(),projects=ref<Person[]>([]),projectId=ref<string>(),permissions=ref<{id:string;actions:string[]}[]>([])
 const can=(resource:string,action:string)=>permissions.value.some(p=>p.id===resource&&p.actions.includes(action))
 let projectKey=''
 // 项目选择只在当前用户/租户/应用的会话内共享，恢复时重新验证目录权限。
 watch(projectId,value=>{if(projectKey){if(value)sessionStorage.setItem(projectKey,value);else sessionStorage.removeItem(projectKey)}})
 const loadAccess=async()=>{const [c,p,a]=await Promise.all([quality.context(),quality.projects(),request.get('/authorize/me')]);context.value=c;projects.value=p;permissions.value=a.result?.permissions||[];projectKey='quality:project:'+JSON.stringify([c.tenantId,c.applicationId,c.userId]);const saved=sessionStorage.getItem(projectKey);projectId.value=p.some(project=>project.id===saved)?saved!:undefined}

 return {context,projects,projectId,can,loadAccess}
}
