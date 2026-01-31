import 'dotenv/config'; // Loads .env file
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { AdminModel, ManagerModel, ApplicationModel, ReceiptModel } from '../lib/models';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env');
    process.exit(1);
}

const DATA_DIR = path.join(__dirname, '..', 'data');

async function readJSON(filename: string) {
    const filePath = path.join(DATA_DIR, filename);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        console.warn(`Warning: Could not read ${filename}, skipping.`);
        return [];
    }
}

async function migrate() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected.');

    // 1. Admins
    const admins = await readJSON('admins.json');
    if (admins.length > 0) {
        console.log(`Migrating ${admins.length} admins...`);
        // Use insertMany with ordered: false to continue on dupes, but usually better to wipe or check
        // Ideally we map 'id' from JSON to preserved ID if needed, but Models auto-generate _id.
        // If we want to keep exact IDs, we might need to conform schemas.
        // For now, let's just insert.
        try {
            await AdminModel.deleteMany({}); // Optional: Clear DB before migration? Let's clear to avoid dupes for this run.
            await AdminModel.insertMany(admins);
            console.log('Admins migrated.');
        } catch (e) {
            console.error('Error migrating admins:', e);
        }
    }

    // 2. Managers
    const managers = await readJSON('managers.json');
    if (managers.length > 0) {
        console.log(`Migrating ${managers.length} managers...`);
        try {
            await ManagerModel.deleteMany({});
            await ManagerModel.insertMany(managers);
            console.log('Managers migrated.');
        } catch (e) {
            console.error('Error migrating managers:', e);
        }
    }

    // 3. Applications
    const apps = await readJSON('applications.json');
    if (apps.length > 0) {
        console.log(`Migrating ${apps.length} applications...`);
        try {
            await ApplicationModel.deleteMany({});
            await ApplicationModel.insertMany(apps);
            console.log('Applications migrated.');
        } catch (e) {
            console.error('Error migrating applications:', e);
        }
    }

    // 4. Receipts
    const receipts = await readJSON('receipts.json');
    if (receipts.length > 0) {
        console.log(`Migrating ${receipts.length} receipts...`);
        try {
            await ReceiptModel.deleteMany({});
            await ReceiptModel.insertMany(receipts);
            console.log('Receipts migrated.');
        } catch (e) {
            console.error('Error migrating receipts:', e);
        }
    }

    console.log('Migration complete.');
    await mongoose.disconnect();
}

migrate();
