<script setup lang="ts">
import {reactive} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import {ReloadOutlined,EnvironmentOutlined} from '@ant-design/icons-vue'
import {useQualityList} from '../hooks/useQualityList'
import {qualityModes} from '../services/navigation'
import {qualityText as qt} from '../../../shared/i18n'
import WorkOrderCard from '../components/WorkOrderCard.vue'

const vm=reactive(useQualityList()),route=useRoute(),router=useRouter()
</script>

<template>
 <section class="list-page">
  <div class="list-toolbar">
   <div class="status-tabs" role="tablist" :aria-label="qt('h5OrderType')">
    <a-button v-for="item in qualityModes" :key="item.value" type="text" role="tab" :aria-selected="String(route.query.mode||'inspect')===item.value" :class="{selected:String(route.query.mode||'inspect')===item.value}" @click="router.replace('/orders?mode='+item.value)">{{item.label}}</a-button>
   </div>
   <div class="list-filters"><EnvironmentOutlined aria-hidden="true" /><label for="quality-project-filter" class="sr-only">{{qt('businessProject')}}</label><a-select id="quality-project-filter" v-model:value="vm.projectId" :options="vm.projects.map(p=>({value:p.id,label:p.name}))" :placeholder="qt('h5AllProjects')" show-search option-filter-prop="label" allow-clear /><a-button type="text" :loading="vm.loading" @click="vm.load"><ReloadOutlined aria-hidden="true" />{{qt('refresh')}}</a-button></div>
  </div>
  <div class="list-content">
   <a-alert v-if="vm.error" :message="vm.error" type="error" show-icon><template #action><a-button size="small" @click="vm.load">{{qt('h5Retry')}}</a-button></template></a-alert>
   <div class="list-caption"><span>{{qt('h5TotalRecordsPrefix')}} <strong>{{vm.total}}</strong> {{qt('h5TotalRecordsSuffix')}}</span></div>
   <a-spin :spinning="vm.loading">
    <div class="order-list"><WorkOrderCard v-for="order in vm.rows" :key="order.id" :order="order" @open="id=>router.push('/orders/'+id)" /></div>
    <a-empty v-if="!vm.loading&&!vm.error&&!vm.rows.length" :description="qt('h5NoOrders')" class="quality-empty"><template #image><img src="/images/quality/inspection.svg" alt="" /></template><p>{{qt('h5EmptyHint')}}</p></a-empty>
    <a-skeleton v-if="vm.loading&&!vm.rows.length" active class="list-skeleton" />
   </a-spin>
   <a-pagination v-if="vm.total" v-model:current="vm.current" :total="vm.total" :page-size="10" simple class="list-pagination" @change="vm.load" />
  </div>
 </section>
</template>
