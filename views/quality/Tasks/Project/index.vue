<script setup lang="ts">
import {defineAsyncComponent} from "vue"
const Page=defineAsyncComponent(()=>import("../../../../components/TaskPage.vue"))
</script>
<template><Page :level="2" /></template>
