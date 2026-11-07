<script setup lang="ts">
import {computed} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import {HomeOutlined,CarryOutOutlined,SafetyCertificateOutlined,UserOutlined,LeftOutlined} from '@ant-design/icons-vue'
import {qualityText as qt} from '../../shared/i18n'

const route=useRoute(),router=useRouter()
const login=computed(()=>route.path==='/login'),home=computed(()=>route.path==='/')
const detail=computed(()=>!!route.params.id)
const title=computed(()=>detail.value?qt('h5OrderDetail'):route.path==='/profile'?qt('h5MyAccount'):qt('h5MyOrders'))
const navigation=[
 {path:'/',activePath:'/',label:qt('h5Workspace'),icon:HomeOutlined},
 {path:'/orders?mode=inspect',activePath:'/orders',label:qt('h5MyOrders'),icon:CarryOutOutlined},
 {path:'/profile',activePath:'/profile',label:qt('h5Mine'),icon:UserOutlined}
]
const back=()=>{if(history.state?.back)router.back();else void router.replace('/')}
</script>

<template>
 <div class="quality-h5" :class="{'is-detail':detail}">
  <header v-if="!login" class="topbar" :class="{'home-nav':home}">
   <span v-if="home" class="header-side"><SafetyCertificateOutlined aria-hidden="true" class="brand-icon" /></span>
   <a-button v-else type="text" class="header-side back-button" :aria-label="qt('h5Back')" @click="back"><LeftOutlined aria-hidden="true" /></a-button>
   <h1>{{home?qt('h5QualityTitle'):title}}</h1>
   <router-link v-if="route.path!=='/profile'" to="/profile" class="header-side" :aria-label="qt('h5Mine')"><UserOutlined aria-hidden="true" /></router-link>
   <span v-else class="header-side" />
  </header>
  <main><router-view /></main>
  <nav v-if="!login&&!detail" class="bottom-nav" :aria-label="qt('h5MainNavigation')">
   <router-link v-for="item in navigation" :key="item.path" :to="item.path" :class="{active:route.path===item.activePath}" :aria-current="route.path===item.activePath?'page':undefined">
    <component :is="item.icon" aria-hidden="true" /><span>{{item.label}}</span>
   </router-link>
  </nav>
 </div>
</template>
