<script setup lang="ts">
import {computed} from 'vue'
import {qualityText as qt} from '../shared/i18n'

defineProps<{summary:Record<string,number>}>()
const fields=computed(()=>[['total',qt('totalOrders')],['status1',qt('pendingInspection')],['status2',qt('pendingRectification')],['status3',qt('pendingReview')],['status4',qt('completed')],['overdue',qt('overdueIncomplete')],['recordCount',qt('checkItems')],['unqualifiedCount',qt('unqualifiedItems')],['qualifiedRate',qt('qualificationRate')]])
</script><template><a-row :gutter="[16,16]" style="margin:16px 0 24px"><a-col v-for="[key,title] in fields" :key="key" :xs="12" :md="8" :xl="4"><a-card size="small"><a-statistic :title="title" :value="summary[key]||0" /></a-card></a-col></a-row></template>
