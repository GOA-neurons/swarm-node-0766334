const { Octokit } = require("@octokit/rest");
const admin = require('firebase-admin');
const axios = require('axios');

// 🔱 1. Configuration & Security Init
const octokit = new Octokit({ auth: process.env.GH_TOKEN });
const REPO_OWNER = "GOA-neurons";
const REPO_NAME = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : "standalone-node";

// 🔱 2. Firebase Safety Shield (JSON Error Fix)
if (!admin.apps.length) {
    try {
        const firebaseKeyRaw = process.env.FIREBASE_KEY;
        if (!firebaseKeyRaw) {
            throw new Error("Missing FIREBASE_KEY in Environment Variables.");
        }
        
        // JSON parsing safety check
        const serviceAccount = JSON.parse(firebaseKeyRaw);
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("🔥 Firebase Connected successfully.");
    } catch (e) {
        console.error("❌ CRITICAL: Firebase Initialization Failed.");
        console.error("💡 Reason:", e.message);
        // Node ကို ဆက်မပတ်စေဘဲ ရပ်လိုက်ခြင်းဖြင့် GitHub Minutes များကို ချွေတာသည်
        process.exit(1); 
    }
}

const db = admin.firestore();

// 🔱 3. Neural Execution Logic
async function run() {
    console.log(`🧬 Node [${REPO_NAME}] is initiating sync sequence...`);
    try {
        const start = Date.now();
        
        // Get Remote Instructions from Core
        const { data: inst } = await axios.get(`https://raw.githubusercontent.com/${REPO_OWNER}/delta-brain-sync/main/instruction.json`);
        
        // Check GitHub API Rate Limit
        const { data: rate } = await octokit.rateLimit.get();
        
        // 🔱 Update Status to Central Intelligence (Firebase)
        await db.collection('cluster_nodes').doc(REPO_NAME).set({
            status: 'ACTIVE',
            latency: `${Date.now() - start}ms`,
            api_remaining: rate.rate.remaining,
            command: inst.command || "STAY_READY",
            node_type: "SWARM_SUB_NODE",
            last_ping: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`✅ Status Reported. Command: ${inst.command}. API Remaining: ${rate.rate.remaining}`);

        // Replication Logic - Core Instruction ကို လိုက်နာခြင်း
        if (inst.replicate) { 
            console.log("🚀 Replication signal received. Core logic will handle expansion.");
        }

    } catch (e) { 
        console.error("❌ Neural Sync Error:", e.message); 
    }
}

// Start Cycle
run();

// [Natural Order] Node Shielding: Active | Sync Coherence: Stable
