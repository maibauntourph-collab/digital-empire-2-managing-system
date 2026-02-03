import connectToDatabase from './mongodb';
import { AdminModel, ManagerModel, ApplicationModel, ReceiptModel, SettingsModel, IAdmin, IManager, IApplication, IReceipt, ISettings } from './models';

// --- Interfaces (Re-exporting or mapping from Models if needed, though models are compatible) ---
// We keep these for type compatibility with existing code imports
export type Admin = IAdmin;
export type Manager = IManager;
export type Application = IApplication;
export type Receipt = IReceipt;
export type Settings = ISettings;

// --- Helper to ensure connection ---
async function db() {
    await connectToDatabase();
}

// --- Admin Operations ---

export async function getAdmins(): Promise<Admin[]> {
    await db();
    const admins = await AdminModel.find({}).sort({ createdAt: -1 });
    return admins as unknown as Admin[];
}

export async function findAdminByUsername(username: string): Promise<Admin | undefined> {
    await db();
    const admin = await AdminModel.findOne({ username });
    return admin ? (admin as unknown as Admin) : undefined;
}

export async function createAdmin(adminData: Partial<Admin>): Promise<void> {
    await db();
    if (await AdminModel.findOne({ username: adminData.username })) {
        throw new Error('Username already exists');
    }
    await AdminModel.create(adminData);
}

export async function approveAdmin(id: string): Promise<void> {
    await db();
    await AdminModel.findByIdAndUpdate(id, { approved: true });
}

export async function updateAdminPermissions(id: string, permissions: string[]): Promise<void> {
    await db();
    await AdminModel.findByIdAndUpdate(id, { permissions });
}

export async function deleteAdmin(id: string): Promise<void> {
    await db();
    await AdminModel.findByIdAndDelete(id);
}

// --- Manager Operations ---

export async function getManagers(): Promise<Manager[]> {
    await db();
    const managers = await ManagerModel.find({}).sort({ createdAt: -1 });
    return managers as unknown as Manager[];
}

export async function addManager(managerData: Partial<Manager>): Promise<void> {
    await db();
    await ManagerModel.create(managerData);
}

export async function updateManager(id: string, updates: Partial<Manager>): Promise<void> {
    await db();
    await ManagerModel.findByIdAndUpdate(id, updates);
}

export async function deleteManager(id: string): Promise<void> {
    await db();
    await ManagerModel.findByIdAndDelete(id);
}

// --- Application Operations ---

export async function getApplications(): Promise<Application[]> {
    await db();
    const apps = await ApplicationModel.find({}).sort({ createdAt: -1 });
    return apps as unknown as Application[];
}

export async function addApplication(appData: Partial<Application>): Promise<void> {
    await db();
    await ApplicationModel.create(appData);
}

export async function updateApplicationStatus(id: string, status: string): Promise<void> {
    await db();
    await ApplicationModel.findByIdAndUpdate(id, { status });
}

export async function deleteApplication(id: string): Promise<void> {
    await db();
    await ApplicationModel.findByIdAndDelete(id);
}

// --- Receipt Operations ---

export async function getReceipts(): Promise<Receipt[]> {
    await db();
    const receipts = await ReceiptModel.find({});
    return receipts as unknown as Receipt[];
}

export async function addReceipt(receiptData: Partial<Receipt>): Promise<void> {
    await db();
    await ReceiptModel.create(receiptData);
}

export async function deleteReceipt(id: string): Promise<void> {
    await db();
    await ReceiptModel.findByIdAndDelete(id);
}

// --- Settings Operations ---

export async function getSettings(): Promise<Settings> {
    await db();
    let settings = await SettingsModel.findOne({});
    if (!settings) {
        settings = await SettingsModel.create({ botImageType: 'realistic' });
    }
    return settings as unknown as Settings;
}

export async function updateSettings(updates: Partial<Settings>): Promise<void> {
    await db();
    const settings = await SettingsModel.findOne({});
    if (settings) {
        await SettingsModel.findByIdAndUpdate(settings._id, updates);
    } else {
        await SettingsModel.create(updates);
    }
}

