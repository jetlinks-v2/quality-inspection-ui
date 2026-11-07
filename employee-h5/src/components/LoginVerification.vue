<script setup lang="ts">
import {useLoginVerification} from '../hooks/useLoginVerification'
import type {CaptchaRequirement,CaptchaResult} from '../services/projectLogin'
const props=defineProps<{requirement:CaptchaRequirement}>()
const emit=defineEmits<{success:[result:CaptchaResult];cancel:[]}>()
const {widget,error,loading,image,imageCode,load,confirmImage}=useLoginVerification(props.requirement,result=>emit('success',result))
</script>
<template>
 <a-modal :open="true" title="安全验证" :footer="null" :mask-closable="false" :width="380" @cancel="emit('cancel')">
  <a-alert v-if="error" :message="error" type="error" show-icon />
  <a-spin :spinning="loading">
   <altcha-widget v-if="requirement.config.type==='altcha'" ref="widget" :inert="loading" />
   <template v-else-if="image">
    <div class="captcha-row"><a-input v-model:value="imageCode" aria-label="验证码" autocomplete="off" :maxlength="8" @press-enter="confirmImage" /><a-button aria-label="刷新验证码" @click="load"><img :src="image" alt="图片验证码"></a-button></div>
    <a-button type="primary" block style="margin-top:16px" :disabled="!imageCode.trim()" @click="confirmImage">验证并登录</a-button>
   </template>
  </a-spin>
  <a-button v-if="error" block style="margin-top:16px" @click="load">重新加载验证</a-button>
 </a-modal>
</template>
<style scoped>altcha-widget{display:block;width:100%;--altcha-max-width:100%}</style>
