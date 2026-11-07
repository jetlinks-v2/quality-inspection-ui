<script setup lang="ts">
import {computed} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import {HomeOutlined,FileSearchOutlined,ToolOutlined,SafetyCertificateOutlined,UserOutlined,LeftOutlined} from '@ant-design/icons-vue'
import {qualityText as qt} from '../../shared/i18n'
import {qualityModes} from './services/navigation'

const route=useRoute(),router=useRouter()
const login=computed(()=>route.path==='/login'),home=computed(()=>route.path==='/')
const detail=computed(()=>!!route.params.id)
const title=computed(()=>detail.value?qt('h5OrderDetail'):route.path==='/profile'?qt('h5MyAccount'):qualityModes.find(item=>item.value===route.query.mode)?.label||qt('pendingInspection'))
const navigation=[
 {path:'/',label:qt('h5Workspace'),icon:HomeOutlined},
 {path:'/orders?mode=inspect',label:qt('pendingInspection'),icon:FileSearchOutlined,mode:'inspect'},
 {path:'/orders?mode=rectify',label:qt('pendingRectification'),icon:ToolOutlined,mode:'rectify'},
 {path:'/orders?mode=review',label:qt('pendingReview'),icon:SafetyCertificateOutlined,mode:'review'},
 {path:'/profile',label:qt('h5Mine'),icon:UserOutlined}
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
   <router-link v-for="item in navigation" :key="item.path" :to="item.path" :class="{active:item.mode?route.path==='/orders'&&String(route.query.mode||'inspect')===item.mode:route.path===item.path}" :aria-current="(item.mode?route.path==='/orders'&&String(route.query.mode||'inspect')===item.mode:route.path===item.path)?'page':undefined">
    <component :is="item.icon" aria-hidden="true" /><span>{{item.label}}</span>
   </router-link>
  </nav>
 </div>
</template>
