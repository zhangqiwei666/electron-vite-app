<template>
  <div class="dashboard">
    <!-- ═══ 统计卡片 ═══ -->
    <div class="stat-cards">
      <div class="stat-card" v-for="s in stats" :key="s.label">
        <div class="stat-top">
          <span class="stat-label">{{ s.label }}</span>
          <span class="stat-icon" :style="{ color: s.iconColor }">{{ s.icon }}</span>
        </div>
        <div class="stat-value">{{ s.value }}</div>
        <div class="stat-trend" :class="s.trendType">
          {{ s.trend }}
        </div>
      </div>
    </div>

    <!-- ═══ 中间区域：任务列表 + 最近动态 ═══ -->
    <div class="mid-section">
      <!-- 任务列表 -->
      <div class="task-panel">
        <div class="panel-header">
          <h3 class="panel-title">任务列表</h3>
          <a href="#" class="panel-link" @click.prevent>全部（24）→</a>
        </div>
        <el-table :data="tasks" class="task-table" :header-cell-style="headerStyle" :cell-style="cellStyle">
          <el-table-column label="任务名称" min-width="180">
            <template #default="{ row }">
              <div class="task-name-cell">
                <span class="task-dot" :style="{ background: row.dotColor }"></span>
                <span class="task-name">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="owner" label="负责人" width="80" />
          <el-table-column prop="deadline" label="截止日期" width="90" />
          <el-table-column label="优先级" width="80">
            <template #default="{ row }">
              <span class="priority-tag" :class="row.priority.toLowerCase()">{{ row.priority }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <span class="status-tag" :class="row.statusType">{{ row.status }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 最近动态 -->
      <div class="activity-panel">
        <div class="panel-header">
          <h3 class="panel-title">最近动态</h3>
          <a href="#" class="panel-link red" @click.prevent>查看全部</a>
        </div>
        <div class="activity-list">
          <div class="activity-item" v-for="a in activities" :key="a.id">
            <div class="act-header">
              <span class="act-user">{{ a.user }}</span>
              <span class="act-action">{{ a.action }}</span>
              <span class="act-time">{{ a.time }}</span>
            </div>
            <div class="act-detail">{{ a.detail }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 底部指标卡 ═══ -->
    <div class="metric-cards">
      <div class="metric-card" v-for="m in metrics" :key="m.label">
        <div class="metric-top">
          <span class="metric-label" :style="{ borderColor: m.color }">{{ m.label }}</span>
          <span class="metric-value">{{ m.value }}</span>
        </div>
        <div class="metric-bar">
          <div class="metric-fill" :style="{ width: m.percent + '%', background: m.color }"></div>
        </div>
        <div class="metric-sub" :style="{ color: m.color }">{{ m.sub }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref([
  { label: '进行中任务', value: 24, icon: '📈', iconColor: '#e74c3c', trend: '↗ +3 较昨日', trendType: 'up' },
  { label: '待处理事项', value: 8, icon: '⚡', iconColor: '#f39c12', trend: '↘ -2 较昨日', trendType: 'down' },
  { label: '本周完成', value: 47, icon: '📈', iconColor: '#27ae60', trend: '↗ +12 较上周', trendType: 'up' },
  { label: '团队成员', value: 12, icon: '👥', iconColor: '#3498db', trend: '↗ +1 新成员', trendType: 'up' },
])

const tasks = ref([
  { name: '重构用户认证模块', owner: '张伟', deadline: '07-18', priority: 'HIGH', dotColor: '#e74c3c', status: '进行中', statusType: 'running' },
  { name: '设计系统组件更新', owner: '李明', deadline: '07-22', priority: 'MED', dotColor: '#f39c12', status: '进行中', statusType: 'running' },
  { name: 'API性能优化报告', owner: '王芳', deadline: '07-15', priority: 'LOW', dotColor: '#27ae60', status: '已完成', statusType: 'done' },
  { name: '移动端适配专项', owner: '陈刚', deadline: '07-25', priority: 'HIGH', dotColor: '#e74c3c', status: '待处理', statusType: 'pending' },
  { name: '数据看板V2迭代', owner: '刘洋', deadline: '07-30', priority: 'MED', dotColor: '#f39c12', status: '进行中', statusType: 'running' },
])

const activities = ref([
  { id: 1, user: '张伟', action: '提交了代码审查', time: '10分钟前', detail: '重构用户认证模块 · PR #142' },
  { id: 2, user: '李明', action: '更新了设计稿', time: '32分钟前', detail: '设计系统组件更新 · v2.4.1' },
  { id: 3, user: '王芳', action: '完成了任务', time: '1小时前', detail: 'API性能优化报告 · 已关闭' },
  { id: 4, user: '陈刚', action: '新建了任务', time: '2小时前', detail: '移动端适配专项 · 高优先级' },
  { id: 5, user: '刘洋', action: '发起了会议', time: '3小时前', detail: '数据看板V2 迭代评审 · 明日14:00' },
])

const metrics = ref([
  { label: '本周任务完成率', value: '78%', percent: 78, color: '#e74c3c', sub: '47/60 任务已完成' },
  { label: '本周代码提交', value: '132', percent: 66, color: '#27ae60', sub: '+24 较上周' },
  { label: '文档覆盖率', value: '63%', percent: 63, color: '#f39c12', sub: '目标 ≥ 80% · 待提升' },
])

const headerStyle = { background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-secondary)', fontSize: '12px', fontWeight: 500, padding: '10px 0' }
const cellStyle = { fontSize: '13px', color: 'var(--el-text-color-primary)', padding: '12px 0', background: 'transparent' }
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 20px; }

/* ═══ 统计卡片 ═══ */
.stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-card { background: var(--el-bg-color); border-radius: 12px; padding: 20px; border: 1px solid var(--el-border-color-light); transition: box-shadow 0.2s; }
.stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
.stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.stat-label { font-size: 13px; color: var(--el-text-color-secondary); }
.stat-icon { font-size: 18px; }
.stat-value { font-size: 36px; font-weight: 800; color: var(--el-text-color-primary); margin-bottom: 6px; letter-spacing: -1px; }
.stat-trend { font-size: 12px; }
.stat-trend.up { color: var(--el-color-success); }
.stat-trend.down { color: var(--el-color-danger); }

/* ═══ 中间区域 ═══ */
.mid-section { display: grid; grid-template-columns: 1fr 320px; gap: 16px; }

/* 任务面板 */
.task-panel { background: var(--el-bg-color); border-radius: 12px; padding: 20px; border: 1px solid var(--el-border-color-light); overflow: hidden; }
.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.panel-title { margin: 0; font-size: 15px; font-weight: 700; color: var(--el-text-color-primary); }
.panel-link { font-size: 12px; color: var(--el-text-color-secondary); text-decoration: none; transition: color 0.2s; }
.panel-link:hover { color: var(--el-text-color-primary); }
.panel-link.red { color: var(--el-color-danger); }

.task-name-cell { display: flex; align-items: center; gap: 8px; }
.task-dot { width: 4px; height: 20px; border-radius: 2px; flex-shrink: 0; }
.task-name { font-weight: 600; color: var(--el-text-color-primary); }

.priority-tag { font-size: 11px; font-weight: 700; letter-spacing: 0.5px; padding: 2px 8px; border-radius: 4px; }
.priority-tag.high { color: var(--el-color-danger); background: var(--el-color-danger-light-9); }
.priority-tag.med { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
.priority-tag.low { color: var(--el-color-success); background: var(--el-color-success-light-9); }

.status-tag { font-size: 12px; font-weight: 500; padding: 3px 10px; border-radius: 20px; }
.status-tag.running { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
.status-tag.done { color: var(--el-color-success); background: var(--el-color-success-light-9); }
.status-tag.pending { color: var(--el-color-danger); background: var(--el-color-danger-light-9); }

/* Element Plus table 覆盖 */
:deep(.el-table) { --el-table-border-color: transparent; --el-table-header-bg-color: var(--el-fill-color-lighter); }
:deep(.el-table th.el-table__cell) { background: var(--el-fill-color-lighter) !important; color: var(--el-text-color-secondary); }
:deep(.el-table tr) { background: transparent; }
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) { background: var(--el-fill-color-light) !important; }
:deep(.el-table td.el-table__cell) { border-bottom: 1px solid var(--el-border-color-lighter); }

/* 动态面板 */
.activity-panel { background: var(--el-bg-color); border-radius: 12px; padding: 20px; border: 1px solid var(--el-border-color-light); }
.activity-list { display: flex; flex-direction: column; gap: 4px; }
.activity-item { padding: 14px 0; border-bottom: 1px solid var(--el-border-color-lighter); }
.activity-item:last-child { border-bottom: none; }
.act-header { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.act-user { font-weight: 700; color: var(--el-text-color-primary); font-size: 13px; }
.act-action { font-size: 13px; color: var(--el-text-color-regular); }
.act-time { font-size: 11px; color: var(--el-text-color-placeholder); margin-left: auto; }
.act-detail { font-size: 12px; color: var(--el-text-color-secondary); margin-top: 4px; }

/* ═══ 底部指标 ═══ */
.metric-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.metric-card { background: var(--el-bg-color); border-radius: 12px; padding: 20px; border: 1px solid var(--el-border-color-light); }
.metric-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.metric-label { font-size: 13px; color: var(--el-text-color-primary); font-weight: 600; border-left: 3px solid; padding-left: 8px; }
.metric-value { font-size: 28px; font-weight: 800; color: var(--el-text-color-primary); }
.metric-bar { height: 4px; background: var(--el-fill-color-light); border-radius: 2px; margin-bottom: 8px; overflow: hidden; }
.metric-fill { height: 100%; border-radius: 2px; transition: width 0.8s ease; }
.metric-sub { font-size: 12px; }
</style>
