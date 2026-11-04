<script setup lang="ts">
import {reactive} from 'vue'
import {state} from '../services/session'
import {useSession} from '../hooks/useSession'
const vm=reactive(useSession())
</script><template><section class="page"><a-card title="我的账号"><p>{{state.authorization?.user.name}}</p><p>项目编码：{{state.session?.tenantDomain}}</p><a-alert v-if="vm.error" :message="vm.error" type="error" /><a-button danger block :loading="vm.loading" @click="vm.logout">退出登录</a-button></a-card></section></template>
