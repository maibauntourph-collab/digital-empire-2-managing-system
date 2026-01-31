import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');
const MANAGERS_FILE = path.join(DATA_DIR, 'managers.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');
const RECEIPTS_FILE = path.join(DATA_DIR, 'receipts.json');

// --- Interfaces ---

export interface Admin {
    id: string;
    username: string;
    password?: string; // Hashed ideally, but plaintext for this MVP as per request
    name: string;
    role: 'SUPER_ADMIN' | 'MANAGER';
    approved: boolean;
    createdAt: string;
}

export interface Manager {
    id: string;
    name: string;
    role: string; // e.g., "Facility Manager"
    department: string; // e.g., "Office"
    email: string;
    phone: string;
    createdAt: string;
}

export interface Application {
    id: string;
    type: string; // e.g., "비즈니스룸 예약"
    name: string;
    company: string;
    phone: string;
    content: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'REJECTED';
    createdAt: string;
}

export interface Receipt {
    id: string;
    issueDate: string;
    merchantName: string;
    amount: number;
    items: string[];
    approvalNo: string;
    cardName: string;
    cardNum: string; // Masked
}

// --- Generic Helpers ---

async function readJSON<T>(filePath: string): Promise<T[]> {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty array
        return [];
    }
}

async function writeJSON<T>(filePath: string, data: T[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// --- Admin Operations ---

export async function getAdmins(): Promise<Admin[]> {
    return readJSON<Admin>(ADMINS_FILE);
}

export async function findAdminByUsername(username: string): Promise<Admin | undefined> {
    const admins = await getAdmins();
    return admins.find(a => a.username === username);
}

export async function createAdmin(admin: Admin): Promise<void> {
    const admins = await getAdmins();
    if (admins.find(a => a.username === admin.username)) {
        throw new Error('Username already exists');
    }
    admins.push(admin);
    await writeJSON(ADMINS_FILE, admins);
}

export async function approveAdmin(id: string): Promise<void> {
    const admins = await getAdmins();
    const admin = admins.find(a => a.id === id);
    if (admin) {
        admin.approved = true;
        await writeJSON(ADMINS_FILE, admins);
    }
}

// --- Manager Operations ---

export async function getManagers(): Promise<Manager[]> {
    return readJSON<Manager>(MANAGERS_FILE);
}

export async function addManager(manager: Manager): Promise<void> {
    const managers = await getManagers();
    managers.push(manager);
    await writeJSON(MANAGERS_FILE, managers);
}

export async function updateManager(id: string, updates: Partial<Manager>): Promise<void> {
    const managers = await getManagers();
    const index = managers.findIndex(m => m.id === id);
    if (index !== -1) {
        managers[index] = { ...managers[index], ...updates };
        await writeJSON(MANAGERS_FILE, managers);
    }
}

export async function deleteManager(id: string): Promise<void> {
    const managers = await getManagers();
    const filtered = managers.filter(m => m.id !== id);
    await writeJSON(MANAGERS_FILE, filtered);
}

// --- Application Operations ---

export async function getApplications(): Promise<Application[]> {
    return readJSON<Application>(APPLICATIONS_FILE);
}

export async function addApplication(app: Application): Promise<void> {
    const apps = await getApplications();
    apps.push(app);
    await writeJSON(APPLICATIONS_FILE, apps);
}

export async function updateApplicationStatus(id: string, status: Application['status']): Promise<void> {
    const apps = await getApplications();
    const app = apps.find(a => a.id === id);
    if (app) {
        app.status = status;
        await writeJSON(APPLICATIONS_FILE, apps);
    }
}

export async function deleteApplication(id: string): Promise<void> {
    const apps = await getApplications();
    const filtered = apps.filter(a => a.id !== id);
    await writeJSON(APPLICATIONS_FILE, filtered);
}

// --- Receipt Operations ---

export async function getReceipts(): Promise<Receipt[]> {
    return readJSON<Receipt>(RECEIPTS_FILE);
}

export async function addReceipt(receipt: Receipt): Promise<void> {
    const receipts = await getReceipts();
    receipts.push(receipt);
    await writeJSON(RECEIPTS_FILE, receipts);
}

export async function deleteReceipt(id: string): Promise<void> {
    const receipts = await getReceipts();
    const filtered = receipts.filter(r => r.id !== id);
    await writeJSON(RECEIPTS_FILE, filtered);
}
