/**
 * Digital Empire II Parking Fee Calculator Logic
 * Based on User's Precise Rules (2026 Updated)
 * 
 * Rules:
 * [Rates]
 * - Basic: 1,500 KRW / hour
 * - Daily: 10,000 KRW / day
 * - Hourly: 1,000 KRW / hour
 * - Free: First 30 mins
 * 
 * [Limits]
 * - Hourly Ticket: Max 2 per day
 * - Long Tern (>= 3 days): Max 3 Daily Tickets, No Hourly Tickets allowed.
 * 
 * [Logic - Step by Step]
 * 1. Billable Time = Total Duration - 30 mins
 * 2. Basic Fee = Billable Time x 1,500/hr
 * 3. Hourly Ticket App = min(Billable, 2) * 1000 + max(Billable - 2, 0) * 1500
 * 4. Daily Ticket App = 10,000 / day
 * 5. >= 3 Days: Daily(min(days, 3)) + Extra * 24 * 1500
 * 6. Final = min(Basic, Hourly App, Daily App)
 */

export interface ParkingTicketSelection {
    acc30min: number;
    acc1hour: number;
    acc1day: number;
}

export function calculateParkingFee(
    entryTime: Date,
    exitTime: Date,
    tickets?: ParkingTicketSelection
): {
    totalFee: number;
    totalDurationMinutes: number;
    totalDuration: string; // Human readable
    breakdown: string[];
    receipt: {
        applied: string[];
        unapplied: string[];
        finalFee: number;
    };
} {
    const breakdown: string[] = [];

    // 0. Time Calculation
    const diffMs = exitTime.getTime() - entryTime.getTime();
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    if (totalMinutes < 0) {
        return {
            totalFee: 0,
            totalDurationMinutes: 0,
            totalDuration: "0분",
            breakdown: ["입차 시간이 출차 시간보다 늦습니다."],
            receipt: { applied: [], unapplied: [], finalFee: 0 }
        };
    }

    const durationStr = `${Math.floor(totalMinutes / 60)}시간 ${totalMinutes % 60}분`;
    const days = Math.floor(totalMinutes / (24 * 60));
    const isLongTerm = totalMinutes >= (3 * 24 * 60);

    // 1. Billable Time (Step 1)
    // "과금시간 = 총 주차시간 - 30분"
    const billableMinutes = Math.max(0, totalMinutes - 30);
    // "1,500원/시간". Assuming ceiling for hourly blocks.
    const billableHours = Math.ceil(billableMinutes / 60);

    breakdown.push(`총 주차: ${durationStr}`);
    breakdown.push(`과금 시간: ${Math.floor(billableMinutes / 60)}시간 ${billableMinutes % 60}분 (30분 무료 제외)`);

    // 2. Basic Fee (Step 2)
    const basicFee = billableHours * 1500;

    // 3. Find Minimum Fee Strategy
    let finalFee = basicFee;
    let appliedStrategy = "기본 요금";
    let appliedTickets = { daily: 0, hourly: 0 };

    if (isLongTerm) {
        // Rule 5: "3일 이상"
        const spanDays = Math.ceil(totalMinutes / (24 * 60));
        const limitDaily = Math.min(spanDays, 3);

        const feeTickets = limitDaily * 10000;
        const excessDays = Math.max(0, spanDays - limitDaily);
        const feeExcess = excessDays * 24 * 1500;

        finalFee = feeTickets + feeExcess;
        appliedStrategy = "장기 주차 (일일권 Max 3 + 초과)";
        appliedTickets.daily = limitDaily;

        breakdown.push(`장기 주차(${spanDays}일차) 적용`);
        if (excessDays > 0) breakdown.push(`초과 일수(${excessDays}일) 일반 요금 적용`);
    } else {
        // Less than 3 days. Find Best Combo.
        // Loop Dailies (0 to spanDays).
        const spanDays = Math.ceil(totalMinutes / (24 * 60));
        let bestLocalFee = Infinity;

        for (let d = 0; d <= spanDays; d++) {
            // Duration covered by d dailies (24h each)
            const coveredMinutes = d * 24 * 60;
            const remainingTotalMin = Math.max(0, totalMinutes - coveredMinutes);
            let currentFee = d * 10000;
            let hTickets = 0;

            if (remainingTotalMin > 0) {
                const remBillable = Math.max(0, remainingTotalMin - 30);
                const remHours = Math.ceil(remBillable / 60);

                // Apply Hourly Tickets (Max 2) logic
                const useHourly = Math.min(remHours, 2);
                const useBasic = Math.max(0, remHours - 2);

                const feeRem = (useHourly * 1000) + (useBasic * 1500);

                currentFee += feeRem;
                hTickets = useHourly;
            }

            if (currentFee < bestLocalFee) {
                bestLocalFee = currentFee;
                appliedTickets.daily = d;
                appliedTickets.hourly = hTickets;
            }
        }
        finalFee = bestLocalFee;
        appliedStrategy = "자동 최적화 적용";
    }

    // Receipt Generation
    const appliedItems: string[] = [];
    if (appliedTickets.daily > 0) appliedItems.push(`일일권 ${appliedTickets.daily}매`);
    if (appliedTickets.hourly > 0) appliedItems.push(`시간권 ${appliedTickets.hourly}매`);

    breakdown.push(`----------------------------------`);
    breakdown.push(`전략: ${appliedStrategy}`);
    breakdown.push(`최종 요금: ${finalFee.toLocaleString()}원`);

    return {
        totalFee: finalFee,
        totalDurationMinutes: totalMinutes,
        totalDuration: durationStr,
        breakdown,
        receipt: {
            applied: appliedItems,
            unapplied: [], // No manual rejection in auto mode
            finalFee
        }
    };
}
