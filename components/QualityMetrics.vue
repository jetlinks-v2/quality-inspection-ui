<script setup lang="ts">
defineProps<{summary:Record<string,number>}>()
const fields=[['total','工单总数'],['status1','待核查'],['status2','待整改'],['status3','待复验'],['status4','已完成'],['overdue','逾期未完成'],['recordCount','检查项数'],['unqualifiedCount','不合格项数'],['qualifiedRate','合格率（%）']]
</script><template><a-row :gutter="[16,16]" style="margin:16px 0 24px"><a-col v-for="[key,title] in fields" :key="key" :xs="12" :md="8" :xl="4"><a-card size="small"><a-statistic :title="title" :value="summary[key]||0" /></a-card></a-col></a-row></template>
