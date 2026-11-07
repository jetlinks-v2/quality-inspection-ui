<script setup lang="ts">
import {EnvironmentOutlined,ClockCircleOutlined,ArrowRightOutlined} from '@ant-design/icons-vue'
import {orderStates,time,type WorkOrder} from '../../../shared/types'
import {qualityText as qt} from '../../../shared/i18n'

defineProps<{order:WorkOrder}>()
defineEmits<{open:[id:string]}>()
const statusColors:Record<number,string>={1:'blue',2:'orange',3:'cyan',4:'green'}
</script>

<template>
 <article class="order-card">
  <div class="card-heading"><span class="order-code">{{order.taskCode||qt('h5QualityTitle')}}</span><a-tag :color="statusColors[order.workOrderStatus]">{{orderStates[order.workOrderStatus]||'—'}}</a-tag></div>
  <h2>{{order.taskName}}</h2>
  <div class="order-meta"><p><EnvironmentOutlined aria-hidden="true" /><span>{{order.projectName||'—'}}</span></p><p><ClockCircleOutlined aria-hidden="true" /><span>{{qt('submissionTimeLimit')}}：{{time(order.reportDeadline)}}</span></p></div>
  <div class="order-card-footer"><div class="order-numbers"><span><strong>{{order.recordCount}}</strong> {{qt('h5CheckItems')}}</span><span>{{qt('score')}} <strong>{{order.totalScore??'—'}}</strong></span></div><a-button type="primary" ghost size="small" @click="$emit('open',order.id)">{{qt('h5ViewProcess')}} <ArrowRightOutlined aria-hidden="true" /></a-button></div>
 </article>
</template>
