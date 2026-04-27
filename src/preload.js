const { contextBridge, ipcRenderer } = require('electron/renderer')
const os = require('os')
const fs = require('fs')
const path = require('path')

contextBridge.exposeInMainWorld('electronAPI', {
    cancelBluetoothRequest: () => ipcRenderer.send('cancel-bluetooth-request'),
    bluetoothPairingRequest: (callback) => ipcRenderer.on('bluetooth-pairing-request', (event, details) => callback(event, details)),
    bluetoothPairingResponse: (response) => ipcRenderer.send('bluetooth-pairing-response', response),
    onSetCount: (callback) => ipcRenderer.on('set-count', (event, count) => callback(count)),
    // 获取当前电脑信息
    getSystemInfo: () => {
        const cpus = os.cpus()
        const nets = os.networkInterfaces()
            // 取第一个非内部 IPv4 地址
        let ip = ''
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                if (net.family === 'IPv4' && !net.internal) {
                    ip = net.address
                    break
                }
            }
            if (ip) break
        }

        return {
            hostname: os.hostname(), // 计算机名
            platform: os.platform(), // win32 / darwin / linux
            arch: os.arch(), // x64 / arm64
            osType: os.type(), // Windows_NT / Darwin / Linux
            osRelease: os.release(), // 系统版本号
            username: os.userInfo().username, // 当前用户名
            homedir: os.homedir(), // 用户主目录
            cpuModel: cpus.length ? cpus[0].model : '',
            cpuCores: cpus.length, // CPU 核心数
            totalMemory: os.totalmem(), // 总内存 (字节)
            freeMemory: os.freemem(), // 空闲内存 (字节)
            ip // 本机 IP
        }
    },
    // 读取文件
    readFile: async () => {
        const filePath = path.join(process.cwd(), 'file-pass.txt')
        try {
            const data = await fs.promises.readFile(filePath, 'utf-8')
            return data
        } catch (err) {
            return '文件不存在或读取失败: ' + err.message
        }
    },
    // 写入文件
    writeFile: async (content) => {
        const filePath = path.join(process.cwd(), 'file-pass.txt')
        try {
            await fs.promises.writeFile(filePath, content, 'utf-8')
            return '写入成功'
        } catch (err) {
            return '写入失败: ' + err.message
        }
    },
    // 弹出消息对话框（通过 IPC 让主进程弹）
    showMessage: (title, message) => ipcRenderer.invoke('show-message-box', { title, message }),
    // ── 更新相关 API ──────────────────────────────────────────
    onUpdateStatus: (callback) => ipcRenderer.on('update-status', (event, data) => callback(data)),
    installUpdate: () => ipcRenderer.send('install-update'),
    // 开发专用：模拟更新阶段（checking / available / downloading / not-available / error）
    simulateUpdate: (stage) => ipcRenderer.send('simulate-update', stage),

    // ── 系统性能监控 API ─────────────────────────────────────
    // 获取实时 CPU 使用率（通过两次采样计算）
    getCpuUsage: () => {
        return new Promise((resolve) => {
            const cpus1 = os.cpus()
            setTimeout(() => {
                const cpus2 = os.cpus()
                const result = cpus2.map((cpu, i) => {
                    const prev = cpus1[i].times
                    const curr = cpu.times
                    const idle = curr.idle - prev.idle
                    const total = (curr.user - prev.user) + (curr.nice - prev.nice) +
                                  (curr.sys - prev.sys) + (curr.irq - prev.irq) + idle
                    return { core: i, usage: total > 0 ? Math.round(((total - idle) / total) * 100) : 0 }
                })
                const avg = Math.round(result.reduce((s, c) => s + c.usage, 0) / result.length)
                resolve({ cores: result, average: avg })
            }, 500)
        })
    },
    // 获取内存使用情况
    getMemoryInfo: () => {
        const total = os.totalmem()
        const free = os.freemem()
        const used = total - free
        return {
            total, free, used,
            totalGB: (total / 1024 / 1024 / 1024).toFixed(1),
            usedGB: (used / 1024 / 1024 / 1024).toFixed(1),
            freeGB: (free / 1024 / 1024 / 1024).toFixed(1),
            percent: Math.round((used / total) * 100)
        }
    },
    // 获取 GPU 信息（通过 IPC 调用主进程）
    getGpuInfo: () => ipcRenderer.invoke('get-gpu-info'),
    // 获取系统运行时间
    getUptime: () => {
        const sec = os.uptime()
        const h = Math.floor(sec / 3600)
        const m = Math.floor((sec % 3600) / 60)
        return `${h} 小时 ${m} 分钟`
    },

    // ── 设置相关 API ─────────────────────────────────────────
    // 选择文件夹
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    
    // ── 硬件设备 API ─────────────────────────────────────────
    getUsbDevices: () => ipcRenderer.invoke('get-usb-devices'),
    getBluetoothDevices: () => ipcRenderer.invoke('get-bluetooth-devices'),
    connectBluetooth: (deviceId) => ipcRenderer.invoke('connect-bluetooth', deviceId),
    disconnectBluetooth: (deviceId) => ipcRenderer.invoke('disconnect-bluetooth', deviceId),

    // ── Chat AI ──────────────────────────────────────────────
    openChatWindow: () => ipcRenderer.send('open-chat-window'),
})

contextBridge.exposeInMainWorld('require', require)