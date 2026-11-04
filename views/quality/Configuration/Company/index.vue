<script setup lang="ts">
import {defineAsyncComponent} from "vue"
const Page=defineAsyncComponent(()=>import("../../../../components/ConfigurationPage.vue"))
</script>
<template><Page :level="1" /></template>
