<script setup lang="ts">
import {defineAsyncComponent} from 'vue'
const Page=defineAsyncComponent(()=>import('../../../components/QualityHomePage.vue'))
</script>
<template><Page /></template>
