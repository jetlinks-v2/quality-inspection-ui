import {ref} from 'vue'
import {request} from '@jetlinks-web/core'
import {quality} from '../api/quality'
import type {Context,Person} from '../shared/types'
export function useQualityAccess(){
 const context=ref<Context>(),projects=ref<Person[]>([]),people=ref<Person[]>([]),permissions=ref<{id:string;actions:string[]}[]>([])
 const can=(resource:string,action:string)=>permissions.value.some(p=>p.id===resource&&p.actions.includes(action))
 const loadAccess=async()=>{const [c,p,u,a]=await Promise.all([quality.context(),quality.projects(),quality.people(),request.get('/authorize/me')]);context.value=c;projects.value=p;people.value=u;permissions.value=a.result?.permissions||[]}
 return {context,projects,people,can,loadAccess}
}
