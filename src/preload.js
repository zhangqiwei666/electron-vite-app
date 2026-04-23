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
    showMessage: (title, message) => ipcRenderer.invoke('show-message-box', { title, message })
})

contextBridge.exposeInMainWorld('require', require)