<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :destroy-on-close="destroyOnClose"
    :show-close="showClose"
    class="global-dialog"
    :class="dialogClass"
    @close="$emit('close')"
    @opened="$emit('opened')"
  >
    <!-- 自定义标题 -->
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>

    <!-- 主体内容 slot -->
    <div class="dialog-body" :style="bodyStyle">
      <slot />
    </div>

    <!-- 底部按钮 slot -->
    <template #footer>
      <slot name="footer">
        <div class="dialog-footer-default">
          <el-button @click="$emit('update:modelValue', false)">{{ cancelText }}</el-button>
          <el-button type="danger" :loading="confirmLoading" @click="$emit('confirm')">{{ confirmText }}</el-button>
        </div>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  /** v-model 控制显隐 */
  modelValue: { type: Boolean, default: false },
  /** 弹窗标题 */
  title: { type: String, default: '弹窗' },
  /** 弹窗宽度 */
  width: { type: String, default: '520px' },
  /** 点击遮罩关闭 */
  closeOnClickModal: { type: Boolean, default: true },
  /** 关闭后销毁 */
  destroyOnClose: { type: Boolean, default: true },
  /** 显示关闭按钮 */
  showClose: { type: Boolean, default: true },
  /** 额外 class */
  dialogClass: { type: String, default: '' },
  /** 确认按钮文字 */
  confirmText: { type: String, default: '确定' },
  /** 取消按钮文字 */
  cancelText: { type: String, default: '取消' },
  /** 确认按钮 loading */
  confirmLoading: { type: Boolean, default: false },
  /** body 自定义样式 */
  bodyStyle: { type: Object, default: () => ({}) },
})

defineEmits(['update:modelValue', 'confirm', 'close', 'opened'])
</script>

<style>
/* 全局样式（不加 scoped），所有使用 GlobalDialog 的弹窗共享 */
.global-dialog .el-dialog__header {
  border-bottom: 1px solid #f0f0f0;
  padding: 18px 24px;
  margin: 0;
}
.global-dialog .el-dialog__title {
  font-size: 16px;
  font-weight: 700;
}
.global-dialog .el-dialog__body {
  padding: 0;
}
.global-dialog .el-dialog__footer {
  border-top: 1px solid #f0f0f0;
  padding: 14px 24px;
}
.global-dialog .el-dialog {
  border-radius: 14px;
  overflow: hidden;
}

.dialog-body {
  max-height: 65vh;
  overflow-y: auto;
}

.dialog-footer-default {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
