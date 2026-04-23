<template>
  <h1>💖 Hello World!</h1>
  <p>Welcome to your Electron APP.</p>
  <h1>my myElectron</h1>
    <h3>Counter: <span id="counter">{{counter}}</span></h3>
    <button @click="readTest">读取测试数据</button>
    <span>测试数据文件: </span><h3 id="file-content">测试数据: {{testcontent}}</h3>
    <button  @click="writefile">写入测试数据</button>
    <input type="text" v-model="textValue" placeholder="请输入写入的内容">
</template>

<script setup>
    import { ref, onMounted } from 'vue'

    const counter = ref(0)
    const testcontent = ref('测试数据')
    const textValue = ref("")

    // 组件挂载后，监听 main 进程发来的 set-count 消息
    onMounted(() => {
        window.electronAPI.onSetCount((count) => {
            counter.value = count
        })
    })

    // 读取文件（通过 preload 暴露的 API）
    const readTest = async () => {
        const data = await window.electronAPI.readFile()
        testcontent.value = data
    }

    // 写入文件（通过 preload 暴露的 API）
    const writefile = async () => {
        const result = await window.electronAPI.writeFile(textValue.value)
        // 通过 IPC 让主进程弹对话框
        window.electronAPI.showMessage('提示', result)
    }
</script>