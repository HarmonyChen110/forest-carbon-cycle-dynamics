import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取 __dirname (在 ESM 模式下需要这样获取)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        title: "Forest Carbon Cycle Dynamics",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // 根据运行环境加载不同的 URL
    if (process.env.NODE_ENV === 'development') {
        // 开发模式：加载 Vite 开发服务器地址
        // 注意：这里假设 Vite 运行在 5777 端口，如果端口被占用可能需要调整
        win.loadURL('http://localhost:5777');
        // 打开开发者工具
        // win.webContents.openDevTools();
    } else {
        // 生产模式：加载打包后的文件
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});