<script setup lang="ts">
import {reactive} from 'vue'
import {RightOutlined,FileSearchOutlined,ToolOutlined,SafetyCertificateOutlined,CheckCircleOutlined,HistoryOutlined,LogoutOutlined} from '@ant-design/icons-vue'
import {state} from '../services/session'
import {useSession} from '../hooks/useSession'
import {qualityModes} from '../services/navigation'
import {qualityText as qt} from '../../../shared/i18n'

const vm=reactive(useSession())
const icons={inspect:FileSearchOutlined,rectify:ToolOutlined,review:SafetyCertificateOutlined,completed:CheckCircleOutlined,related:HistoryOutlined}
</script>

<template>
 <section class="page profile-page">
  <div class="profile-panel panel"><div class="avatar">{{(state.authorization?.user.name||state.authorization?.user.username||qt('h5Employee')).slice(0,1)}}</div><h2>{{state.authorization?.user.name||state.authorization?.user.username||qt('h5Employee')}}</h2><p>{{qt('h5ProjectCode')}}：{{state.session?.tenantDomain}}</p><span class="profile-badge"><SafetyCertificateOutlined aria-hidden="true" /> {{qt('h5EmployeeWorkspace')}}</span></div>
  <div class="panel profile-links"><router-link v-for="item in qualityModes" :key="item.value" class="setting-row" :to="'/orders?mode='+item.value"><i><component :is="icons[item.value]" aria-hidden="true" /></i><span>{{item.value==='related'?qt('h5ParticipationHistory'):item.label}}</span><RightOutlined aria-hidden="true" /></router-link></div>
  <a-alert v-if="vm.error" :message="vm.error" type="error" show-icon />
  <a-button block danger :loading="vm.loading" class="logout-button" @click="vm.logout"><LogoutOutlined aria-hidden="true" />{{qt('h5Logout')}}</a-button>
 </section>
</template>
