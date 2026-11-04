<script setup lang="ts">
import {reactive} from 'vue'
import JEcharts from '@jetlinks-web-core/components/Echarts/Echarts.vue'
import {useQualityHome} from '../hooks/useQualityHome'
import {qualityText as qt} from '../shared/i18n'
const vm=reactive(useQualityHome())
</script>
<template>
 <a-card :title="qt('qualityOverview')">
  <a-alert v-if="vm.error" :message="vm.error" type="error" show-icon style="margin-bottom:16px" />
  <a-space wrap>
   <a-select v-model:value="vm.projectId" :options="vm.projects.map(p=>({value:p.id,label:p.name}))" allow-clear :placeholder="qt('allBusinessProjects')" style="width:240px" />
   <a-range-picker v-model:value="vm.dates" value-format="YYYY-MM-DD" :allow-clear="false" />
   <a-button type="primary" :loading="vm.loading" @click="vm.load">{{qt('search')}}</a-button>
  </a-space>
  <a-spin :spinning="vm.loading">
   <a-row :gutter="[16,16]" style="margin:24px 0">
    <a-col :xs="12" :lg="6"><a-statistic :title="qt('shouldComplete')" :value="vm.overview?.shouldCompleteCount||0" /></a-col>
    <a-col :xs="12" :lg="6"><a-statistic :title="qt('actualComplete')" :value="vm.overview?.actualCompleteCount||0" /></a-col>
    <a-col :xs="12" :lg="6"><a-statistic :title="qt('completionRate')" :value="vm.percent(vm.overview?.taskCompleteRate)" /></a-col>
    <a-col :xs="12" :lg="6"><a-statistic :title="qt('qualificationRate')" :value="vm.percent(vm.overview?.qualifiedRate)" /></a-col>
   </a-row>
   <a-row :gutter="[16,16]">
    <a-col :xs="24" :xl="14"><a-card :title="qt('completionTrend')"><template #extra><a-radio-group v-model:value="vm.mode" size="small"><a-radio-button value="day">{{qt('today')}}</a-radio-button><a-radio-button value="week">{{qt('recentWeek')}}</a-radio-button><a-radio-button value="month">{{qt('currentMonth')}}</a-radio-button></a-radio-group></template>
     <a-space wrap style="margin-bottom:16px"><span>{{qt('shouldComplete')}} {{vm.trend?.shouldCompleteCount||0}}</span><span>{{qt('actualComplete')}} {{vm.trend?.actualCompleteCount||0}}</span><span>{{qt('completionRate')}} {{vm.percent(vm.trend?.taskCompleteRate)}}</span><span>{{qt('qualificationRate')}} {{vm.percent(vm.trend?.qualifiedRate)}}</span></a-space>
     <div style="height:340px"><JEcharts v-if="vm.trend" :option="vm.trendOption" /><a-empty v-else /></div>
    </a-card></a-col>
    <a-col :xs="24" :xl="10"><a-card :title="qt('projectComparison')"><div style="height:380px"><JEcharts v-if="vm.compare.length" :option="vm.compareOption" /><a-empty v-else /></div></a-card></a-col>
   </a-row>
  </a-spin>
 </a-card>
</template>
