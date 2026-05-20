<template>
  <div class="msg-center">
    <!-- 顶部筛选 -->
    <div class="msg-toolbar">
      <div class="filter-tabs">
        <span class="filter-tab" :class="{ active: activeTab === t.key }" v-for="t in tabs" :key="t.key" @click="activeTab = t.key">
          {{ t.label }}
          <span v-if="t.count" class="tab-badge">{{ t.count }}</span>
        </span>
      </div>
      <el-button size="small" type="primary" plain>全部已读</el-button>
    </div>

    <!-- 消息列表 -->
    <div class="msg-list">
      <div class="msg-item" v-for="msg in filteredMessages" :key="msg.id" :class="{ unread: !msg.read }">
        <div class="msg-avatar" :style="{ background: msg.avatarColor }">{{ msg.from.charAt(0) }}</div>
        <div class="msg-body">
          <div class="msg-header">
            <span class="msg-from">{{ msg.from }}</span>
            <span class="msg-tag" :class="msg.type">{{ msg.typeLabel }}</span>
            <span class="msg-time">{{ msg.time }}</span>
          </div>
          <div class="msg-title">{{ msg.title }}</div>
          <div class="msg-preview">{{ msg.preview }}</div>
        </div>
        <div class="msg-dot" v-if="!msg.read"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('all')
const tabs = [
  { key: 'all', label: '全部', count: 12 },
  { key: 'system', label: '系统通知', count: 3 },
  { key: 'task', label: '任务提醒', count: 5 },
  { key: 'team', label: '团队消息', count: 4 },
]

const messages = ref([
  { id: 1, from: '系统', type: 'system', typeLabel: '系统', title: '版本 v2.6.2 已发布', preview: '本次更新包含：任务看板优化、数据导出功能增强、修复若干已知问题。', time: '10分钟前', read: false, avatarColor: '#e74c3c' },
  { id: 2, from: '张伟', type: 'task', typeLabel: '任务', title: '邀请你审查 PR #142', preview: '重构用户认证模块的代码审查请求，请及时查看并反馈。', time: '30分钟前', read: false, avatarColor: '#3498db' },
  { id: 3, from: '项目组', type: 'team', typeLabel: '团队', title: '本周团队例会通知', preview: '时间：周五 14:00，地点：会议室A3，议题：Q3规划回顾。', time: '1小时前', read: false, avatarColor: '#27ae60' },
  { id: 4, from: '李明', type: 'task', typeLabel: '任务', title: '设计稿 v2.4.1 已更新', preview: '组件库新增 DatePicker 和 TimePicker 设计规范。', time: '2小时前', read: true, avatarColor: '#9b59b6' },
  { id: 5, from: '系统', type: 'system', typeLabel: '系统', title: '安全提醒：异地登录检测', preview: '检测到您的账号在新设备上登录，如非本人操作请及时修改密码。', time: '3小时前', read: true, avatarColor: '#e74c3c' },
  { id: 6, from: '王芳', type: 'team', typeLabel: '团队', title: 'API 性能测试报告', preview: '本周接口响应时间平均降低 23%，详情请查看附件。', time: '5小时前', read: true, avatarColor: '#f39c12' },
  { id: 7, from: '刘洋', type: 'task', typeLabel: '任务', title: '数据看板V2评审邀请', preview: '明天14:00进行迭代评审，请提前准备相关材料。', time: '昨天', read: true, avatarColor: '#1abc9c' },
  { id: 8, from: '系统', type: 'system', typeLabel: '系统', title: '存储空间即将满额', preview: '当前已使用 89% 的存储配额，建议清理无用文件。', time: '昨天', read: true, avatarColor: '#e74c3c' },
])

const filteredMessages = computed(() => {
  if (activeTab.value === 'all') return messages.value
  return messages.value.filter(m => m.type === activeTab.value)
})
</script>

<style scoped>
.msg-center { display: flex; flex-direction: column; gap: 16px; }

.msg-toolbar { display: flex; align-items: center; justify-content: space-between; background: var(--el-bg-color-overlay); border-radius: 12px; padding: 12px 20px; border: 1px solid var(--el-border-color-light); }
.filter-tabs { display: flex; gap: 4px; }
.filter-tab { padding: 6px 16px; border-radius: 8px; font-size: 13px; color: var(--el-text-color-regular); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
.filter-tab:hover { background: var(--el-fill-color-light); }
.filter-tab.active { background: var(--el-text-color-primary); color: var(--el-bg-color); }
.tab-badge { background: #e74c3c; color: #fff; font-size: 10px; padding: 1px 6px; border-radius: 10px; font-weight: 600; }
.filter-tab.active .tab-badge { background: rgba(255,255,255,0.25); }

.msg-list { display: flex; flex-direction: column; gap: 8px; }
.msg-item { display: flex; align-items: flex-start; gap: 14px; background: var(--el-bg-color-overlay); border-radius: 12px; padding: 18px 20px; border: 1px solid var(--el-border-color-light); cursor: pointer; transition: all 0.15s; position: relative; }
.msg-item:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.15); border-color: #8cba00; }
html.dark .msg-item:hover { border-color: #c8ff00; }
.msg-item.unread { border-left: 3px solid #e74c3c; }

.msg-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 16px; flex-shrink: 0; }
.msg-body { flex: 1; min-width: 0; }
.msg-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.msg-from { font-weight: 700; font-size: 14px; color: var(--el-text-color-primary); }
.msg-tag { font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
.msg-tag.system { background: rgba(231, 76, 60, 0.15); color: #e74c3c; }
.msg-tag.task { background: rgba(52, 152, 219, 0.15); color: #3498db; }
.msg-tag.team { background: rgba(39, 174, 96, 0.15); color: #27ae60; }
.msg-time { font-size: 11px; color: var(--el-text-color-placeholder); margin-left: auto; }
.msg-title { font-size: 14px; font-weight: 600; color: var(--el-text-color-primary); margin-bottom: 4px; }
.msg-preview { font-size: 12px; color: var(--el-text-color-regular); line-height: 1.5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.msg-dot { width: 8px; height: 8px; background: #e74c3c; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
</style>
