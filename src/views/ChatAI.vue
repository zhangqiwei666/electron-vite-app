<template>
  <div class="chat-ai-container">
    <div class="chat-header">
      <div class="chat-title">
        <el-icon><ChatDotRound /></el-icon>
        <span>Chat AI Assistant</span>
      </div>
      <div class="chat-status">🟢 Online</div>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(msg, index) in messages" :key="index" :class="['message-wrapper', msg.role]">
        <div class="message-bubble">{{ msg.content }}</div>
      </div>
    </div>
    
    <div class="chat-input-area">
      <el-input
        v-model="inputMsg"
        type="textarea"
        :rows="3"
        placeholder="Type a message to Chat AI..."
        resize="none"
        @keyup.enter.exact.prevent="sendMessage"
      />
      <el-button type="primary" class="send-btn glow-btn" @click="sendMessage">发送</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { ChatDotRound } from '@element-plus/icons-vue'

const inputMsg = ref('')
const messages = ref([
  { role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you today?' }
])
const messagesContainer = ref(null)

const sendMessage = () => {
  if (!inputMsg.value.trim()) return
  
  messages.value.push({ role: 'user', content: inputMsg.value })
  const userMsg = inputMsg.value
  inputMsg.value = ''
  
  scrollToBottom()
  
  // Mock AI response
  setTimeout(() => {
    messages.value.push({ role: 'assistant', content: `You said: "${userMsg}". This is a mock response from Chat AI.` })
    scrollToBottom()
  }, 1000)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}
</script>

<style scoped>
.chat-ai-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  font-family: system-ui, -apple-system, sans-serif;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--el-bg-color-overlay);
  border-bottom: 1px solid var(--el-border-color-light);
  -webkit-app-region: drag; /* 允许拖拽窗口 */
  height: 60px;
  box-sizing: border-box;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #8cba00;
}
html.dark .chat-title { color: #c8ff00; }

.chat-status {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  -webkit-app-region: no-drag;
}

.chat-messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.message-wrapper.user {
  justify-content: flex-end;
}

.message-wrapper.assistant {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  font-size: 14px;
  word-wrap: break-word;
}

.message-wrapper.user .message-bubble {
  background: #8cba00;
  color: #fff;
  border-bottom-right-radius: 4px;
}
html.dark .message-wrapper.user .message-bubble {
  background: #c8ff00;
  color: #000;
}

.message-wrapper.assistant .message-bubble {
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  border-bottom-left-radius: 4px;
}

.chat-input-area {
  padding: 16px 24px;
  background: var(--el-bg-color-overlay);
  border-top: 1px solid var(--el-border-color-light);
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.send-btn {
  height: 74px;
  width: 100px;
}

/* 核心按钮复写 (遵循 SKILL 规范) */
.glow-btn {
  background: linear-gradient(135deg, #c8ff00 0%, #a8e600 100%) !important;
  border: none !important;
  border-radius: 10px !important;
  color: #0a0a0a !important;
  font-weight: 700 !important;
  transition: all 0.25s;
}

.glow-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(200, 255, 0, 0.25);
}
</style>
