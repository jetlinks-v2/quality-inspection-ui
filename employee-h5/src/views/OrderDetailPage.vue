<script setup lang="ts">
import {defineAsyncComponent} from 'vue'
import {useRoute} from 'vue-router'
import {quality} from '../api/quality'
const route=useRoute(),Detail=defineAsyncComponent(()=>import('../../../shared/components/QualityDetail.vue'))
</script><template><section class="page detail-page"><Detail :api="quality" :id="String(route.params.id)" /></section></template>
