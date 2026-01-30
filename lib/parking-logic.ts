/**
 * Digital Empire II Parking Fee Calculator Logic
 * Based on 2026 Parking Guidelines & 2025 Management Regulations
 *
 * Key Rules:
 * 1. Basic Rate:
 *    - First 30 minutes: Free
 *    - Thereafter: 1,200 KRW per 30 minutes
 *
 * 2. Discount Tickets:
 *    - Types: 30min, 1hour, 1day (24hours)
 *    - Limitation (Hourly): Max 2 hours total per entry (mix of 30min/1hr).
 *    - Limitation (Daily): Max 3 tickets (72 hours) for 1-day passes.
 *    - Exclusivity: 1-Day tickets CANNOT be combined with Hourly tickets.
 */

export interface ParkingTicketSelection {
    acc30min: number; // Count of 30min tickets
    acc1hour: number; // Count of 1hr tickets
    acc1day: number;  // Count of 1day tickets
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

    // 2. Check for Day Tickets (Priority & Exclusivity)
    // If Day tickets are used, we ignore Hourly tickets.
    if (tickets.acc1day > 0) {
        const appliedDayCounts = Math.min(tickets.acc1day, 3); // Max 3 tickets
        const dayDiscountMinutes = appliedDayCounts * 24 * 60;

        applied.push(`일일권 ${appliedDayCounts}장`);
        breakdown.push(`1일권 ${appliedDayCounts}장 적용 (최대 3장)`);

        // Strict Exclusivity Rule: Day tickets cannot be combined with Hourly tickets
        if (tickets.acc30min > 0 || tickets.acc1hour > 0) {
            unapplied.push(`시간 할인권 (규약상 일일권과 중복 사용 불가)`);
            breakdown.push(`※ 1일권 사용 시 시간 할인권은 적용되지 않습니다.`);
        }

        // Deduct Day Ticket time
        const remainingAfterDayPass = Math.max(0, totalMinutes - dayDiscountMinutes);

        if (remainingAfterDayPass === 0) {
            // Fully covered by day pass
            return {
                totalFee: 0,
                totalDurationMinutes: totalMinutes,
                appliedDiscountMinutes: totalMinutes,
                receipt: {
                    applied,
                    unapplied,
                    finalFee: 0
                },
                breakdown: [...breakdown, "1일권으로 전액 감면"],
            };
        }

        // For the remaining time, apply standard billing (1,200 KRW / 30min)
        // Note: Day pass consumes the 'free 30min' benefit effectively as it covers the first N days.
        const billingUnits = Math.ceil(remainingAfterDayPass / 30);
        const fee = billingUnits * 1200;

        breakdown.push(`일일권 공제 후 잔여: ${remainingAfterDayPass}분`);
        breakdown.push(`추가 요금: ${billingUnits}구간 × 1,200원 = ${fee.toLocaleString()}원`);

        return {
            totalFee: fee,
            totalDurationMinutes: totalMinutes,
            appliedDiscountMinutes: dayDiscountMinutes,
            receipt: {
                applied,
                unapplied,
                finalFee: fee
            },
            breakdown,
        };
    }

    // 3. Hourly Discounts (Max 2 Hours)
    // Only processed if NO day tickets are used
    let requestedHourlyDiscount = (tickets.acc1hour * 60) + (tickets.acc30min * 30);
    const maxHourlyDiscount = 120; // 2 hours
    const appliedHourlyDiscount = Math.min(requestedHourlyDiscount, maxHourlyDiscount);

    if (tickets.acc30min > 0) applied.push(`30분권 ${tickets.acc30min}장`);
    if (tickets.acc1hour > 0) applied.push(`1시간권 ${tickets.acc1hour}장`);

    if (requestedHourlyDiscount > 0) {
        breakdown.push(`시간 할인권 요청: ${requestedHourlyDiscount}분`);
        if (requestedHourlyDiscount > maxHourlyDiscount) {
            const exceededTime = requestedHourlyDiscount - maxHourlyDiscount;
            unapplied.push(`시간 할인권 초과분 (${exceededTime}분 미적용)`);
            breakdown.push(`※ 시간 할인권은 최대 2시간(${maxHourlyDiscount}분)까지만 적용됩니다.`);
        }
        breakdown.push(`적용 할인 시간: ${appliedHourlyDiscount}분`);
    }

    // 4. Calculate Net Time
    const freeTime = 30;
    const effectiveBillableMinutes = Math.max(0, totalMinutes - freeTime - appliedHourlyDiscount);

    breakdown.push(`기본 무료 시간: ${freeTime}분 적용`);

    if (effectiveBillableMinutes === 0) {
        return {
            totalFee: 0,
            totalDurationMinutes: totalMinutes,
            appliedDiscountMinutes: appliedHourlyDiscount + freeTime,
            receipt: {
                applied,
                unapplied,
                finalFee: 0
            },
            breakdown: [...breakdown, "무료 주차 적용"],
        };
    }

    // 5. Calculate Fee
    // 1,200 KRW per 30 mins
    const billingUnits = Math.ceil(effectiveBillableMinutes / 30);
    const totalFee = billingUnits * 1200;

    breakdown.push(`과금 대상 시간: ${effectiveBillableMinutes}분`);
    breakdown.push(`요금 상세: ${billingUnits}구간(30분 단위) × 1,200원`);
    breakdown.push(`최종 요금: ${totalFee.toLocaleString()}원`);

    return {
        totalFee,
        totalDurationMinutes: totalMinutes,
        appliedDiscountMinutes: appliedHourlyDiscount,
        receipt: {
            applied,
            unapplied,
            finalFee: totalFee
        },
        breakdown,
    };
}
