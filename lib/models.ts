import mongoose, { Schema, Document, Model } from 'mongoose';

// --- Interface Definitions (Matching lib/db.ts) ---

export interface IAdmin extends Document {
    id: string; // Virtual
    username: string;
    password?: string;
    name: string;
    role: 'SUPER_ADMIN' | 'MANAGER';
    approved: boolean;
    permissions: string[]; // ['applications', 'receipts', 'managers', 'docs', 'users']
    createdAt: string;
}

export interface IManager extends Document {
    id: string; // Virtual
    name: string;
    role: string;
    department: string;
    email: string;
    phone: string;
    createdAt: string;
}

export interface IApplication extends Document {
    id: string; // Virtual
    type: string;
    name: string;
    company: string;
    phone: string;
    content: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'REJECTED';
    createdAt: string;
}

export interface IReceipt extends Document {
    id: string; // Virtual
    issueDate: string;
    merchantName: string;
    amount: number;
    items: string[];
    approvalNo: string;
    cardName: string;
    cardNum: string;
}

export interface ISettings extends Document {
    id: string;
    botImageType: 'animation_a' | 'animation_b' | 'realistic';
}

// --- Schemas ---

const AdminSchema = new Schema<IAdmin>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    name: { type: String, required: true },
    role: { type: String, enum: ['SUPER_ADMIN', 'MANAGER'], default: 'MANAGER' },
    approved: { type: Boolean, default: false },
    permissions: { type: [String], default: [] },
}, { timestamps: true });

const ManagerSchema = new Schema<IManager>({
    name: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
}, { timestamps: true });

const ApplicationSchema = new Schema<IApplication>({
    type: { type: String, required: true },
    name: { type: String, required: true },
    company: { type: String, required: true },
    phone: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'DONE', 'REJECTED'], default: 'PENDING' },
}, { timestamps: true });

const ReceiptSchema = new Schema<IReceipt>({
    issueDate: { type: String, required: true },
    merchantName: { type: String, required: true },
    amount: { type: Number, required: true },
    items: { type: [String], required: true },
    approvalNo: { type: String, required: true },
    cardName: { type: String, required: true },
    cardNum: { type: String, required: true },
}, { timestamps: false });

const SettingsSchema = new Schema<ISettings>({
    botImageType: { type: String, enum: ['animation_a', 'animation_b', 'realistic'], default: 'realistic' },
}, { timestamps: true });

// --- Helpers for Frontend Compatibility ---

// Convert _id to id
const transformOptions = {
    virtuals: true,
    versionKey: false,
    transform: (doc: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
    },
};

AdminSchema.set('toJSON', transformOptions);
AdminSchema.set('toObject', transformOptions);
ManagerSchema.set('toJSON', transformOptions);
ManagerSchema.set('toObject', transformOptions);
ApplicationSchema.set('toJSON', transformOptions);
ApplicationSchema.set('toObject', transformOptions);
ReceiptSchema.set('toJSON', transformOptions);
ReceiptSchema.set('toObject', transformOptions);
SettingsSchema.set('toJSON', transformOptions);
SettingsSchema.set('toObject', transformOptions);


// --- Models ---
// Check if model already exists to prevent overwrite error in hot-reload
export const AdminModel = (mongoose.models.Admin as Model<IAdmin>) || mongoose.model<IAdmin>('Admin', AdminSchema);
export const ManagerModel = (mongoose.models.Manager as Model<IManager>) || mongoose.model<IManager>('Manager', ManagerSchema);
export const ApplicationModel = (mongoose.models.Application as Model<IApplication>) || mongoose.model<IApplication>('Application', ApplicationSchema);
export const ReceiptModel = (mongoose.models.Receipt as Model<IReceipt>) || mongoose.model<IReceipt>('Receipt', ReceiptSchema);
export const SettingsModel = (mongoose.models.Settings as Model<ISettings>) || mongoose.model<ISettings>('Settings', SettingsSchema);
