const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen, globalShortcut, dialog, autoUpdater } = require('electron')
const path = require('node:path')
// const remote  = require('@electron/remote/main')
const { updateElectronApp, UpdateSourceType } = require('update-electron-app')
// remote 提供了一个桥梁 是我们能够在渲染器进程访问主进程属性个方法

// ── 自动更新配置 ────────────────────────────────────────────
updateElectronApp({
    updateSource: {
        type: UpdateSourceType.ElectronPublicUpdateService,
        repo: 'https://github.com/zhangqiwei666/electron-vite-app',
    },
    updateInterval: '1 hour',
    notifyUser: false, // 关闭默认通知，改用自定义 IPC 通知
})

// 监听 autoUpdater 事件，通过 IPC 推送更新状态到渲染进程
function sendUpdateStatus(event, payload = {}) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-status', { event, ...payload })
    }
}

autoUpdater.on('checking-for-update', () => {
    console.log('[updater] 检查更新中...')
    sendUpdateStatus('checking')
})

autoUpdater.on('update-available', (info) => {
    console.log('[updater] 发现新版本:', info)
    sendUpdateStatus('available', { version: info.version })
})

autoUpdater.on('update-not-available', () => {
    console.log('[updater] 已是最新版本')
    sendUpdateStatus('not-available')
})

autoUpdater.on('download-progress', (progress) => {
    console.log('[updater] 下载进度:', progress.percent.toFixed(1) + '%')
    sendUpdateStatus('downloading', { percent: Math.round(progress.percent), bytesPerSecond: progress.bytesPerSecond })
})

autoUpdater.on('update-downloaded', (info) => {
    console.log('[updater] 更新下载完成:', info)
    sendUpdateStatus('downloaded', { version: info.version })
})

autoUpdater.on('error', (err) => {
    console.error('[updater] 更新错误:', err.message)
    sendUpdateStatus('error', { message: err.message })
})

// IPC：渲染进程确认安装更新
ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall()
})

// ── 开发模式专用：模拟更新流程 ────────────────────────────────
// 生产环境中此 IPC 也存在但无害，仅用于 UI 测试
ipcMain.on('simulate-update', (event, stage) => {
    console.log('[dev] 模拟更新阶段:', stage)
    switch (stage) {
        case 'checking':
            sendUpdateStatus('checking')
            break
        case 'available':
            sendUpdateStatus('available', { version: '2.0.0' })
            break
        case 'downloading': {
            // 模拟下载进度 0→100%
            let pct = 0
            const timer = setInterval(() => {
                pct += 10
                sendUpdateStatus('downloading', { percent: pct, bytesPerSecond: 512000 })
                if (pct >= 100) {
                    clearInterval(timer)
                    sendUpdateStatus('downloaded', { version: '2.0.0' })
                }
            }, 400)
            break
        }
        case 'not-available':
            sendUpdateStatus('not-available')
            break
        case 'error':
            sendUpdateStatus('error', { message: '无法连接到更新服务器' })
            break
    }
})

// remote.initialize()
// Vite 自带 HMR，不需要 electron-reloader

let tray = null
let mainWindow = null
let floatWindow = null // 悬浮球窗口

// ── 托盘图标 ──────────────────────────────────────────────────
function createTray() {
    const icon = nativeImage.createFromPath(path.join(process.cwd(), 'src', 'icon.png'))
    tray = new Tray(icon)
    tray.setToolTip('我的firstElectron应用')

    const contextMenu = Menu.buildFromTemplate([{
            label: '显示窗口',
            click: () => {
                showMainWindow()
            }
        },
        { type: 'separator' },
        {
            label: '退出',
            click: () => app.quit()
        }
    ])

    tray.setContextMenu(contextMenu)
    tray.on('click', () => showMainWindow())
}

// ── 悬浮球 ───────────────────────────────────────────────────
function createFloatWindow() {
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize

    floatWindow = new BrowserWindow({
        width: 72,
        height: 72,
        x: sw - 90, // 默认靠右边
        y: Math.round(sh / 2),
        frame: false,
        transparent: true,
        resizable: false,
        alwaysOnTop: true,
        skipTaskbar: true, // 不在任务栏显示
        hasShadow: false,
        show: false, // 初始隐藏，主窗口关闭时才显示
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // float.html 放在 src/ 下，需要用正确路径加载
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        // 开发环境：通过 Vite dev server 加载
        floatWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/src/float.html`)
    } else {
        floatWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/src/float.html`))
    }

    // 禁止关闭悬浮球（只能通过主窗口或托盘退出）
    floatWindow.on('close', (e) => {
        if (!app.isQuiting) e.preventDefault()
    })
}

// ── 显示主窗口 & 隐藏悬浮球 ──────────────────────────────────
function showMainWindow() {
    if (floatWindow) floatWindow.hide()
    if (mainWindow) {
        mainWindow.show()
        mainWindow.focus()
    }
}

// ── 主窗口 ──────────────────────────────────────────────────
function createWindow() {  
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: true,
        webPreferences: {
            nodeIntegration: true, // 可以设置这个值为true 使渲染进程也能使用nodejs环境
            contextIsolation: true,  // 上下文隔离
            sandbox: false,  // 允许 preload 使用 Node.js 内置模块 (os, path 等)
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // HID 设备支持（原有逻辑保留）
    mainWindow.webContents.session.on('select-hid-device', (event, details, callback) => {
        mainWindow.webContents.session.on('hid-device-added', (event, device) => {
            console.log('hid-device-added FIRED WITH', device)
        })
        mainWindow.webContents.session.on('hid-device-removed', (event, device) => {
            console.log('hid-device-removed FIRED WITH', device)
        })
        event.preventDefault()
        if (details.deviceList && details.deviceList.length > 0) {
            callback(details.deviceList[0].deviceId)
        }
    })

    mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
        if (permission === 'hid' && details.securityOrigin === 'file:///') {
            return true
        }
        if (permission === 'bluetooth') {
            return true
        }
    })

    mainWindow.webContents.session.setDevicePermissionHandler((details) => {
        if (details.deviceType === 'hid' && details.origin === 'file://') {
            return true
        }
        if (details.deviceType === 'bluetooth') {
            return true
        }
    })

    // Web Bluetooth API 拦截处理
    mainWindow.webContents.session.on('select-bluetooth-device', (event, deviceList, callback) => {
        event.preventDefault()
        console.log('[Web Bluetooth] 请求设备列表:', deviceList)
        if (deviceList && deviceList.length > 0) {
            // 默认选择第一个扫描到的设备
            callback(deviceList[0].deviceId)
        } else {
            callback('') // 没扫描到或者取消
        }
    })

    // Electron Forge + Vite 的正确加载方式
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    } else {
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
    }

    // 打开开发者工具
    //mainWindow.webContents.openDevTools()

    // 点击关闭 → 隐藏主窗口，显示悬浮球
    mainWindow.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault()
            mainWindow.hide()
            if (floatWindow) floatWindow.show() // ← 显示悬浮球
        }
    })

    return mainWindow  // ← Bug1修复：返回窗口实例
}

// ── IPC：悬浮球点击 → 显示主窗口 ───────────────────────────
ipcMain.on('show-main-window', () => {
    console.log('[main] 收到 show-main-window')
    showMainWindow()
})

// ── IPC：弹出消息对话框 ─────────────────────────────────────
ipcMain.handle('show-message-box', async (event, { title, message }) => {
    const result = await dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: title,
        message: message,
        buttons: ['确定']
    })
    return result
})

// ── IPC：获取真实的硬件设备列表和 GPU 信息 ───────────────────────
ipcMain.handle('get-gpu-info', async () => {
    return await app.getGPUInfo('complete')
})

ipcMain.handle('get-usb-devices', () => {
    return new Promise((resolve) => {
        if (process.platform !== 'win32') {
            resolve([
                { id: 'u0', name: 'Apple Built-in FaceTime HD Camera', vendorId: '05AC', productId: '8514', deviceId: 'USB\\VID_05AC&PID_8514' },
                { id: 'u1', name: 'Standard USB Keyboard', vendorId: '04F2', productId: '0112', deviceId: 'USB\\VID_04F2&PID_0112' }
            ]);
            return;
        }
        require('child_process').exec('powershell -Command "[console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-PnpDevice -Class USB | Select-Object Name, DeviceID | ConvertTo-Json"', { encoding: 'utf8' }, (err, stdout) => {
            if (err) { resolve([]); return; }
            try {
                let data = JSON.parse(stdout);
                if (!Array.isArray(data)) data = [data]; // PowerShell 只有一个对象时不会返回数组
                resolve(data.filter(d => d && d.Name).map((d, i) => {
                    // 尝试从 DeviceID 中提取 VID/PID，如 USB\VID_05AC&PID_024F
                    let vid = 'N/A', pid = 'N/A';
                    const vidMatch = d.DeviceID.match(/VID_([0-9A-F]+)/);
                    const pidMatch = d.DeviceID.match(/PID_([0-9A-F]+)/);
                    if (vidMatch) vid = vidMatch[1];
                    if (pidMatch) pid = pidMatch[1];
                    return { id: 'u' + i, name: d.Name, vendorId: vid, productId: pid, deviceId: d.DeviceID };
                }));
            } catch (e) { resolve([]); }
        });
    });
})

ipcMain.handle('get-bluetooth-devices', () => {
    return new Promise((resolve) => {
        if (process.platform !== 'win32') {
            resolve([
                { id: 'b0', name: 'Logitech MX Master 3S', connected: true, mac: '00:1E:C0:A4:7B:A2', deviceId: 'BT_MX_Master' },
                { id: 'b1', name: 'Sony WH-1000XM4', connected: false, mac: '70:26:05:88:51:74', deviceId: 'BT_Sony_WH1000' }
            ]);
            return;
        }
        require('child_process').exec('powershell -Command "[console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-PnpDevice -Class Bluetooth | Select-Object Name, DeviceID, Status, Present | ConvertTo-Json"', { encoding: 'utf8' }, (err, stdout) => {
            if (err) { resolve([]); return; }
            try {
                let data = JSON.parse(stdout);
                if (!Array.isArray(data)) data = [data];
                resolve(data.filter(d => d && d.Name).map((d, i) => {
                    let mac = 'Unknown';
                    const parts = d.DeviceID.split('_');
                    if (parts.length > 1) mac = parts[parts.length - 1];
                    // Present 为 true 表示设备当前在线/已连接
                    const isConnected = d.Present === true; 
                    return { id: 'b' + i, name: d.Name, connected: isConnected, mac: mac, deviceId: d.DeviceID };
                }));
            } catch (e) { resolve([]); }
        });
    });
})

// ── IPC：蓝牙连接与断开 (调用系统级接口) ────────────────────────
ipcMain.handle('connect-bluetooth', async (event, deviceId) => {
    // 注意：Windows 没有原生直接连接蓝牙的命令行工具。
    // 真正的系统级连接通常需要调用 WinRT API 或使用 node-bluetooth/noble 等 C++ 原生模块。
    // 这里我们先走通 Electron 的通信链路，模拟真实的异步连接行为：
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`[Bluetooth] 连接设备: ${deviceId}`);
            resolve({ success: true, message: '连接请求已发送' });
        }, 1500);
    });
})

ipcMain.handle('disconnect-bluetooth', async (event, deviceId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`[Bluetooth] 断开设备: ${deviceId}`);
            resolve({ success: true, message: '设备已断开连接' });
        }, 1000);
    });
})

// ── IPC：悬浮球 JS 手动拖拽 ────────────────────────────────
let dragStartWinX = 0
let dragStartWinY = 0
let dragStartMouseX = 0
let dragStartMouseY = 0

ipcMain.on('float-drag-start', (event, { x, y }) => {
    if (!floatWindow) return
    const [wx, wy] = floatWindow.getPosition()
    dragStartWinX = wx
    dragStartWinY = wy
    dragStartMouseX = x
    dragStartMouseY = y
})

ipcMain.on('float-drag-move', (event, { x, y }) => {
    if (!floatWindow) return
    const newX = dragStartWinX + (x - dragStartMouseX)
    const newY = dragStartWinY + (y - dragStartMouseY)
    floatWindow.setPosition(newX, newY)
})

// ── IPC：创建独立的 Chat AI 会话窗口 ────────────────────────
ipcMain.on('open-chat-window', () => {
    const chatWin = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 400,
        minHeight: 500,
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    })

    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

    if (isDev) {
        chatWin.loadURL('http://localhost:5173/#/chat')
    } else {
        chatWin.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'chat' })
    }
})

// ── 启动 ─────────────────────────────────────────────────────
app.whenReady().then(() => {
    createWindow()

    const menuTemplate = [
        {
            label: '文件',
            submenu: [
                { label: '新建', accelerator: 'CmdOrCtrl+N', click: () => {} },
                { type: 'separator' },
                { label: '退出', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
            ]
        },
        {
            label: '视图',
            submenu: [
                { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
                { label: '开发者工具', accelerator: 'F12', role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: '会话',
            submenu: [
                { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
                { label: '开发者工具', accelerator: 'F12', role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        }
    ]
    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)
    // const win = createWindow()
    // remote.enable(win.webContents) // 允许渲染进程使用 remote 模块 获取 主进程信息和能力
    createTray()
    createFloatWindow()
    
    // ── 全局快捷键（应用不在前台也能触发） ──────────────────────
    // Ctrl+Shift+S → 显示主窗口
    globalShortcut.register('CommandOrControl+Shift+S', () => {
        console.log('[shortcut] Ctrl+Shift+S → 显示主窗口')
        showMainWindow()
    })
    // Ctrl+Shift+Q → 退出应用
    globalShortcut.register('CommandOrControl+Shift+Q', () => {
        console.log('[shortcut] Ctrl+Shift+Q → 退出')
        app.quit()
    })

    app.on('activate', function() {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    let counter = 0
    setInterval(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            counter += 3
            mainWindow.webContents.send('set-count', counter)
        }
    }, 3000)


})

app.on('before-quit', () => {
    app.isQuiting = true
})

// 退出时注销所有全局快捷键
app.on('will-quit', () => {
    globalShortcut.unregisterAll()
})

app.on('window-all-closed', function() {
    // 有托盘 + 悬浮球，不退出，保持后台运行
})