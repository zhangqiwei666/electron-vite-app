<template>
  <div class="user-data">
    <!-- 顶部操作栏 -->
    <div class="ud-toolbar">
      <div class="ud-toolbar-left">
        <el-input v-model="search" placeholder="搜索用户..." size="default" :prefix-icon="Search" class="ud-search" style="width: 240px;" />
        <el-select v-model="roleFilter" placeholder="角色筛选" size="default" style="width: 130px;" clearable>
          <el-option label="管理员" value="admin" />
          <el-option label="开发者" value="dev" />
          <el-option label="设计师" value="designer" />
          <el-option label="产品经理" value="pm" />
        </el-select>
      </div>
      <el-button type="danger" size="default">+ 添加用户</el-button>
    </div>

    <!-- 用户表格 -->
    <div class="ud-table-wrap">
      <el-table :data="filteredUsers" class="ud-table" :header-cell-style="headerStyle" :cell-style="cellStyle">
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <div class="user-av" :style="{ background: row.color }">{{ row.name.charAt(0) }}</div>
              <div class="user-info">
                <span class="user-name">{{ row.name }}</span>
                <span class="user-email">{{ row.email }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <span class="role-tag" :class="row.role">{{ row.roleLabel }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="dept" label="部门" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <div class="status-cell">
              <span class="online-dot" :class="{ on: row.online }"></span>
              {{ row.online ? '在线' : '离线' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="tasks" label="任务数" width="80" />
        <el-table-column prop="lastActive" label="最近活跃" width="120" />
        <el-table-column label="操作" width="140">
          <template #default>
            <el-button size="small" text type="primary">编辑</el-button>
            <el-button size="small" text type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

const search = ref('')
const roleFilter = ref('')

const users = ref([
  { name: '张伟', email: 'zhangwei@company.com', role: 'dev', roleLabel: '开发者', dept: '技术部', online: true, tasks: 8, lastActive: '刚刚', color: '#3498db' },
  { name: '李明', email: 'liming@company.com', role: 'designer', roleLabel: '设计师', dept: '设计部', online: true, tasks: 5, lastActive: '5分钟前', color: '#9b59b6' },
  { name: '王芳', email: 'wangfang@company.com', role: 'dev', roleLabel: '开发者', dept: '技术部', online: false, tasks: 3, lastActive: '1小时前', color: '#27ae60' },
  { name: '陈刚', email: 'chengang@company.com', role: 'pm', roleLabel: '产品经理', dept: '产品部', online: true, tasks: 12, lastActive: '10分钟前', color: '#e74c3c' },
  { name: '刘洋', email: 'liuyang@company.com', role: 'dev', roleLabel: '开发者', dept: '技术部', online: false, tasks: 6, lastActive: '3小时前', color: '#1abc9c' },
  { name: '赵敏', email: 'zhaomin@company.com', role: 'admin', roleLabel: '管理员', dept: '管理层', online: true, tasks: 2, lastActive: '刚刚', color: '#f39c12' },
  { name: '孙磊', email: 'sunlei@company.com', role: 'dev', roleLabel: '开发者', dept: '技术部', online: false, tasks: 9, lastActive: '昨天', color: '#2c3e50' },
  { name: '周婷', email: 'zhouting@company.com', role: 'designer', roleLabel: '设计师', dept: '设计部', online: true, tasks: 4, lastActive: '20分钟前', color: '#e67e22' },
])

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchSearch = !search.value || u.name.includes(search.value) || u.email.includes(search.value)
    const matchRole = !roleFilter.value || u.role === roleFilter.value
    return matchSearch && matchRole
  })
})

const headerStyle = { background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-secondary)', fontSize: '12px', fontWeight: 500, padding: '10px 0' }
const cellStyle = { fontSize: '13px', color: 'var(--el-text-color-primary)', padding: '12px 0', background: 'transparent' }
</script>

<style scoped>
.user-data { display: flex; flex-direction: column; gap: 16px; }
.ud-toolbar { display: flex; align-items: center; justify-content: space-between; background: var(--el-bg-color-overlay); border-radius: 12px; padding: 14px 20px; border: 1px solid var(--el-border-color-light); }
.ud-toolbar-left { display: flex; gap: 10px; }
:deep(.ud-search .el-input__wrapper) { border-radius: 8px; }

.ud-table-wrap { background: var(--el-bg-color-overlay); border-radius: 12px; padding: 8px; border: 1px solid var(--el-border-color-light); overflow: hidden; }
:deep(.el-table) { --el-table-border-color: transparent; background-color: transparent !important; }
:deep(.el-table th.el-table__cell) { background: var(--el-fill-color-light) !important; }
:deep(.el-table tr) { background-color: transparent !important; }
:deep(.el-table td.el-table__cell) { border-bottom: 1px solid var(--el-border-color-light) !important; }
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) { background: var(--el-fill-color-light) !important; }

.user-cell { display: flex; align-items: center; gap: 12px; }
.user-av { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px; flex-shrink: 0; }
.user-info { display: flex; flex-direction: column; }
.user-name { font-weight: 600; color: var(--el-text-color-primary); font-size: 13px; }
.user-email { font-size: 11px; color: var(--el-text-color-secondary); }

.role-tag { font-size: 11px; padding: 3px 10px; border-radius: 6px; font-weight: 600; }
.role-tag.admin { background: rgba(243, 156, 18, 0.15); color: #f39c12; }
.role-tag.dev { background: rgba(52, 152, 219, 0.15); color: #3498db; }
.role-tag.designer { background: rgba(155, 89, 182, 0.15); color: #9b59b6; }
.role-tag.pm { background: rgba(39, 174, 96, 0.15); color: #27ae60; }

.status-cell { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--el-text-color-regular); }
.online-dot { width: 7px; height: 7px; border-radius: 50%; background: #ccc; }
.online-dot.on { background: #27ae60; box-shadow: 0 0 6px rgba(39,174,96,0.4); }
</style>
