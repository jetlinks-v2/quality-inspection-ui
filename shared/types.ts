/** PC、H5共用品质契约；服务端是状态、范围及责任人的权威来源。 */
export interface Query {pageIndex?:number;pageSize?:number;paging?:boolean;terms?:Term[];sorts?:{name:string;order:string}[]}
export interface Term {column?:string;termType?:string;value?:unknown;type?:string;terms?:Term[]}
export interface Pager<T> {data:T[];total:number;pageIndex:number;pageSize:number}
export interface Person {id:string;name:string;displayName?:string;organizationId?:string}
export interface Base {id?:string;version?:number;projectId?:string;projectName?:string;applicationId?:string;createTime?:number;creatorName?:string;modifyTime?:number}
export interface LineWeight {subjectParentId:string;weight:number;subjectParentName?:string}
export interface Snapshot {configId:string;checkContentId?:string;contentName?:string;checkContent?:string;photoRequirement?:string;subjectParentId:string;subjectParentName?:string;subjectId?:string;subjectName?:string;score:number;deductionStandard?:string;inspectionFrequency?:number}
export interface Configuration extends Base {kind:string;name:string;configLevel:number;parentId?:string;status:number;sortOrder?:number;data:{checkContent?:string;photoRequirement?:string;checkContentId?:string;parentName?:string;subjectParentId?:string;subjectParentName?:string;score?:number;inspectionFrequency?:number;deductionStandard?:string;configItems?:{configId:string;score:number;deductionStandard?:string}[];snapshot?:Snapshot[];lineWeights?:LineWeight[];totalScore?:number;minScore?:number;maxScore?:number;repairApplicationId?:string;businessTypeId?:string;categoryId?:string;[key:string]:unknown}}
export interface Task extends Base {taskName:string;taskLevel:number;taskType:number;taskStatus?:number;templateId:string;templateName?:string;businessTypeId?:string;businessTypeName?:string;checkRole?:string;checkRoleName?:string;inspectionFrequency?:number;operationFrequency?:number;startTime?:number;endTime?:number;firstGenerateTime?:number;reportDeadline?:number;reportDeadlineValue?:number;reportDeadlineUnit?:string;intervalValue?:number;intervalUnit?:number;remark?:string;scheduleRules?:{dayTimes?:string[];weekTimes?:{weekDay:number;time:string}[];monthDateTimes?:string[]};lineAssignees:{subjectParentId:string;inspectorId:string;inspectorName?:string}[];configItems?:{configId:string;deductionStandard:string}[];templateSnapshot?:Snapshot[]}
export interface WorkOrder extends Base {id:string;version:number;taskName:string;taskId:string;taskCode:string;taskLevel:number;taskType:number;workOrderStatus:number;templateName:string;reportDeadline:number;scheduledTime:number;recordCount:number;originalTotalScore:number;totalScore?:number;evaluationName?:string;inspectorName?:string;inspectionTime?:number;completeTime?:number}
export interface CheckRecord extends Base {id:string;workOrderId:string;taskId:string;subjectParentId:string;subjectParentName:string;subjectName:string;checkContentName:string;checkRequirement:string;photoRequirement:string;originalScore:number;score?:number;isQualified?:number;checkResult?:string;deductionStandard?:string;executorId:string;executorName:string;recordStatus:number;photoIds?:string[];rectificationPhotoIds?:string[];repairOrderId?:string}
export interface Rectification extends Base {id:string;workOrderId:string;rectificationStatus:number;recordIds:string[];executorIds:string[];reviewerId:string;reviewerName:string;submitterName?:string;rectificationDesc?:string;rectificationTime?:number;reviewTime?:number;rejectReason?:string}
export interface Log extends Base {id:string;action:string;operatorName:string;details:Record<string,unknown>}
export interface Result {recordId:string;score:number;isQualified:number;checkResult:string;photoIds:string[]}
export interface Action {version:number;results?:Result[];recordIds?:string[];assigneeIds?:string[];description?:string}
export interface Detail {workOrder:WorkOrder;records:CheckRecord[];rectifications:Rectification[];history:Log[];draft:{results?:Result[]};currentUserId:string}
export interface Context {userId:string;userName:string;applicationId:string;tenantId:string;actions:string[]}
export interface ExportTask extends Base {id:string;name:string;exportScope:string;status:number;workOrderCount?:number;recordCount?:number;failureReason?:string}
export interface RepairOption {kind:string;id:string;name:string;parentId?:string;configuration:Record<string,unknown>}
export interface RepairInfo {id:string;number:string;status:number;applicationId:string}
export interface RepairInput {businessProjectId:string;categoryId:string;channelId:string;contactName:string;contactPhone:string;description:string;positionType:number;reportSource:number;location?:string;spaceId?:string;urgency:number;labelIds:string[];descriptionChoiceIds:string[];attachmentIds:string[]}
export interface FileInfo {id:string;name?:string;contentType?:string}
export const orderStates:Record<number,string>={1:'待核查',2:'待整改',3:'待复验',4:'已完成'}
export const taskStates:Record<number,string>={0:'待下发',1:'进行中',2:'已完成',3:'已关闭'}
export const rectStates:Record<number,string>={1:'待整改',2:'待复验',3:'已通过',4:'已驳回'}
export const actions:Record<string,string>={generate:'生成工单',issue:'下发任务',close:'关闭任务',inspect:'提交核查',assignRectification:'指派整改',rectify:'提交整改',reviewPass:'复验通过',reviewReject:'复验驳回',reassignInspection:'核查转派',reassignRectification:'整改转派'}
export const time=(value?:number)=>value?new Date(value).toLocaleString('zh-CN',{hour12:false}):'—'
export const messageOf=(error:unknown)=>{const e=error as {response?:{data?:{message?:string}};message?:string};return e.response?.data?.message||e.message||'操作失败，请重试'}
