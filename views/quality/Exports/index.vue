<script setup lang="ts">
import {qualityText as qt} from '../../../shared/i18n'

import {reactive} from 'vue'
import {useQualityExports} from '../../../hooks/useQualityExports'
import {time} from '../../../shared/types'
const vm=reactive(useQualityExports())
</script><template><a-card :title="qt('exportManagement')"><template #extra><a-button @click="vm.load" :loading="vm.loading">{{qt('refresh')}}</a-button></template><a-alert v-if="vm.error" :message="vm.error" type="error" show-icon /><a-table :data-source="vm.rows" :loading="vm.loading" row-key="id" :pagination="{current:vm.current,total:vm.total,pageSize:20,showSizeChanger:false}" @change="(p:{current?:number})=>{vm.current=p.current||1;vm.load()}"><a-table-column :title="qt('fileName')" data-index="name" /><a-table-column :title="qt('created')" key="time"><template #default="{record}">{{time(record.createTime)}}</template></a-table-column><a-table-column :title="qt('status')" key="status"><template #default="{record}">{{[qt('queued'),qt('generating'),qt('completed'),qt('failed')][record.status]}}</template></a-table-column><a-table-column :title="qt('orders')" data-index="workOrderCount" /><a-table-column :title="qt('rows2')" data-index="recordCount" /><a-table-column :title="qt('failureReason')" data-index="failureReason" /><a-table-column :title="qt('actions')" key="actions"><template #default="{record}"><a-button :disabled="record.status!==2" :loading="vm.downloading===record.id" type="link" @click="vm.download(record)">{{qt('download')}}</a-button></template></a-table-column></a-table></a-card></template>
