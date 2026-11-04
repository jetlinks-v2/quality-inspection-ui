import {createApp,h} from 'vue'
import {createRouter,createWebHashHistory} from 'vue-router'
import Antd,{ConfigProvider} from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import 'ant-design-vue/dist/reset.css'
import './style.css'
import App from './App.vue'
import {initializeConfig,state,clearSession,attachHostBridge} from './services/session'
import {verifySession} from './hooks/useSession'
const router=createRouter({history:createWebHashHistory(),routes:[{path:'/',component:()=>import('./views/HomePage.vue')},{path:'/login',component:()=>import('./views/LoginPage.vue')},{path:'/orders',component:()=>import('./views/OrderListPage.vue')},{path:'/orders/:id',component:()=>import('./views/OrderDetailPage.vue')},{path:'/profile',component:()=>import('./views/ProfilePage.vue')},{path:'/:pathMatch(.*)*',redirect:'/'}]})
async function bootstrap(){await initializeConfig();router.beforeEach(async to=>{if(to.path==='/login')return true;if(!state.session)return '/login';if(!state.authorization){try{await verifySession()}catch{clearSession();return '/login'}}return true});attachHostBridge(async()=>{try{await verifySession();await router.replace('/')}catch{clearSession();await router.replace('/login')}});window.addEventListener('quality:session-expired',()=>void router.replace('/login'));createApp({render:()=>h(ConfigProvider,{locale:zhCN,theme:{token:{colorPrimary:'#1677ff',borderRadius:9,controlHeight:42}}},()=>h(App))}).use(Antd).use(router).mount('#app')}
void bootstrap().catch(()=>{document.getElementById('app')!.textContent='应用配置加载失败，请刷新重试。'})
