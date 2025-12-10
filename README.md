# CheckLists App

A modern, user-friendly checklist management application to help you organize tasks, track progress, and manage workflows. Built with a clean, Jira-like interface.

---

## 📋 What is this app for?

CheckLists App helps you create and manage detailed checklists for any project or workflow. Whether you're launching a product, running a marketing campaign, or conducting root-cause analysis, this app helps you:

- **Track progress** with visual completion percentages
- **Organize steps** with drag-and-drop reordering
- **Manage time** with duration tracking for each step
- **Categorize** your checklists for easy organization
- **Import/Export** steps from CSV files

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | View all your checklists with progress bars and statistics |
| **Create Checklists** | Add new checklists with title, description, and category |
| **Step Management** | Add, edit, delete, clone, and reorder steps |
| **Drag & Drop** | Reorder steps by dragging them to new positions |
| **Step Status** | Track each step as Draft, In Progress, Paused, Completed, or Rejected |
| **Duration Tracking** | Set estimated time for each step (30-minute increments) |
| **Date Scheduling** | Add start and end dates to steps |
| **Categories** | Organize checklists by custom color-coded categories |
| **CSV Import** | Import steps from a CSV file when creating a checklist |
| **CSV Export** | Export checklist steps to a CSV file |
| **Default Templates** | 3 read-only templates you can clone and customize |
| **Clone** | Duplicate any checklist or individual step |

---

## 🚀 How to Run the Application

### Prerequisites

Before you start, you need to have **Node.js** installed on your computer.

#### Check if Node.js is installed:

1. Open **Terminal** (Mac) or **Command Prompt** (Windows)
2. Type this command and press Enter:
   ```
   node --version
   ```
3. If you see a version number like `v18.17.0` or higher, you're ready!
4. If you see an error, you need to install Node.js first.

#### Installing Node.js (if needed):

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** version (recommended for most users)
3. Run the installer and follow the instructions
4. Restart your Terminal/Command Prompt after installation

---

### ⚡ Quick Install (Recommended)

The easiest way to install! Just 3 commands:

1. Open Terminal and navigate to the app folder:
   ```bash
   cd /path/to/checklists-app
   ```

2. Run the installer:
   ```bash
   ./install.sh
   ```

3. Start the app:
   ```bash
   npm run start
   ```

4. Open http://localhost:3000 in your browser

**That's it!** 🎉

---

### Step-by-Step Instructions (Manual)

#### Step 1: Open Terminal

- **On Mac**: Press `Cmd + Space`, type "Terminal", press Enter
- **On Windows**: Press `Windows key`, type "cmd", press Enter

#### Step 2: Navigate to the app folder

Type this command (adjust the path to where you saved the app):

```bash
cd /path/to/checklists-app
```

For example:
```bash
cd /Users/me/Documents/Development/CheckLists/checklists-app
```

#### Step 3: Install dependencies (first time only)

```bash
npm install
```

Wait for it to complete. This may take a few minutes.

#### Step 4: Create the environment file (first time only)

Create a file named `.env` in the app folder with the database configuration.

**On Mac/Linux:**
```bash
echo 'DATABASE_URL="file:./prisma/dev.db"' > .env
```

**On Windows (Command Prompt):**
```bash
echo DATABASE_URL="file:./prisma/dev.db" > .env
```

**Or manually:**
1. Create a new file called `.env` in the main `checklists-app` folder
2. Open it in any text editor
3. Paste this line:
   ```
   DATABASE_URL="file:./prisma/dev.db"
   ```
4. Save the file

#### Step 5: Setup the database (first time only)

This generates the Prisma client, creates the database, and adds sample data:

```bash
npm run db:setup
```

#### Step 6: Start the application

**For Development** (with auto-reload when you edit code):
```bash
npm run dev
```

**For Production** (faster, optimized):
```bash
npm run build
npm run start
```

You should see output like:
```
▲ Next.js 16.0.8 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://192.168.1.50:3000

✓ Ready in 1101ms
```

#### Step 7: Open in your browser

Open your web browser (Chrome, Safari, Firefox, etc.) and go to:

```
http://localhost:3000
```

🎉 **You're done!** The app should now be running.

---

### Stopping the Application

To stop the app, go back to Terminal and press:

- **Mac**: `Ctrl + C`
- **Windows**: `Ctrl + C`

### Running in the Background (Production)

If you want the app to keep running even after closing Terminal:

**On Mac/Linux:**
```bash
npm run build
nohup npm run start > app.log 2>&1 &
```

**To stop it later:**
```bash
pkill -f "next start"
```

---

## ⚠️ Common Issues & Fixes

### Issue: "Missing required environment variable: DATABASE_URL"

**Cause**: The `.env` file is missing or doesn't contain the database URL.

**Fix**: Create the `.env` file in the app folder with this content:
```
DATABASE_URL="file:./prisma/dev.db"
```

See Step 4 above for detailed instructions.

---

### Issue: "command not found: node"

**Cause**: Node.js is not installed or not in your system path.

**Fix**: Install Node.js from [https://nodejs.org](https://nodejs.org) and restart your Terminal.

---

### Issue: "EACCES permission denied"

**Cause**: You don't have permission to install packages globally.

**Fix**: Run with sudo (Mac/Linux):
```bash
sudo npm install
```

---

### Issue: "Port 3000 is already in use"

**Cause**: Another application is using port 3000.

**Fix**: Either close the other application, or run on a different port:
```bash
npm run dev -- -p 3001
```
Then open `http://localhost:3001` in your browser.

---

### Issue: "Cannot find module" or "Module not found"

**Cause**: Dependencies are not installed or are outdated.

**Fix**: Delete the node_modules folder and reinstall:
```bash
rm -rf node_modules
npm install
```

---

### Issue: "Table does not exist" or database errors

**Cause**: Database hasn't been set up properly.

**Fix**: Run the database setup commands:
```bash
npx prisma db push
npm run db:seed
```

---

### Issue: The page shows a blank screen

**Cause**: JavaScript error or the server isn't running.

**Fix**:
1. Check that the terminal shows "Ready" message
2. Try refreshing the page (F5 or Cmd+R)
3. Open browser developer tools (F12) and check for errors in Console

---

## 📁 Project Structure

```
checklists-app/
├── prisma/              # Database configuration
│   ├── schema.prisma    # Database schema
│   ├── seed.ts          # Sample data
│   └── dev.db           # SQLite database file
├── src/
│   ├── app/             # Pages and API routes
│   ├── components/      # Reusable UI components
│   └── lib/             # Utilities and helpers
├── package.json         # Project dependencies
└── README.md            # This file
```

---

## 📊 CSV Format for Import

When importing steps, your CSV file should have these columns:

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| title | ✅ Yes | Step name | Review documentation |
| description | No | Step details | Check all sections |
| durationMinutes | No | Time in minutes | 60 |
| status | No | Step status | draft, started, paused, completed, rejected |
| startDatetime | No | Start date (ISO format) | 2024-01-15T09:00:00 |
| endDatetime | No | End date (ISO format) | 2024-01-15T10:00:00 |
| comments | No | Additional notes | Need team input |
| orderIndex | No | Step order (0, 1, 2...) | 0 |

**Example CSV:**
```csv
title,description,durationMinutes,status
Review documentation,Check all sections,60,draft
Send for approval,Email to manager,30,draft
Final review,Complete checks,45,draft
```

---

## 👤 Author

**Gaby Aronovitch**

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 10/12/2025 | Initial release |

---

## 🛠 Technology Stack

- **Framework**: Next.js 16
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Drag & Drop**: dnd-kit
- **Icons**: Lucide React
