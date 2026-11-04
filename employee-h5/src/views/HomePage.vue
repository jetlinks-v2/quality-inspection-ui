<script setup lang="ts">
import {reactive} from 'vue'
import {useRouter} from 'vue-router'
import {useQualityHome} from '../hooks/useQualityHome'
import {state} from '../services/session'
const vm=reactive(useQualityHome()),router=useRouter(),items=[{mode:'inspect',name:'待核查'},{mode:'rectify',name:'待整改'},{mode:'review',name:'待复验'},{mode:'completed',name:'已完成'}]
</script><template><section class="home-intro"><h1>{{state.authorization?.user.name||'员工'}}，您好</h1><p>品质核查 · 员工工作台</p></section><section class="page"><a-alert v-if="vm.error" :message="vm.error" type="error" show-icon /><a-spin :spinning="vm.loading"><div class="todo-grid"><a-card v-for="item in items" :key="item.mode" tabindex="0" role="button" @click="router.push('/orders?mode='+item.mode)" @keydown.enter="router.push('/orders?mode='+item.mode)"><a-statistic :title="item.name" :value="vm.counts[item.mode]||0" /></a-card></div></a-spin><a-card title="核查记录" style="margin-top:20px"><a-button block @click="router.push('/orders?mode=related')">历史参与记录</a-button></a-card><a-button block style="margin-top:20px" :loading="vm.loading" @click="vm.load">刷新待办</a-button></section></template>
