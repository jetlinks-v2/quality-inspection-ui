<script setup lang="ts">
import {qualityText as qt} from '../i18n'

import {reactive} from 'vue'
import type {QualityClient} from '../client'
import {useQualityMedia} from '../useQualityMedia'
const props=defineProps<{api:QualityClient;ids:string[];readonly?:boolean}>()
const emit=defineEmits<{change:[ids:string[]]}>()
const vm=reactive(useQualityMedia(props.api,()=>props.ids,ids=>emit('change',ids)))
</script>

<template>
 <div class="quality-media">
  <a-alert v-if="vm.error" :message="vm.error" type="error" show-icon />
  <a-image-preview-group>
   <div class="quality-media-list">
    <div v-for="(id,i) in ids" :key="id" class="quality-media-item">
     <a-spin :spinning="vm.photos[id]?.loading??true">
      <a-image v-if="vm.photos[id]?.url" :src="vm.photos[id].url" :width="96" :height="96" :alt="vm.names[id]||qt('photo')+(i+1)" @error="vm.unavailable(id)" />
      <a-button v-else-if="vm.photos[id]?.error" class="quality-media-placeholder" :title="vm.photos[id].error" @click="vm.retry(id)">{{qt('photoUnavailable')}}<br />{{qt('refresh')}}</a-button>
      <div v-else class="quality-media-placeholder" />
     </a-spin>
     <div class="quality-media-caption" :title="vm.names[id]||qt('photo')+(i+1)">{{vm.names[id]||qt('photo')+(i+1)}}</div>
     <a-button v-if="!readonly" type="text" danger size="small" :disabled="vm.busy" @click="emit('change',ids.filter(v=>v!==id))">{{qt('remove')}}</a-button>
    </div>
    <a-upload v-if="!readonly" :show-upload-list="false" accept="image/*" :disabled="vm.busy" :before-upload="(file:File)=>vm.upload(file,ids)">
     <a-button :loading="vm.busy">{{qt('takeAddPhoto')}}</a-button>
    </a-upload>
    <span v-if="!ids.length&&readonly">—</span>
   </div>
  </a-image-preview-group>
 </div>
</template>

<style scoped>
.quality-media-list{display:flex;flex-wrap:wrap;align-items:flex-start;gap:12px}
.quality-media-item{width:96px;text-align:center}
.quality-media-item :deep(.ant-image-img){object-fit:cover;border-radius:6px}
.quality-media-placeholder{width:96px;height:96px;background:var(--ant-color-fill-tertiary,#f5f5f5);border:1px solid var(--ant-color-border,#d9d9d9);border-radius:6px;font-size:12px;white-space:normal}
.quality-media-caption{margin-top:4px;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
</style>
