<script setup lang="ts">
import {reactive} from 'vue'
import type {QualityClient} from '../client'
import {useQualityMedia} from '../useQualityMedia'
const props=defineProps<{api:QualityClient;ids:string[];readonly?:boolean}>(),emit=defineEmits<{change:[ids:string[]]}>(),vm=reactive(useQualityMedia(props.api,ids=>emit('change',ids)))
</script>
<template><div class="quality-media"><a-alert v-if="vm.error" :message="vm.error" type="error" show-icon /><a-space wrap><span v-for="(id,i) in ids" :key="id"><a-button type="link" @click="vm.show(id)">{{vm.names[id]||'照片 '+(i+1)}}</a-button><a-button v-if="!readonly" type="text" danger size="small" :disabled="vm.busy" @click="emit('change',ids.filter(v=>v!==id))">移除</a-button></span><a-upload v-if="!readonly" :show-upload-list="false" accept="image/*" :disabled="vm.busy" :before-upload="(file:File)=>vm.upload(file,ids)"><a-button :loading="vm.busy">拍照 / 添加照片</a-button></a-upload><span v-if="!ids.length&&readonly">—</span></a-space><a-modal :open="!!vm.preview" title="照片预览" :footer="null" @cancel="vm.close"><img :src="vm.preview" style="max-width:100%;max-height:70vh;display:block;margin:auto" alt="核查照片" /></a-modal></div></template>
