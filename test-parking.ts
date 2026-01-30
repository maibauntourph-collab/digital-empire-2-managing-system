
import { calculateParkingFee } from './lib/parking-logic';

function runTest(name: string, entry: Date, exit: Date, tickets: any, expectedFee: number, expectedUnapplied?: string) {
    console.log(`▶ 테스트 실행: ${name}`);
    const result = calculateParkingFee(entry, exit, tickets);

    let passed = true;
    if (result.totalFee !== expectedFee) {
        console.error(`  ❌ 실패: 요금 불일치 (예상값: ${expectedFee.toLocaleString()}, 실제값: ${result.totalFee.toLocaleString()})`);
        passed = false;
    }

    if (expectedUnapplied) {
        const found = result.receipt.unapplied.some(u => u.includes(expectedUnapplied));
        if (!found) {
            console.error(`  ❌ 실패: 미적용 사유 불일치 (예상 포함 문구: "${expectedUnapplied}", 실제 목록: ${JSON.stringify(result.receipt.unapplied)})`);
            passed = false;
        }
    }

    if (passed) {
        console.log("  ✅ 성공");
        console.log(`     - 총 시간: ${result.totalDurationMinutes}분`);
        console.log(`     - 최종 요금: ${result.totalFee.toLocaleString()}원`);
        console.log(`     - 상세: ${result.breakdown.join(' | ')}`);
    } else {
        console.log(`     - 상세: ${result.breakdown.join(' | ')}`);
    }
    console.log("---------------------------------------------------");
}

const now = new Date();
const hour26 = new Date(now.getTime() + 26 * 60 * 60 * 1000);
const hour27 = new Date(now.getTime() + 27 * 60 * 60 * 1000);

console.log("\n[ 엠파이어 도우미 주차 요금 계산기 테스트 시작 ]\n");

// Case 1: 26 Hours -> 2 Daily + 2 Hourly
// 1 Daily = 12h. 2 Daily = 24h.
// 2 Hourly = 2h.
// Total covered = 26h.
// Remaining 0.
// Cost: 2 * 10,000 + 2 * 1,000 = 22,000.
runTest(
    "26시간 주차 (일일권 2장 + 시간권 2장)",
    now,
    hour26,
    { acc30min: 0, acc1hour: 2, acc1day: 2 },
    22000
);

// Case 2: 27 Hours -> 2 Daily + 2 Hourly + 1h Regular
// Covered: 26h (as above).
// Remaining: 1h.
// Regular Fee: 1h * 1500 = 1,500.
// Ticket Fee: 22,000.
// Total: 23,500.
runTest(
    "27시간 주차 (일일권 2장 + 시간권 2장 + 1시간 일반)",
    now,
    hour27,
    { acc30min: 0, acc1hour: 2, acc1day: 2 },
    23500
);

// Case 3: Limits Test
// 30 Hours. Try using 4 Daily tickets.
// Should only apply 3 Daily. (3 * 12h = 36h).
// 30h is fully covered by 3 Daily (36h).
// Cost: 3 * 10,000 = 30,000.
const hour30 = new Date(now.getTime() + 30 * 60 * 60 * 1000);
runTest(
    "30시간 주차 (일일권 4장 시도 -> 3장 적용)",
    now,
    hour30,
    { acc30min: 0, acc1hour: 0, acc1day: 4 },
    30000,
    "일일권 초과"
);

// Case 4: Hourly Limit Test
// 5 Hours. Try using 5 Hourly tickets.
// Should only apply 2 Hourly. (2h).
// Remaining 3h: 3 * 1,500 = 4,500.
// Ticket Fee: 2 * 1,000 = 2,000.
// Total: 6,500.
const hour5 = new Date(now.getTime() + 5 * 60 * 60 * 1000);
runTest(
    "5시간 주차 (시간권 5장 시도 -> 2장 적용)",
    now,
    hour5,
    { acc30min: 0, acc1hour: 5, acc1day: 0 },
    6500,
    "시간권 초과"
);

console.log("\n[ 테스트 완료 ]");
