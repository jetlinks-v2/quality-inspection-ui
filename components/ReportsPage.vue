<script setup lang="ts">
import {qualityText as qt} from '../shared/i18n'
import {defineAsyncComponent,reactive} from 'vue'
import {quality} from '../api/quality'
import {useQualityReports} from '../hooks/useQualityReports'
const props=defineProps<{level:number}>(),vm=reactive(useQualityReports(props.level)),Detail=defineAsyncComponent(()=>import('../shared/components/QualityDetail.vue'))
const rateFields=new Set(['totalRate','validRate','comprehensiveQualifiedRate','rectificationRate','problemGrowthRate'])
</script>
<template>
 <a-card :title="(level===1?qt('company'):qt('project2'))+qt('qualityReports')">
  <template #extra><a-space><a-button @click="vm.load" :loading="vm.loading">{{qt('refresh')}}</a-button><a-button v-if="vm.can('quality-work-order','export')" @click="vm.exportRows">{{qt('exportCurrentReport')}}</a-button></a-space></template>
  <a-alert v-if="vm.error" :message="vm.error" type="error" show-icon /><a-alert v-if="vm.success" :message="vm.success" type="success" show-icon />
  <a-space wrap style="margin:16px 0">
   <a-select v-model:value="vm.projectId" show-search option-filter-prop="label" :options="vm.projects.map(p=>({value:p.id,label:p.name}))" allow-clear :placeholder="qt('allBusinessProjects')" style="width:230px" />
   <template v-if="vm.group!=='project'"><a-date-picker v-model:value="vm.startTime" value-format="x" show-time :placeholder="qt('inspectionStartTime')" /><a-date-picker v-model:value="vm.endTime" value-format="x" show-time :placeholder="qt('inspectionEndTime')" /></template>
   <a-button type="primary" @click="vm.search">{{qt('search')}}</a-button><a-button @click="vm.reset">{{qt('reset')}}</a-button>
  </a-space>
  <a-tabs v-model:activeKey="vm.group"><a-tab-pane key="project" :tab="qt('taskStatistics')" /><a-tab-pane key="line" :tab="qt('lineStatistics')" /><a-tab-pane key="problems" :tab="qt('issueDetails')" /></a-tabs>
  <a-table v-if="vm.group!=='problems'" :data-source="vm.rows" :columns="vm.columns" :loading="vm.loading" :row-key="(r:Record<string,unknown>)=>String(r.projectId||r.lineId)" :scroll="{x:'max-content'}">
   <template #bodyCell="{column,record,text}"><template v-if="column.key==='actions'"><a-button type="link" @click="vm.drill(record)">{{vm.group==='project'?qt('lineStatistics'):qt('issueDetails')}}</a-button></template><template v-else-if="rateFields.has(column.dataIndex)">{{vm.ratio(text)}}</template></template>
  </a-table>
  <a-table v-else :data-source="vm.problems" :loading="vm.loading" row-key="id" :pagination="{current:vm.current,total:vm.total,pageSize:20,showSizeChanger:false}" :scroll="{x:'max-content'}" @change="(p:{current?:number})=>{vm.current=p.current||1;vm.load()}">
   <a-table-column :title="qt('project2')" data-index="projectName" /><a-table-column :title="qt('inspectionLine')" data-index="subjectParentName" /><a-table-column :title="qt('subject')" data-index="subjectName" /><a-table-column :title="qt('checkItem')" data-index="checkContentName" /><a-table-column :title="qt('issueDescription2')" data-index="checkResult" /><a-table-column :title="qt('deductionRule')" data-index="deductionStandard" /><a-table-column :title="qt('inspector2')" data-index="executorName" /><a-table-column :title="qt('score')" data-index="score" /><a-table-column :title="qt('actions')" key="actions"><template #default="{record}"><a-button type="link" @click="vm.showDetail(record)">{{qt('viewOrder')}}</a-button></template></a-table-column>
  </a-table>
  <a-drawer v-model:open="vm.detailOpen" :title="qt('issueOrder')" width="1000" destroy-on-close><Detail v-if="vm.detailOpen" :api="quality" :id="vm.selected" @changed="vm.load" /></a-drawer>
 </a-card>
</template>
