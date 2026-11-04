<script setup lang="ts">
import {qualityText as qt} from '../i18n'

import {computed,defineAsyncComponent} from 'vue'
import type {QualityClient} from '../client'
import type {useQualityDetail} from '../useQualityDetail'
import type {UnwrapRef} from 'vue'
const Media=defineAsyncComponent(()=>import('./QualityMedia.vue'))
const props=defineProps<{api:QualityClient;vm:UnwrapRef<ReturnType<typeof useQualityDetail>>}>()
const titles=computed<Record<string,string>>(()=>({inspect:qt('submitInspection'),submit:qt('submitRectification'),pass:qt('reviewPassed'),reject:qt('rejectReview'),reassign:qt('reassignInspection2'),dispatch:qt('assignInspection'),rectReassign:qt('reassignRectification2')}))
const title=computed(()=>titles.value[props.vm.action]||qt('processOrder'))
</script>
<template><a-modal :open="!!vm.action" :title="title" :width="760" :confirm-loading="vm.saving" :mask-closable="false" @cancel="vm.close" @ok="vm.submit(false)">
 <a-alert v-if="vm.error" :message="vm.error" type="error" show-icon /><a-alert v-if="vm.success" :message="vm.success" type="success" show-icon />
 <a-form layout="vertical">
 <a-card v-for="result in vm.results" :key="result.recordId" :title="vm.record(result.recordId)?.checkContentName" size="small" style="margin-bottom:16px">
 <p>{{vm.record(result.recordId)?.subjectParentName}} / {{vm.record(result.recordId)?.subjectName}}</p><p style="white-space:pre-wrap">{{vm.record(result.recordId)?.checkRequirement}}</p><p>{{qt('photoRequirements2')}}{{vm.record(result.recordId)?.photoRequirement}}</p>
 <template v-if="vm.action==='inspect'"><a-form-item :label="qt('inspectionResults')"><a-radio-group v-model:value="result.isQualified"><a-radio :value="1">{{qt('qualified')}}</a-radio><a-radio :value="0">{{qt('unqualified')}}</a-radio></a-radio-group></a-form-item><a-form-item :label="qt('scoreOriginalPoints')+vm.record(result.recordId)?.originalScore+'）'"><a-input-number v-model:value="result.score" :precision="0" :min="vm.record(result.recordId)?.originalScore===0?undefined:0" :max="vm.record(result.recordId)?.originalScore" /><p>{{vm.record(result.recordId)?.deductionStandard}}</p></a-form-item><a-form-item :label="qt('checkInstructions')"><a-textarea v-model:value="result.checkResult" :maxlength="8000" :rows="3" /></a-form-item></template>
 <a-form-item :label="vm.action==='submit'?qt('perItemRectificationPhotos'):qt('inspectionPhotos')"><Media :api="api" :ids="result.photoIds" @change="ids=>result.photoIds=ids" /></a-form-item></a-card>
 <a-form-item v-if="['reassign','dispatch'].includes(vm.action)" :label="qt('reassignLine')"><a-select mode="multiple" :options="vm.lineOptions" @change="(v:unknown)=>vm.selectLines(v as string[])" /></a-form-item>
 <a-form-item v-if="['inspect','reassign','dispatch','rectReassign'].includes(vm.action)" :label="vm.action==='inspect'?qt('rectifiersForUnqualifiedItems'):qt('assignee')"><a-select v-model:value="vm.assigneeIds" :mode="vm.action==='reassign'||vm.action==='dispatch'?'multiple':'multiple'" :max-tag-count="3" :options="vm.candidates.map(p=>({value:p.id,label:p.name}))" show-search option-filter-prop="label" /></a-form-item>
 <a-form-item v-if="['submit','reject'].includes(vm.action)" :label="vm.action==='submit'?qt('rectificationDescription'):qt('rejectionReason')"><a-textarea v-model:value="vm.description" :rows="4" :maxlength="8000" /></a-form-item><p v-if="vm.action==='pass'">{{qt('confirmAllIssuesInThisBatchAreRectifiedAndPassReview')}}</p>
 </a-form><template #footer><a-button @click="vm.close">{{qt('cancel')}}</a-button><a-button v-if="vm.action==='inspect'" :loading="vm.saving" @click="vm.submit(true)">{{qt('saveDraft')}}</a-button><a-button type="primary" :loading="vm.saving" @click="vm.submit(false)">{{title}}</a-button></template></a-modal></template>
