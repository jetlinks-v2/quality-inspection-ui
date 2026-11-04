export interface Session {token:string;tenantDomain:string;applicationId:string}
export interface RuntimeConfig {applicationId:string;tenantDomain:string;title:string;allowedHostOrigins:string[];apiBase:string}
export interface Authorization {user:{id:string;name?:string;username?:string};permissions:{id:string;actions:string[]}[];dimensions?:{type:string;id:string}[]}
