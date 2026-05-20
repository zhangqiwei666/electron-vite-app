<template>
  <div class="chat-ai-container">
    <div class="chat-header">
      <div class="chat-title">
        <el-icon><ChatDotRound /></el-icon>
        <span>Chat AI Assistant</span>
      </div>
      <div class="chat-header-actions">
        <el-button size="small" circle :icon="Setting" class="header-settings-btn" @click="showConfig = !showConfig" />
        <span class="chat-status">🟢 Online</span>
      </div>
    </div>

    <!-- 顶部滑动配置面板 -->
    <el-collapse-transition>
      <div v-show="showConfig" class="chat-config-panel">
        <div class="panel-inner">
          <h4>🤖 AI API 凭证配置</h4>
          <el-form label-position="top" size="small">
            <el-form-item label="API 密钥 (API Key)">
              <el-input v-model="apiKey" type="password" show-password placeholder="请输入您的 API Key..." />
            </el-form-item>
            <el-row :gutter="12">
              <el-col :span="12">
                <el-form-item label="接口地址 (Base URL)">
                  <el-input v-model="baseURL" placeholder="例如 https://api.openai.com/v1" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="模型名称 (Model Name)">
                  <el-input v-model="modelName" placeholder="例如 gpt-3.5-turbo" />
                </el-form-item>
              </el-col>
            </el-row>
            <div class="panel-buttons">
              <el-button type="primary" class="glow-btn-mini" @click="saveSettings">保存并生效</el-button>
              <el-button size="default" @click="showConfig = false">关闭</el-button>
            </div>
          </el-form>
        </div>
      </div>
    </el-collapse-transition>
    
    <div class="chat-messages" ref="messagesContainer">
      <!-- 如果未配置 API Key，显示一个显眼的警告提示 -->
      <div v-if="!apiKey" class="config-warning-card">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          <h4>未检测到 AI API 凭证</h4>
          <p>要启用智能对话，请点击右上角齿轮图标或下方按钮，配置您的 API 密钥与模型参数。</p>
          <el-button type="warning" size="small" @click="showConfig = true">立即配置</el-button>
        </div>
      </div>

      <div v-for="(msg, index) in messages" :key="index" :class="['message-wrapper', msg.role]">
        <div class="message-bubble">{{ msg.content }}</div>
      </div>
    </div>
    
    <div class="chat-input-area">
      <el-input
        v-model="inputMsg"
        type="textarea"
        :rows="3"
        placeholder="输入您想问的问题，按 Enter 发送..."
        resize="none"
        :disabled="isSending"
        @keyup.enter.exact.prevent="sendMessage"
      />
      <el-button type="primary" class="send-btn glow-btn" :loading="isSending" @click="sendMessage">发送</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { ChatDotRound, Setting } from '@element-plus/icons-vue'
import { ChatOpenAI } from '@langchain/openai'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { ElMessage } from 'element-plus'

const inputMsg = ref('')
const messages = ref([
  { role: 'assistant', content: '您好！我是您的智能 AI 助理，已完美连接 LangChain 引擎。请问今天有什么我可以帮您的吗？' }
])
const messagesContainer = ref(null)

const apiKey = ref('')
const baseURL = ref('https://api.openai.com/v1')
const modelName = ref('gpt-3.5-turbo')
const showConfig = ref(false)
const isSending = ref(false)

function loadSettings() {
  try {
    const saved = localStorage.getItem('app-settings')
    if (saved) {
      const data = JSON.parse(saved)
      apiKey.value = data.apiKey || ''
      baseURL.value = data.baseURL || 'https://api.openai.com/v1'
      modelName.value = data.modelName || 'gpt-3.5-turbo'
    }
  } catch (e) {
    console.error(e)
  }
}

function saveSettings() {
  try {
    const saved = localStorage.getItem('app-settings')
    let data = saved ? JSON.parse(saved) : {}
    data.apiKey = apiKey.value
    data.baseURL = baseURL.value
    data.modelName = modelName.value
    localStorage.setItem('app-settings', JSON.stringify(data))
    ElMessage.success('API 配置已保存并同步')
    showConfig.value = false
  } catch (e) {
    ElMessage.error('配置保存失败')
  }
}

const sendMessage = async () => {
  if (!inputMsg.value.trim() || isSending.value) return
  
  if (!apiKey.value) {
    ElMessage.warning('请先配置 API Key！')
    showConfig.value = true
    return
  }
  
  const userText = inputMsg.value
  messages.value.push({ role: 'user', content: userText })
  inputMsg.value = ''
  isSending.value = true
  
  scrollToBottom()
  
  // 添加一个空的助理消息，供流式输出追加内容
  const assistantMsgIndex = messages.value.push({ role: 'assistant', content: '' }) - 1
  
  try {
    const model = new ChatOpenAI({
      openAIApiKey: apiKey.value,
      configuration: {
        baseURL: baseURL.value || undefined,
      },
      modelName: modelName.value || 'gpt-3.5-turbo',
      temperature: 0.7,
      streaming: true
    })
    
    const parser = new StringOutputParser()
    
    // 构造 LangChain 对话格式
    const formattedMessages = messages.value.slice(0, -1).map(m => {
      return [m.role === 'user' ? 'user' : 'assistant', m.content]
    })

    const stream = await model.pipe(parser).stream(formattedMessages)
    
    for await (const chunk of stream) {
      messages.value[assistantMsgIndex].content += chunk
      scrollToBottom()
    }
  } catch (error) {
    console.error(error)
    messages.value[assistantMsgIndex].content = '抱歉，大模型连接失败，请检查您的网络和 API 密钥配置。错误信息：' + error.message
    ElMessage.error('对话出错：' + error.message)
  } finally {
    isSending.value = false
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

onMounted(() => {
  loadSettings()
})
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

.chat-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  -webkit-app-region: no-drag;
}

.header-settings-btn {
  background: transparent !important;
  border: 1px solid var(--el-border-color) !important;
  color: var(--el-text-color-regular) !important;
  transition: all 0.2s;
}
.header-settings-btn:hover {
  border-color: #8cba00 !important;
  color: #8cba00 !important;
}
html.dark .header-settings-btn:hover {
  border-color: #c8ff00 !important;
  color: #c8ff00 !important;
}

.chat-status {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 顶部配置面板 */
.chat-config-panel {
  background: var(--el-bg-color-overlay);
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 16px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  -webkit-app-region: no-drag;
}
.panel-inner h4 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
}
.panel-inner :deep(.el-form-item) {
  margin-bottom: 12px;
}
.panel-inner :deep(.el-form-item__label) {
  padding-bottom: 4px;
  font-size: 12px;
  font-weight: 500;
}
.panel-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.glow-btn-mini {
  background: linear-gradient(135deg, #c8ff00 0%, #a8e600 100%) !important;
  border: none !important;
  color: #0a0a0a !important;
  font-weight: 600 !important;
}

/* 警告卡片 */
.config-warning-card {
  display: flex;
  gap: 16px;
  background: rgba(230, 162, 60, 0.1);
  border: 1px solid rgba(230, 162, 60, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  align-items: flex-start;
}
.warning-icon {
  font-size: 24px;
}
.warning-text h4 {
  margin: 0 0 4px 0;
  color: #e6a23c;
  font-size: 14px;
}
.warning-text p {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
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

/* 核心按钮复写 */
.glow-btn {
  background: linear-gradient(135deg, #c8ff00 0%, #a8e600 100%) !important;
  border: none !important;
  border-radius: 10px !important;
  color: #0a0a0a !important;
  font-weight: 700 !important;
  transition: all 0.25s;
}

.glow-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(200, 255, 0, 0.25);
}
</style>
