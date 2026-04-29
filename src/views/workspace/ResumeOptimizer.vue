<template>
  <div class="resume-optimizer">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="title-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div>
          <h2 class="page-title">Claude 智能简历优化</h2>
          <p class="page-subtitle">一键分析、重写并优化您的个人简历，提升面试邀约率</p>
        </div>
      </div>
      <el-button type="primary" class="glow-btn" @click="startOptimization" :loading="isOptimizing" :disabled="!resumeText">
        <el-icon class="btn-icon"><MagicStick /></el-icon> 
        {{ isOptimizing ? 'Claude 正在思考...' : '开始 AI 优化' }}
      </el-button>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Left: Input Area -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">
            <el-icon><UploadFilled /></el-icon> 原始简历
          </span>
          <el-tag size="small" class="status-tag" :type="resumeText ? 'success' : 'info'">
            {{ resumeText ? '已解析' : '等待上传' }}
          </el-tag>
        </div>
        
        <div class="panel-body">
          <el-upload
            v-if="!resumeText"
            class="upload-drag-area"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileDrop"
            accept=".txt,.md,.pdf,.doc,.docx"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽简历文件到此处，或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip text-center">
                支持 .pdf, .docx, .txt 格式，拖入即可自动解析提取文字
              </div>
            </template>
          </el-upload>

          <div v-else class="text-editor-container">
            <el-input
              v-model="resumeText"
              type="textarea"
              :rows="18"
              placeholder="简历原始内容..."
              class="custom-textarea"
            />
            <div class="editor-actions">
              <el-button size="small" type="danger" plain @click="clearResume">清空重传</el-button>
            </div>
          </div>

          <div class="prompt-box mt-4">
            <div class="prompt-label">附加优化指令 (可选):</div>
            <el-input
              v-model="customPrompt"
              type="textarea"
              :rows="2"
              placeholder="例如：请让这份简历看起来更有领导力；或者：重点突出 Vue 和前端工程化能力..."
              class="custom-textarea prompt-input"
            />
          </div>

          <div class="llm-settings mt-4">
            <div class="prompt-label">LLM 设置 (LangChain):</div>
            <el-row :gutter="12">
              <el-col :span="12">
                <el-input v-model="apiKey" placeholder="API Key (如 sk-...)" type="password" show-password />
              </el-col>
              <el-col :span="12">
                <el-input v-model="baseURL" placeholder="Base URL (可选)" />
              </el-col>
            </el-row>
            <el-row :gutter="12" class="mt-2">
              <el-col :span="12">
                <el-input v-model="modelName" placeholder="模型名称 (如 gpt-3.5-turbo)" />
              </el-col>
            </el-row>
          </div>
        </div>
      </div>

      <!-- Right: AI Output Area -->
      <div class="panel output-panel">
        <div class="panel-header">
          <span class="panel-title">
            <el-icon><Monitor /></el-icon> Claude 优化结果
          </span>
          <div class="actions">
            <el-button size="small" plain class="ghost-btn" @click="copyResult" :disabled="!optimizedResult">
              <el-icon><CopyDocument /></el-icon> 复制
            </el-button>
            <el-button size="small" type="primary" plain class="ghost-btn" :disabled="!optimizedResult">
              <el-icon><Download /></el-icon> 导出 PDF
            </el-button>
          </div>
        </div>
        
        <div class="panel-body output-body">
          <div v-if="isOptimizing" class="loading-state">
            <div class="claude-spinner">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
            <p>Claude 3.5 Sonnet 正在为您重新润色简历...</p>
            <p class="sub-text">这通常需要几秒钟时间</p>
          </div>

          <div v-else-if="optimizedResult" class="result-content markdown-body" v-html="formattedResult"></div>

          <div v-else class="empty-state">
            <el-icon><Document /></el-icon>
            <p>上传简历并点击"开始 AI 优化"，结果将展示在这里</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Document, UploadFilled, MagicStick, CopyDocument, Download, Monitor } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist'
import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`

const resumeText = ref('')
const customPrompt = ref('')
const isOptimizing = ref(false)
const optimizedResult = ref('')
const apiKey = ref('')
const baseURL = ref('https://api.openai.com/v1')
const modelName = ref('gpt-3.5-turbo')

const handleFileDrop = async (file) => {
  if (!file) return
  
  const rawFile = file.raw
  if (!rawFile) return
  const ext = rawFile.name.split('.').pop().toLowerCase()

  if (ext === 'txt' || ext === 'md' || rawFile.type === 'text/plain') {
    const reader = new FileReader()
    reader.onload = (e) => {
      resumeText.value = e.target.result
    }
    reader.readAsText(rawFile)
  } else if (ext === 'pdf') {
    try {
      ElMessage.info('正在解析 PDF 文档...')
      const arrayBuffer = await rawFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let fullText = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map(item => item.str).join(' ')
        fullText += pageText + '\n\n'
      }
      resumeText.value = fullText
      ElMessage.success('PDF 解析成功')
    } catch (e) {
      console.error(e)
      ElMessage.error('PDF 解析失败: ' + e.message)
    }
  } else if (ext === 'doc' || ext === 'docx') {
    try {
      ElMessage.info('正在解析 Word 文档...')
      const arrayBuffer = await rawFile.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      resumeText.value = result.value
      ElMessage.success('Word 解析成功')
    } catch (e) {
      console.error(e)
      ElMessage.error('Word 解析失败: ' + e.message)
    }
  } else {
    ElMessage.warning('不支持的文件格式')
  }
}

const clearResume = () => {
  resumeText.value = ''
  optimizedResult.value = ''
}

const copyResult = () => {
  navigator.clipboard.writeText(optimizedResult.value).then(() => {
    ElMessage.success('已复制到剪贴板')
  })
}

// 使用 LangChain 调用大模型 API
const startOptimization = async () => {
  if (!resumeText.value) return
  if (!apiKey.value) {
    ElMessage.warning('请输入 API Key')
    return
  }
  
  isOptimizing.value = true
  optimizedResult.value = ''
  
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

    const promptTemplate = PromptTemplate.fromTemplate(`
你是一位资深的HR和简历优化专家。请根据以下简历原始内容，以及用户的附加指令，重新润色和优化这份简历。
要求：
1. 使用 Markdown 格式输出。
2. 尽量使用 STAR 法则（情境、任务、行动、结果）重写工作经历，突出量化数据。
3. 保持排版清晰专业，分出"个人信息"、"核心技能"、"工作经历"、"自我评价"等核心模块。

附加优化指令：
{customPrompt}

简历原始内容：
{resumeText}
    `)

    const chain = promptTemplate.pipe(model).pipe(new StringOutputParser())

    const stream = await chain.stream({
      customPrompt: customPrompt.value || '无',
      resumeText: resumeText.value
    })

    for await (const chunk of stream) {
      optimizedResult.value += chunk
    }
    
    ElMessage.success('简历优化完成！')
  } catch (error) {
    console.error(error)
    ElMessage.error('优化失败：' + error.message)
  } finally {
    isOptimizing.value = false
  }
}

// 简单的 Markdown 转 HTML 渲染器 (针对展示优化)
const formattedResult = computed(() => {
  if (!optimizedResult.value) return ''
  let html = optimizedResult.value
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/### (.*?)(<br>|$)/g, '<h3>$1</h3>')
    .replace(/^- (.*?)(<br>|$)/gm, '<li>$1</li>')
    
  return html
})
</script>

<style scoped>
.resume-optimizer {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── 顶部操作栏 ── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 44px;
  height: 44px;
  background: rgba(200, 255, 0, 0.1);
  border: 1px solid rgba(200, 255, 0, 0.25);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #8cba00;
  box-shadow: 0 0 15px rgba(200, 255, 0, 0.1);
}

html.dark .title-icon {
  color: #c8ff00;
}

.page-title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.page-subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* ── 按钮规范 ── */
.glow-btn {
  background: linear-gradient(135deg, #c8ff00 0%, #a8e600 100%) !important;
  border: none !important;
  border-radius: 10px !important;
  color: #0a0a0a !important;
  font-weight: 700 !important;
  height: 40px;
  padding: 0 20px;
  transition: all 0.25s;
}

.glow-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(200, 255, 0, 0.25);
}

.glow-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.ghost-btn {
  background: transparent !important;
  border: 1px solid var(--el-border-color) !important;
  color: var(--el-text-color-regular) !important;
  border-radius: 8px !important;
  transition: all 0.2s;
}

.ghost-btn:hover:not(:disabled) {
  border-color: #8cba00 !important;
  color: #8cba00 !important;
  background: rgba(200, 255, 0, 0.05) !important;
}

html.dark .ghost-btn:hover:not(:disabled) {
  border-color: #c8ff00 !important;
  color: #c8ff00 !important;
}

.btn-icon { margin-right: 6px; }

/* ── 主内容网格区 ── */
.content-grid {
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.panel {
  flex: 1;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  width: 50%;
}

.panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200, 255, 0, 0.5), transparent);
  opacity: 0.5;
}

.panel-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--el-fill-color-light);
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* ── 上传与编辑器 ── */
.upload-drag-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

:deep(.el-upload-dragger) {
  background: var(--el-fill-color-light);
  border: 2px dashed var(--el-border-color);
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

:deep(.el-upload-dragger:hover) {
  border-color: #8cba00;
  background: rgba(200, 255, 0, 0.02);
}

html.dark :deep(.el-upload-dragger:hover) {
  border-color: #c8ff00;
}

.text-editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

/* 深度定制文本框样式 */
:deep(.custom-textarea .el-textarea__inner) {
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  color: var(--el-text-color-primary);
  font-family: monospace;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  box-shadow: none;
}

:deep(.custom-textarea .el-textarea__inner:focus) {
  border-color: #8cba00;
}
html.dark :deep(.custom-textarea .el-textarea__inner:focus) {
  border-color: #c8ff00;
}

.prompt-box {
  margin-top: 20px;
  background: var(--el-bg-color-overlay);
  padding: 16px;
  border-radius: 10px;
  border: 1px solid var(--el-border-color-light);
}

.prompt-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.llm-settings {
  background: var(--el-bg-color-overlay);
  padding: 16px;
  border-radius: 10px;
  border: 1px solid var(--el-border-color-light);
}

.mt-2 {
  margin-top: 8px;
}

/* ── 输出区域 ── */
.output-body {
  background: var(--el-fill-color-darker);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.empty-state .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--el-text-color-placeholder);
}

/* 加载动画 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8cba00;
}
html.dark .loading-state { color: #c8ff00; }

.claude-spinner {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: currentColor;
  animation: bounce 1.5s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.loading-state p { margin: 0; font-weight: 600; }
.loading-state .sub-text { font-size: 12px; font-weight: normal; color: var(--el-text-color-secondary); margin-top: 8px; }

/* 渲染结果样式 */
.result-content {
  color: var(--el-text-color-primary);
  font-size: 14px;
  line-height: 1.8;
}

:deep(.result-content h3) {
  color: #8cba00;
  margin-top: 24px;
  margin-bottom: 12px;
  font-size: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 8px;
}
html.dark :deep(.result-content h3) { color: #c8ff00; }

:deep(.result-content strong) {
  color: var(--el-text-color-primary);
  background: rgba(200, 255, 0, 0.1);
  padding: 0 4px;
  border-radius: 4px;
}

:deep(.result-content li) {
  margin-bottom: 8px;
}
</style>
