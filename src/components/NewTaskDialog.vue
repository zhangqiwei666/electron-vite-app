<template>
  <GlobalDialog
    v-model="visible"
    title="新建任务"
    width="560px"
    confirm-text="创建任务"
    :confirm-loading="submitting"
    @confirm="handleSubmit"
    @close="$emit('update:modelValue', false)"
  >
    <!-- 默认表单内容 -->
    <div class="task-form-body">
      <!-- 自定义内容插槽：如果父组件传入子内容，则展示自定义内容 -->
      <slot>
        <el-form :model="form" :rules="rules" ref="formRef" label-position="top" class="task-form">
          <el-form-item label="任务名称" prop="name">
            <el-input v-model="form.name" placeholder="输入任务名称..." size="large" />
          </el-form-item>

          <div class="form-row">
            <el-form-item label="负责人" prop="owner" class="flex-1">
              <el-select v-model="form.owner" placeholder="选择负责人" size="default" style="width:100%">
                <el-option label="张伟" value="张伟" />
                <el-option label="李明" value="李明" />
                <el-option label="王芳" value="王芳" />
                <el-option label="陈刚" value="陈刚" />
                <el-option label="刘洋" value="刘洋" />
              </el-select>
            </el-form-item>
            <el-form-item label="优先级" prop="priority" class="flex-1">
              <el-select v-model="form.priority" placeholder="选择优先级" size="default" style="width:100%">
                <el-option label="🔴 高优先级" value="HIGH" />
                <el-option label="🟡 中优先级" value="MED" />
                <el-option label="🟢 低优先级" value="LOW" />
              </el-select>
            </el-form-item>
          </div>

          <div class="form-row">
            <el-form-item label="截止日期" prop="deadline" class="flex-1">
              <el-date-picker
                v-model="form.deadline"
                type="date"
                placeholder="选择日期"
                size="default"
                style="width:100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item label="所属项目" class="flex-1">
              <el-select v-model="form.project" placeholder="选择项目" size="default" style="width:100%">
                <el-option label="用户认证重构" value="auth" />
                <el-option label="设计系统" value="design" />
                <el-option label="数据看板V2" value="dashboard" />
                <el-option label="移动端适配" value="mobile" />
              </el-select>
            </el-form-item>
          </div>

          <el-form-item label="任务描述">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="描述任务目标和验收标准..."
              resize="none"
            />
          </el-form-item>

          <el-form-item label="标签">
            <div class="tag-selector">
              <el-tag
                v-for="tag in allTags"
                :key="tag"
                :type="form.tags.includes(tag) ? 'danger' : 'info'"
                :effect="form.tags.includes(tag) ? 'dark' : 'plain'"
                class="tag-item"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </el-tag>
            </div>
          </el-form-item>
        </el-form>
      </slot>
    </div>
  </GlobalDialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import GlobalDialog from './GlobalDialog.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  name: '',
  owner: '',
  priority: '',
  deadline: '',
  project: '',
  description: '',
  tags: []
})

const rules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  owner: [{ required: true, message: '请选择负责人', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  deadline: [{ required: true, message: '请选择截止日期', trigger: 'change' }],
}

const allTags = ['前端', '后端', '设计', 'Bug修复', '新功能', '文档', '测试', '运维']

function toggleTag(tag) {
  const idx = form.tags.indexOf(tag)
  if (idx > -1) {
    form.tags.splice(idx, 1)
  } else {
    form.tags.push(tag)
  }
}

async function handleSubmit() {
  if (formRef.value) {
    try {
      await formRef.value.validate()
    } catch {
      return
    }
  }
  submitting.value = true
  // 模拟提交
  setTimeout(() => {
    emit('submit', { ...form })
    ElMessage.success('任务创建成功')
    // 重置表单
    Object.assign(form, { name: '', owner: '', priority: '', deadline: '', project: '', description: '', tags: [] })
    submitting.value = false
    emit('update:modelValue', false)
  }, 800)
}
</script>

<style scoped>
.task-form-body { padding: 20px 24px; }

:deep(.task-form .el-form-item__label) {
  font-size: 13px; font-weight: 600; color: #333; padding-bottom: 4px;
}

.form-row { display: flex; gap: 16px; }
.flex-1 { flex: 1; }

.tag-selector { display: flex; flex-wrap: wrap; gap: 8px; }
.tag-item { cursor: pointer; transition: all 0.15s; border-radius: 6px; }
.tag-item:hover { transform: scale(1.05); }

:deep(.el-textarea__inner) { border-radius: 8px; }
</style>
