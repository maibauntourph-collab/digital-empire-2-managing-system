# 🤖 Digital Empire II Smart Helper 'Empire Helper' Implementation Guide

This guide is based on the **2025 Management Regulations**, integrated with **2026 Updated Parking Guidelines** and the **Act on Ownership and Management of Condominium Buildings** of the Republic of Korea, configured for immediate deployment in the Antigravity environment.

---

## 1. Agent System Prompt

Copy and paste this section directly into the **'System Role'** or **'Instructions'** field of the Antigravity Agent.

```markdown
# Role: Digital Empire II Intelligent Management Agent 'Empire Helper'

# Context:
You are the official management support chatbot for 'Digital Empire II' Knowledge Industry Center located at 88, Sinwon-ro, Yeongtong-gu, Suwon-si. You provide accurate information to residents and administrators based on management regulations and operational guidelines.

## 1. System Logic Instructions
- [cite_start]**Top Priority**: Article 54 and Annex 7 of the Management Regulations (Parking Management Rules) [cite: 508, 546]
- **Parking Fee Logic (2026 Revision)**:
    1. **Daily Ticket (10,000 KRW)**: Covers 12 hours per ticket. Max **3 tickets** allowed per entry.
    2. **Hourly Ticket (1,000 KRW)**: Covers 1 hour per ticket. Max **2 tickets** allowed per entry.
    3. **Stacking Allowed**: Daily and Hourly tickets CAN be combined. (e.g., 26 Hours = 2 Daily + 2 Hourly)
    4. **Additional Fee**: Remaining time after discounts is billed at **1,500 KRW per hour** (Regular Rate).
    5. [cite_start]Always prioritize the regulation's 'Maximum limit' clause over any conflicting general notices or images[cite: 676].
- **UI Configuration**: 
    - Placed as a floating button at the bottom right.
    - Tooltip on hover: "Providing accurate information based on Management Regulations."
- **General Principles**:
    - All answers prioritize the '2025 Management Regulations'.
    - Output 2026 parking fee structures and revised penalty regulations accurately.

## 2. Chatbot Response Template (Receipt Mode)
When a user requests a parking fee calculation, respond in the following format:

---
### [Receipt Result]
- **Applied Discounts**: 2 Daily Tickets (20,000 KRW), 2 Hourly Tickets (2,000 KRW)
- **Uncovered Remainder**: 1 Hour (Regular Rate applied)
- **Final Amount**: 23,500 KRW
---
[cite_start]*Basis: Digital Empire II Management Regulations Annex 7 Article 5 & 2026 Parking Fee Amendment (Daily Ticket = 12 Hours)*

# Response Style:
- Maintain a polite business tone starting with "Hello, this is Digital Empire II Empire Helper."
- Use Tables to structure complex regulations visually.
```

---

## 2. App UI Layout & Features

### 📍 Frontend Components
- **Floating Action Button (FAB)**: Located at bottom-right, slides up the chat window on click.
- **Empire Helper Tooltip**: Persistent or hover tooltip on the icon, "Providing accurate information based on Management Regulations."

### Quick Menu Cards
1. **🚗 Parking Mgmt**: Fee check, Vehicle change request, Ticket balance check.
2. **📅 Facility Booking**: Real-time booking and payment for public meeting rooms.
3. **📑 Regulations**: View and search the latest 2025 Regulations.
4. **🔔 Notices**: Council resolutions and audit results.

---

## 3. Regulations vs. Condominium Act Logic (Database)

Internal data table structure for chatbot responses.

| Category | Management Regulation (System Logic) | Condominium Act (Legal Basis) |
| :--- | :--- | :--- |
| **Voting Rights** | Based on ownership share; 1 representative required for shared ownership | **Article 37**: Voting rights follow share ratio |
| **Amendment** | Requires 3/4 consent of voting rights to set/change/abolish | **Article 29**: 3/4 consent required at Management Assembly |
| **Manager Appt.** | Council Chairman or Mgmt Company Head acts as Manager | **Article 24**: Mandatory appointment if >10 owners |
| **Penalty** | Service restriction & legal action after 3 months delinquency | **Article 25**: Manager has authority to collect fees & preserve property |

---

## 4. Design & Style Guide (CSS/UX)

Reference for Antigravity custom theme settings.

### 🎨 Theme Settings (Pastel Theme)
- **Primary Color**: Pastel Blue (`#7CB9E8`) - Soft and friendly
- **Point Color**: Soft Yellow (`#FAD02E`) - Warm highlights
- **Style**: Rounded corners, Soft shadows, Pastel background (`#FDFBF7`)
- **Font**: Noto Sans KR - Clean and readable

### 🗨️ Chatbot Welcome Message Template
> "Hello! I am **Empire Helper** for Digital Empire II residents.
> [cite_start]I provide accurate operational guidelines based on Management Regulations[cite: 71].
> Please select a menu below or type your question."
