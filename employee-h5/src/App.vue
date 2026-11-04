<script setup lang="ts">
import {computed} from 'vue'
import {useRoute,useRouter} from 'vue-router'
const route=useRoute(),router=useRouter(),login=computed(()=>route.path==='/login')
const back=()=>{if(history.state?.back)router.back();else void router.replace('/')}
</script><template><main class="quality-h5"><header v-if="!login" class="topbar"><a-button v-if="route.path!=='/'" type="text" @click="back">返回</a-button><strong>{{route.params.id?'品质工单详情':'品质核查'}}</strong><a-button type="text" @click="router.push('/profile')">我的</a-button></header><router-view /><nav v-if="!login" class="bottom-nav"><router-link to="/">工作台</router-link><router-link to="/orders?mode=inspect">待核查</router-link><router-link to="/orders?mode=rectify">待整改</router-link><router-link to="/orders?mode=review">待复验</router-link></nav></main></template>
