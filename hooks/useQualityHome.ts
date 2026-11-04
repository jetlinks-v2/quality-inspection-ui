import {computed,onMounted,ref,watch} from 'vue'
import dayjs from 'dayjs'
import type {EChartsOption} from 'echarts'
import {quality} from '../api/quality'
import {qualityText as qt} from '../shared/i18n'
import {messageOf,type HomeOverview,type HomeTrend,type ProjectCompare} from '../shared/types'
import {useQualityAccess} from './useQualityAccess'

/** 总览日期与趋势时间窗各自查询；请求序号避免快速切换筛选时旧响应覆盖新结果。 */
export function useQualityHome(){
 const access=useQualityAccess(),projectId=ref<string>(),dates=ref<[string,string]>([dayjs().startOf('year').format('YYYY-MM-DD'),dayjs().format('YYYY-MM-DD')]),mode=ref<'day'|'week'|'month'>('day')
 const overview=ref<HomeOverview>(),trend=ref<HomeTrend>(),compare=ref<ProjectCompare[]>([]),loading=ref(false),error=ref('')
 let sequence=0
 const load=async()=>{const current=++sequence;loading.value=true;error.value='';try{const query={projectId:projectId.value,startDate:dates.value?.[0],endDate:dates.value?.[1]};const [o,t,c]=await Promise.all([quality.homeOverview(query),quality.homeTrend({projectId:projectId.value,trendType:mode.value}),quality.homeCompare(query)]);if(current!==sequence)return;overview.value=o;trend.value=t;compare.value=c}catch(e){if(current===sequence)error.value=messageOf(e)}finally{if(current===sequence)loading.value=false}}
 const percent=(value:number|null|undefined)=>value==null?'—':value+'%'
 const seriesNames=computed(()=>[qt('completionRate'),qt('qualificationRate')])
 const trendOption=computed<EChartsOption>(()=>({tooltip:{trigger:'axis'},legend:{data:seriesNames.value},grid:{left:48,right:24,bottom:48},xAxis:{type:'category',data:trend.value?.xAxis||[]},yAxis:{type:'value',axisLabel:{formatter:'{value}%'}},series:[{name:seriesNames.value[0],type:'line',data:trend.value?.taskCompleteRateSeries||[]},{name:seriesNames.value[1],type:'line',data:trend.value?.qualifiedRateSeries||[]}]}))
 const compareOption=computed<EChartsOption>(()=>({tooltip:{trigger:'axis'},legend:{data:seriesNames.value},grid:{left:48,right:24,bottom:70},xAxis:{type:'category',data:compare.value.map(r=>r.projectName),axisLabel:{rotate:20}},yAxis:{type:'value',axisLabel:{formatter:'{value}%'}},series:[{name:seriesNames.value[0],type:'bar',data:compare.value.map(r=>r.taskCompleteRate)},{name:seriesNames.value[1],type:'bar',data:compare.value.map(r=>r.qualifiedRate)}]}))
 watch(mode,()=>void load())
 onMounted(async()=>{try{await access.loadAccess();await load()}catch(e){error.value=messageOf(e)}})
 return {...access,projectId,dates,mode,overview,trend,compare,loading,error,load,percent,trendOption,compareOption}
}
