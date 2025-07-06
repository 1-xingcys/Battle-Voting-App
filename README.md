# 投票系統 (Voting System)

一個基於 Next.js 和 Firebase 的現代化投票系統，支援活動建立、成員邀請和投票功能。

## 功能特色

- 🔐 **使用者認證**：Firebase Authentication 提供安全的登入/註冊功能
- 📊 **活動管理**：建立投票活動，生成邀請碼
- 👥 **成員邀請**：透過邀請碼加入活動
- 🗳️ **投票功能**：參與者可以進行投票
- 📱 **響應式設計**：支援桌面和行動裝置
- ⚡ **快速開發**：使用 Next.js 15 和 Turbopack

## 技術棧

- **前端框架**：Next.js 15.3.4
- **UI 框架**：React 18.3.1 + Tailwind CSS 4
- **後端服務**：Firebase (Firestore + Authentication)
- **開發語言**：TypeScript
- **圖示庫**：Heroicons React
- **開發工具**：ESLint, Turbopack

## 快速開始

### 前置需求

- Node.js 18+ 
- npm 或 yarn 或 pnpm

### 安裝步驟

1. **複製專案**
```bash
git clone <your-repository-url>
cd voting_system
```

2. **安裝依賴**
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. **設定環境變數**

建立 `.env.local` 檔案並填入 Firebase 設定：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **啟動開發伺服器**
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

5. **開啟瀏覽器**
訪問 [http://localhost:3000](http://localhost:3000) 查看結果

## 專案結構

```
voting_system/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # 認證頁面
│   │   ├── dashboard/         # 儀表板
│   │   ├── join/              # 加入活動
│   │   ├── [activityId]/      # 動態活動頁面
│   │   ├── component/         # 共用元件
│   │   └── lib/               # 工具函數
│   ├── hooks/                 # 自定義 React Hooks
│   └── firebase.ts           # Firebase 設定
├── public/                    # 靜態資源
└── package.json
```

## 可用的腳本

```bash
# 開發模式
npm run dev

# 建置專案
npm run build

# 啟動生產伺服器
npm start

# 程式碼檢查
npm run lint
```

## 部署

### 使用 Vercel（推薦）

1. 將專案推送到 GitHub
2. 在 [Vercel](https://vercel.com) 連結你的 repository
3. 設定環境變數
4. 自動部署完成

### 手動部署

1. **建置專案**
```bash
npm run build
```

2. **啟動生產伺服器**
```bash
npm start
```

3. **設定反向代理**（可選）
使用 Nginx 或其他伺服器軟體設定反向代理到 `http://localhost:3000`

## 環境變數說明

| 變數名稱 | 說明 | 必填 |
|---------|------|------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API 金鑰 | ✅ |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth 網域 | ✅ |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase 專案 ID | ✅ |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage 儲存桶 | ✅ |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase 訊息發送者 ID | ✅ |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase 應用程式 ID | ✅ |

## 開發指南

### 新增頁面
在 `src/app/` 目錄下建立新的資料夾和 `page.tsx` 檔案

### 新增元件
在 `src/app/component/` 目錄下建立新的元件檔案

### 使用 Firebase
```typescript
import { db, auth } from '@/firebase';
```

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 授權

此專案採用 MIT 授權條款。

## 支援

如有問題，請在 GitHub 上建立 Issue。
