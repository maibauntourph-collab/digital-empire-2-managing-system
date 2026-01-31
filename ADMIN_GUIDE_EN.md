# 👑 Empire Helper Admin System Guide

## 1. Overview
This is the integrated Admin Dashboard for managing "Digital Empire II Business Helper" data (Applications, Receipts, Managers, Documents).
**Note**: Since it uses a file-based database system, it **MUST run in a Node.js server environment** (Localhost or Dedicated Server). It will NOT work on static hosting like GitHub Pages.

---

## 2. Access & Login
- **URL**: `http://localhost:3000/admin/login` (Localhost)
- **Default Super Admin**:
    - **ID**: `admin`
    - **PW**: `admin123!`

> [!IMPORTANT]
> Please change the password or create a new super admin account immediately after the first login for security.

---

## 3. Roles & Permissions
The system has two permission levels:

| Role | Description | Capabilities |
| :--- | :--- | :--- |
| **SUPER_ADMIN** | System Owner | • View/Add/Edit/**Delete** all data<br>• Approve Admin Accounts<br>• Upload/Delete PDF Docs<br>• Full Data Backup (Download) |
| **MANAGER** | Staff | • View Applications/Receipts & Update Status<br>• (Cannot Delete or changle critical settings) |

---

## 4. Features

### 4.1 Dashboard
Accessed via `/admin/dashboard` after login. Navigate using the top tabs.

### 4.2 Online Applications
- **View**: Check all submitted applications (Newest first).
- **Update Status**: Change status (`Pending` → `In Progress` → `Done`).
- **Delete**: Super Admin only.

### 4.3 Receipts & Payment
- **Logs**: View issued receipt history.
- **Manual Issue**: Register a new receipt record manually by entering Merchant, Amount, and Card Info.

### 4.4 Manager Contacts
- Manage the **Contact Information (Phone, Email)** displayed on the main page.
- Updates here are reflected immediately on the user-facing site (Integration required).

### 4.5 Docs Management
- **Upload**: Upload new PDF files to `public/docs/` for AI analysis context.
- **Delete**: Remove obsolete documents from the server.

### 4.6 Admin Accounts -- *Super Admin Only*
- **Approval**: New admins signing up via `/admin/register` start in `Pending` state. You must click **[Approve]** here to enable their access.

---

## 5. Data Backup
- Super Admins can click the **[Backup All Data]** button (Top Right) to download a consolidated `JSON` file containing all system data (`admins`, `managers`, `applications`, `receipts`).
- Regular backups are highly recommended.

---

## 6. Troubleshooting
- **Login fails**: Check if your account has been approved by a Super Admin.
- **Data missing**: Check if the server storage was reset. Use your backup files to restore if necessary.
