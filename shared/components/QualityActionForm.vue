<script setup lang="ts">
import {computed,defineAsyncComponent} from 'vue'
import type {QualityClient} from '../client'
import type {useQualityDetail} from '../useQualityDetail'
import type {UnwrapRef} from 'vue'
const Media=defineAsyncComponent(()=>import('./QualityMedia.vue'))
const props=defineProps<{api:QualityClient;vm:UnwrapRef<ReturnType<typeof useQualityDetail>>}>()
const titles:Record<string,string>={inspect:'提交核查',submit:'提交整改',pass:'复验通过',reject:'驳回复验',reassign:'转派核查',dispatch:'指派核查',rectReassign:'转派整改'}
const title=computed(()=>titles[props.vm.action]||'处理工单')
</script>
<template><a-modal :open="!!vm.action" :title="title" :width="760" :confirm-loading="vm.saving" :mask-closable="false" @cancel="vm.close" @ok="vm.submit(false)">
 <a-alert v-if="vm.error" :message="vm.error" type="error" show-icon /><a-alert v-if="vm.success" :message="vm.success" type="success" show-icon />
 <a-form layout="vertical">
 <a-card v-for="result in vm.results" :key="result.recordId" :title="vm.record(result.recordId)?.checkContentName" size="small" style="margin-bottom:16px">
 <p>{{vm.record(result.recordId)?.subjectParentName}} / {{vm.record(result.recordId)?.subjectName}}</p><p style="white-space:pre-wrap">{{vm.record(result.recordId)?.checkRequirement}}</p><p>照片要求：{{vm.record(result.recordId)?.photoRequirement}}</p>
 <template v-if="vm.action==='inspect'"><a-form-item label="核查结果"><a-radio-group v-model:value="result.isQualified"><a-radio :value="1">合格</a-radio><a-radio :value="0">不合格</a-radio></a-radio-group></a-form-item><a-form-item :label="'实得分（原始分值 '+vm.record(result.recordId)?.originalScore+'）'"><a-input-number v-model:value="result.score" :precision="0" :min="vm.record(result.recordId)?.originalScore===0?undefined:0" :max="vm.record(result.recordId)?.originalScore" /><p>{{vm.record(result.recordId)?.deductionStandard}}</p></a-form-item><a-form-item label="检查说明"><a-textarea v-model:value="result.checkResult" :maxlength="8000" :rows="3" /></a-form-item></template>
 <a-form-item :label="vm.action==='submit'?'逐项整改照片':'核查照片'"><Media :api="api" :ids="result.photoIds" @change="ids=>result.photoIds=ids" /></a-form-item></a-card>
 <a-form-item v-if="['reassign','dispatch'].includes(vm.action)" label="转派条线"><a-select mode="multiple" :options="vm.lineOptions" @change="(v:unknown)=>vm.selectLines(v as string[])" /></a-form-item>
 <a-form-item v-if="['inspect','reassign','dispatch','rectReassign'].includes(vm.action)" :label="vm.action==='inspect'?'不合格项整改人':'接收人'"><a-select v-model:value="vm.assigneeIds" :mode="vm.action==='reassign'||vm.action==='dispatch'?'multiple':'multiple'" :max-tag-count="3" :options="vm.candidates.map(p=>({value:p.id,label:p.name}))" show-search option-filter-prop="label" /></a-form-item>
 <a-form-item v-if="['submit','reject'].includes(vm.action)" :label="vm.action==='submit'?'整改说明':'驳回原因'"><a-textarea v-model:value="vm.description" :rows="4" :maxlength="8000" /></a-form-item><p v-if="vm.action==='pass'">确认本批次的所有问题均已整改并通过复验？</p>
 </a-form><template #footer><a-button @click="vm.close">取消</a-button><a-button v-if="vm.action==='inspect'" :loading="vm.saving" @click="vm.submit(true)">保存草稿</a-button><a-button type="primary" :loading="vm.saving" @click="vm.submit(false)">{{title}}</a-button></template></a-modal></template>
