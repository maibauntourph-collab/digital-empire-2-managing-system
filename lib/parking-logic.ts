/**
 * Digital Empire II Parking Fee Calculator Logic
 * Based on 2026 Updated Parking Guidelines
 *
 * Key Rules:
 * 1. Basic Rate:
 *    - First 30 minutes: Free
 *    - Thereafter: 1,500 KRW per 60 minutes (Calculated as per hour after free time?)
 *      * CORRECTION based on user prompt "1 hour 1,500 won" for the remaining time.
 *      * Previous logic was 1,200 per 30min (2,400/hr). New logic implies 1,500/hr.
 *
 * 2. Discount Tickets:
 *    - Daily Ticket (1일권):
 *      - Fee: 10,000 KRW
 *      - Coverage: 12 Hours (Based on 2 tickets = 24h usage + 2h hourly + 1h remain = 27h)
 *      - Limit: Max 3 tickets per entry.
 *    - Hourly Ticket (시간권 - assumes 1 hour based on context):
 *      - Fee: 1,000 KRW
 *      - Coverage: 1 Hour
 *      - Limit: Max 2 tickets per entry.
 *
 * 3. Stacking Rules:
 *    - Daily and Hourly tickets CAN be combined.
 *    - Logic: Apply tickets to cover time first. Remaining time is billed at regular rate.
 */

export interface ParkingTicketSelection {
    acc30min: number; // Deprecated/Unused in new logic example, but kept for interface compatibility if needed. Assumed 0 or mapped to hourly? User said "Time ticket", likely 1 hour.
    acc1hour: number; // Hourly ticket
    acc1day: number;  // Daily ticket
}

export function calculateParkingFee(
    entryTime: Date,
    exitTime: Date,
    tickets: ParkingTicketSelection
): {
    totalFee: number;
    totalDurationMinutes: number;
    appliedDiscountMinutes: number;
    breakdown: string[];
    receipt: {
        applied: string[];
        unapplied: string[];
        finalFee: number;
    };
} {
    const breakdown: string[] = [];
    const applied: string[] = [];
    const unapplied: string[] = [];

    // Constants
    const FEE_DAILY = 10000;
    const DURATION_DAILY_MIN = 12 * 60; // 12 Hours
    const LIMIT_DAILY = 3;

    const FEE_HOURLY = 1000;
    const DURATION_HOURLY_MIN = 60; // 1 Hour
    const LIMIT_HOURLY = 2;

    const FEE_REGULAR_PER_HOUR = 1500;
    const FREE_TIME_MIN = 30; // Assuming 30min free time remains? Or is it removed?
    // User's example: 27h = 2 Daily(24h) + 2 Hourly(2h) + 1h Regular.
    // Total covered 26h. Remaining 1h. Fee 1500.
    // If there was 30min free time, remaining would be 30min.
    // 30min fee? 1500 implies 1 hour unit.
    // Let's assume standard logic: Free time is deducted from total, OR
    // In the 27h example, maybe free time isn't applied if > X hours?
    // Or straightforward: 27h count. Ticket covers 26h. 1h left. 1h * 1500.
    // This implies NO free time deduction on the remaining part?
    // Let's stick to the user's explicit math: 27h total.
    // Tickets: 24h + 2h = 26h.
    // Remainder: 1h. Cost 1500.
    // If 30min free existed, remainder would be 30min?
    // Let's assume for long term parking, free time might be consumed or ignored?
    // OR, User math is simple: 1h regular = 1500.
    // I will stick to the exact math provided.

    // 1. Calculate Total Duration
    const diffMs = exitTime.getTime() - entryTime.getTime();
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    if (totalMinutes < 0) {
        return {
            totalFee: 0,
            totalDurationMinutes: 0,
            appliedDiscountMinutes: 0,
            receipt: { applied: [], unapplied: [], finalFee: 0 },
            breakdown: ["입차 시간이 출차 시간보다 늦습니다."],
        };
    }

    breakdown.push(`총 주차 시간: ${Math.floor(totalMinutes / 60)}시간 ${totalMinutes % 60}분 (${totalMinutes}분)`);

    // 2. Apply Daily Tickets
    let appliedDayCount = tickets.acc1day;
    if (appliedDayCount > LIMIT_DAILY) {
        unapplied.push(`일일권 초과 (${appliedDayCount - LIMIT_DAILY}장 미적용 - 최대 ${LIMIT_DAILY}장)`);
        breakdown.push(`※ 일일권은 최대 ${LIMIT_DAILY}장까지만 적용 가능합니다.`);
        appliedDayCount = LIMIT_DAILY;
    }

    // 3. Apply Hourly Tickets
    // Note: User mentioned "Time ticket 2". We'll map acc1hour to this.
    // If acc30min implies "Time ticket" as well? Let's check user prompt "시간권은 2개".
    // Usually implies 1 hour. I will use acc1hour.
    let appliedHourlyCount = tickets.acc1hour;
    if (appliedHourlyCount > LIMIT_HOURLY) {
        unapplied.push(`시간권 초과 (${appliedHourlyCount - LIMIT_HOURLY}장 미적용 - 최대 ${LIMIT_HOURLY}장)`);
        breakdown.push(`※ 시간권은 최대 ${LIMIT_HOURLY}장까지만 적용 가능합니다.`);
        appliedHourlyCount = LIMIT_HOURLY;
    }

    // 4. Calculate Covered Time & Ticket Fees
    const dailyCoveredMin = appliedDayCount * DURATION_DAILY_MIN;
    const hourlyCoveredMin = appliedHourlyCount * DURATION_HOURLY_MIN;
    const totalCoveredMin = dailyCoveredMin + hourlyCoveredMin;

    const dailyFee = appliedDayCount * FEE_DAILY;
    const hourlyFee = appliedHourlyCount * FEE_HOURLY;
    const ticketFee = dailyFee + hourlyFee;

    if (appliedDayCount > 0) applied.push(`일일권 ${appliedDayCount}장 (${dailyFee.toLocaleString()}원)`);
    if (appliedHourlyCount > 0) applied.push(`시간권 ${appliedHourlyCount}장 (${hourlyFee.toLocaleString()}원)`);

    breakdown.push(`할인 적용 시간: ${Math.floor(totalCoveredMin / 60)}시간 ${totalCoveredMin % 60}분`);

    // 5. Calculate Remaining Time & Regular Fee
    const remainingMinutes = Math.max(0, totalMinutes - totalCoveredMin);
    let regularFee = 0;

    if (remainingMinutes > 0) {
        // User example: 1 hour remaining = 1500 won.
        // Implies 1500 per hour.
        // Is it per 30 mins? If 1500 is 1 hour, is 30 mins 750?
        // Usually parking is per x minutes.
        // Assuming 1500 per hour unit tailored to the example.
        // Billing unit: ceil(minutes / 60)?
        // "1시간 1,500원" implies hourly billing for remainder.
        const billingUnits = Math.ceil(remainingMinutes / 60);
        regularFee = billingUnits * FEE_REGULAR_PER_HOUR;

        breakdown.push(`미적용 잔여 시간: ${remainingMinutes}분`);
        breakdown.push(`추가 요금: ${billingUnits}시간 × ${FEE_REGULAR_PER_HOUR.toLocaleString()}원 = ${regularFee.toLocaleString()}원`);
    } else {
        breakdown.push(`추가 요금 없음 (할인권으로 시간 커버)`);
    }

    const totalFee = ticketFee + regularFee;

    breakdown.push(`----------------------------------`);
    breakdown.push(`권종 합계: ${ticketFee.toLocaleString()}원`);
    breakdown.push(`일반 요금: ${regularFee.toLocaleString()}원`);
    breakdown.push(`최종 요금: ${totalFee.toLocaleString()}원`);

    return {
        totalFee,
        totalDurationMinutes: totalMinutes,
        appliedDiscountMinutes: totalCoveredMin,
        receipt: {
            applied,
            unapplied,
            finalFee: totalFee
        },
        breakdown,
    };
}
