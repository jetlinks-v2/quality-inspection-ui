<script setup lang="ts">
import {reactive} from 'vue'
import {ArrowRightOutlined,ReloadOutlined,FileSearchOutlined,ToolOutlined,SafetyCertificateOutlined,CheckCircleOutlined} from '@ant-design/icons-vue'
import {useQualityHome} from '../hooks/useQualityHome'
import {state} from '../services/session'
import {qualityModes} from '../services/navigation'
import {qualityText as qt} from '../../../shared/i18n'

const vm=reactive(useQualityHome())
const icons={inspect:FileSearchOutlined,rectify:ToolOutlined,review:SafetyCertificateOutlined,completed:CheckCircleOutlined,related:FileSearchOutlined}
</script>

<template>
 <section class="home-page">
  <div class="home-content">
   <div class="home-greeting"><h2>{{state.authorization?.user.name||state.authorization?.user.username||qt('h5Employee')}}{{qt('h5Hello')}}</h2><p>{{qt('h5EmployeeWorkspace')}}</p></div>
   <router-link class="inspection-banner" to="/orders?mode=inspect">
    <img class="banner-background" src="/images/quality/summary-bg.png" alt="" />
    <div class="banner-copy"><span class="eyebrow">{{qt('h5QualityTitle')}}</span><h2>{{qt('h5InspectBanner')}}</h2><span class="banner-action">{{qt('h5StartInspection')}} <ArrowRightOutlined aria-hidden="true" /></span></div>
    <img class="inspection-art" src="/images/quality/inspection.svg" alt="" fetchpriority="high" />
   </router-link>
   <div class="section-heading"><h2>{{qt('h5MyTasks')}}</h2><a-button type="text" size="small" :loading="vm.loading" @click="vm.load"><ReloadOutlined aria-hidden="true" />{{qt('refresh')}}</a-button></div>
   <a-alert v-if="vm.error" :message="vm.error" type="error" show-icon />
   <a-spin :spinning="vm.loading">
    <div class="metric-grid">
     <router-link v-for="item in qualityModes.slice(0,4)" :key="item.value" :to="'/orders?mode='+item.value" class="metric">
      <i class="metric-icon"><component :is="icons[item.value]" aria-hidden="true" /></i>
      <div><span class="metric-label">{{item.label}}</span><strong>{{vm.counts[item.value]??'—'}}</strong><span class="metric-hint">{{item.description}}</span></div>
      <ArrowRightOutlined aria-hidden="true" class="metric-arrow" />
     </router-link>
    </div>
   </a-spin>
   <div class="section-heading records-heading"><h2>{{qt('h5InspectionRecords')}}</h2></div>
   <router-link class="records-banner" to="/orders?mode=related">
    <img src="/images/quality/records-bg.png" alt="" loading="lazy" />
    <div><h3>{{qt('h5ParticipationHistory')}}</h3><span>{{qt('h5HistoryHint')}} <ArrowRightOutlined aria-hidden="true" /></span></div>
   </router-link>
  </div>
 </section>
</template>
