import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({plugins:[vue()],resolve:{dedupe:['vue']},server:{fs:{allow:['..']},proxy:{'/api':{target:process.env.QUALITY_API_PROXY||'http://localhost:8800',changeOrigin:true,rewrite:path=>path.replace(/^\/api/,'')}}}})
