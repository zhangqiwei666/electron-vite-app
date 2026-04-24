<template>
  <div class="data-mgmt">
    <!-- 工具栏 -->
    <div class="dm-toolbar">
      <div class="dm-toolbar-left">
        <el-input v-model="search" placeholder="搜索文件..." size="default" :prefix-icon="Search" style="width: 220px;" />
        <div class="view-toggle">
          <span class="vt-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">📋</span>
          <span class="vt-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">📦</span>
        </div>
      </div>
      <div class="dm-toolbar-right">
        <el-button size="default" plain>新建文件夹</el-button>
        <el-button type="danger" size="default">上传文件</el-button>
      </div>
    </div>

    <!-- 路径导航 -->
    <div class="breadcrumb-bar">
      <span class="bc-item" v-for="(b, i) in breadcrumbs" :key="i" @click="i < breadcrumbs.length - 1 && navigateTo(i)">
        {{ b }}
        <span v-if="i < breadcrumbs.length - 1" class="bc-sep">›</span>
      </span>
    </div>

    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'" class="file-table-wrap">
      <el-table :data="filteredFiles" :header-cell-style="headerStyle" :cell-style="cellStyle">
        <el-table-column label="文件名" min-width="280">
          <template #default="{ row }">
            <div class="file-name-cell">
              <span class="file-icon">{{ row.icon }}</span>
              <span class="file-n" :class="{ folder: row.isFolder }">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="100" />
        <el-table-column prop="modified" label="修改时间" width="140" />
        <el-table-column prop="owner" label="所有者" width="100" />
        <el-table-column label="操作" width="190">
          <template #default>
            <el-button size="small" text type="primary">下载</el-button>
            <el-button size="small" text>分享</el-button>
            <el-button size="small" text type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 网格视图 -->
    <div v-else class="file-grid">
      <div class="file-card" v-for="f in filteredFiles" :key="f.name">
        <div class="fc-icon" :class="{ folder: f.isFolder }">{{ f.icon }}</div>
        <div class="fc-name">{{ f.name }}</div>
        <div class="fc-meta">{{ f.size }} · {{ f.modified }}</div>
      </div>
    </div>

    <!-- 存储信息 -->
    <div class="storage-bar">
      <div class="storage-info">
        <span>存储使用：<b>8.9 GB</b> / 20 GB</span>
      </div>
      <div class="storage-track"><div class="storage-fill" style="width: 44.5%"></div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

const search = ref('')
const viewMode = ref('list')
const breadcrumbs = ref(['全部文件', '项目资料', '2024-Q3'])

const files = ref([
  { name: '产品需求文档', icon: '📁', isFolder: true, size: '—', modified: '07-20 14:30', owner: '陈刚' },
  { name: '设计规范', icon: '📁', isFolder: true, size: '—', modified: '07-18 09:15', owner: '李明' },
  { name: 'API 接口文档.pdf', icon: '📄', isFolder: false, size: '2.4 MB', modified: '07-22 16:40', owner: '张伟' },
  { name: '技术架构图.png', icon: '🖼️', isFolder: false, size: '856 KB', modified: '07-19 11:20', owner: '王芳' },
  { name: '测试用例集.xlsx', icon: '📊', isFolder: false, size: '1.2 MB', modified: '07-21 10:05', owner: '刘洋' },
  { name: '会议纪要_0718.docx', icon: '📝', isFolder: false, size: '340 KB', modified: '07-18 15:30', owner: '赵敏' },
  { name: '数据库设计.sql', icon: '🗃️', isFolder: false, size: '128 KB', modified: '07-17 08:45', owner: '张伟' },
  { name: '部署指南.md', icon: '📋', isFolder: false, size: '56 KB', modified: '07-15 13:20', owner: '孙磊' },
])

const filteredFiles = computed(() => {
  if (!search.value) return files.value
  return files.value.filter(f => f.name.toLowerCase().includes(search.value.toLowerCase()))
})

function navigateTo(index) {
  breadcrumbs.value = breadcrumbs.value.slice(0, index + 1)
}

const headerStyle = { background: '#fafafa', color: '#999', fontSize: '12px', fontWeight: 500, padding: '10px 0' }
const cellStyle = { fontSize: '13px', color: '#333', padding: '12px 0' }
</script>

<style scoped>
.data-mgmt { display: flex; flex-direction: column; gap: 14px; }
.dm-toolbar { display: flex; align-items: center; justify-content: space-between; background: #fff; border-radius: 12px; padding: 14px 20px; border: 1px solid #f0f0f0; }
.dm-toolbar-left,.dm-toolbar-right { display: flex; align-items: center; gap: 10px; }
.view-toggle { display: flex; background: #f5f5f5; border-radius: 8px; overflow: hidden; }
.vt-btn { padding: 6px 10px; cursor: pointer; font-size: 14px; transition: all 0.15s; }
.vt-btn.active { background: #1a1a1a; border-radius: 6px; }

.breadcrumb-bar { display: flex; align-items: center; gap: 4px; padding: 0 4px; }
.bc-item { font-size: 13px; color: #999; cursor: pointer; transition: color 0.15s; }
.bc-item:last-child { color: #1a1a1a; font-weight: 600; cursor: default; }
.bc-item:hover:not(:last-child) { color: #e74c3c; }
.bc-sep { margin: 0 4px; color: #ccc; }

.file-table-wrap { background: #fff; border-radius: 12px; padding: 8px; border: 1px solid #f0f0f0; }
:deep(.el-table) { --el-table-border-color: transparent; }
:deep(.el-table th.el-table__cell) { background: #fafafa !important; }
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) { background: #fafbfc !important; }

.file-name-cell { display: flex; align-items: center; gap: 10px; }
.file-icon { font-size: 20px; }
.file-n { font-weight: 500; color: #333; }
.file-n.folder { font-weight: 700; color: #1a1a1a; cursor: pointer; }
.file-n.folder:hover { color: #e74c3c; }

.file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.file-card { background: #fff; border-radius: 12px; padding: 20px 16px; border: 1px solid #f0f0f0; text-align: center; cursor: pointer; transition: all 0.15s; }
.file-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); border-color: #e0e0e0; }
.fc-icon { font-size: 36px; margin-bottom: 8px; }
.fc-icon.folder { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
.fc-name { font-size: 13px; font-weight: 600; color: #333; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fc-meta { font-size: 11px; color: #bbb; }

.storage-bar { background: #fff; border-radius: 12px; padding: 16px 20px; border: 1px solid #f0f0f0; }
.storage-info { font-size: 13px; color: #666; margin-bottom: 8px; }
.storage-info b { color: #1a1a1a; }
.storage-track { height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; }
.storage-fill { height: 100%; background: linear-gradient(90deg, #e74c3c, #f39c12); border-radius: 3px; transition: width 0.8s ease; }
</style>
