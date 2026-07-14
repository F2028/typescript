
const START_MAX_LIFE: number = 15;
const BOSS_LIFE: number = 30;
const BOSS_MAX_LIFE: number = 30;
const PLAYER_MAX_LIFE_AFTER_BOSS: number = 20;
const POINT_PER_LIFE: number = 100;
const START_POINTS: number = 500;
const POINT_PER_STOLEN_LIFE = 50;

const LIFE_PRICE: number = 300;
const GEAR_PRICE: number = 800;
const KNIFE_PRICE: number = 900;
const ANGEL_PRICE: number = 500;
const ITEM_USES: number = 3;

//pure no side eff
function symbolList(): string[] {
    return ["น้ำเต้า", "ปู", "ปลา", "กุ้ง", "ไก่", "เสือ"];
}

//impure cuz random
function randomSymbol(): string {
    const symbols = symbolList();
    return symbols[Math.floor(Math.random() * symbols.length)];
}

//impure cuz random 3 times
function rollThree(): string[] {
    const first = randomSymbol();
    const second = randomSymbol();
    const third = randomSymbol();
    return [first, second, third];
}

//pure no side eff
function countMatch(outcome: string[], betSymbol: string): number {
    let count = 0;
    for (let i = 0; i < outcome.length; i++) {
        if (outcome[i] === betSymbol) count = count + 1;
    }
    return count;
}

//pure no side eff
function isValidSymbol(symbol: string): boolean {
    return symbolList().indexOf(symbol) !== -1;
}

//pure no side eff
function isValidBet(amount: number, life: number): boolean {
    return amount >= 1 && amount <= life;
}

//pure no side eff win take life if it maxed x2 points
//pure no side eff
function transferLife(
    winner: { life: number; points: number },
    loser: { life: number; points: number },
    actualLoss: number,
    winnerMaxLife: number
): { winner: { life: number; points: number }; loser: { life: number; points: number } } {

    const room = winnerMaxLife - winner.life;

    let newWinnerLife = winner.life;

    // ได้ 50 point ทุก 1 life ที่ขโมย
    let newWinnerPoints = winner.points + (actualLoss * POINT_PER_STOLEN_LIFE);

    if (actualLoss <= room) {
        newWinnerLife += actualLoss;
    } else {
        newWinnerLife = winnerMaxLife;

        // life ที่ล้น เปลี่ยนเป็น point โบนัส
        const overflow = actualLoss - room;
        newWinnerPoints += overflow * POINT_PER_LIFE * 2;
    }

    const newLoserLife = loser.life - actualLoss;

    return {
        winner: { life: newWinnerLife,points: newWinnerPoints
        },
        loser: {life: newLoserLife, points: loser.points}
    };
}

//pure no side eff
function totalScore(player: { life: number; points: number }): number {
    return player.life * POINT_PER_LIFE + player.points;
}

// player type

//pure no side eff
function newPlayer(): { life: number; points: number; gearUses: number; knifeUses: number; hasAngel: boolean; maxLife: number; winStreak: number; totalWins: number } {
    return { life: START_MAX_LIFE, points: START_POINTS, gearUses: 0, knifeUses: 0, hasAngel: false, maxLife: START_MAX_LIFE, winStreak: 0, totalWins: 0 };
}

//pure no side eff
function newDealer(): { life: number; points: number; maxLife: number; isBoss: boolean } {
    return { life: START_MAX_LIFE, points: 0, maxLife: START_MAX_LIFE, isBoss: false };
}

//pure no side eff
function newPurchases(): { life: number; gear: number; knife: number; angel: number } {
    return { life: 0, gear: 0, knife: 0, angel: 0 };
}

//pure no side eff
function summaryText(roundsPlayed: number, purchases: { life: number; gear: number; knife: number; angel: number }, outcomeLabel: string): string {
    return `\n===== สรุปเกม =====
ผลลัพธ์: ${outcomeLabel}
เล่นไปทั้งหมด: ${roundsPlayed} รอบ
ของที่ซื้อ: life x${purchases.life}, protection gear x${purchases.gear}, knife x${purchases.knife}, angel card x${purchases.angel}
====================`;
}

//pure bonus

//pure no side eff win 3 times a row take bonus
function calcStreakBonus(points: number, winStreak: number): { bonusPoints: number; triggered: boolean } {
    if (winStreak > 0 && winStreak % 3 === 0) {
        const bonusPoints = Math.ceil(points * 0.1);
        return { bonusPoints, triggered: true };
    }
    return { bonusPoints: 0, triggered: false };
}

// shop fn

//pure no side eff win 2 times increas price shop 10%
function calcPriceMultiplier(totalWins: number): number {
    const level = Math.floor(totalWins / 2);
    return 1 + level * 0.1;
}

//pure no side eff
function getPrice(basePrice: number, multiplier: number): number {
    return Math.ceil(basePrice * multiplier);
}

// boss round

//pure no side eff tran to boss
function shouldTriggerBoss(dealerLife: number, isBoss: boolean): boolean {
    return !isBoss && dealerLife <= 1;
}

//pure no side eff
function transformToBoss(
    dealer: { life: number; points: number; maxLife: number; isBoss: boolean },
    player: { life: number; points: number; gearUses: number; knifeUses: number; hasAngel: boolean; maxLife: number; winStreak: number; totalWins: number }
): { dealer: typeof dealer; player: typeof player } {
    const newDealer = { ...dealer, life: BOSS_LIFE, maxLife: BOSS_MAX_LIFE, isBoss: true };
    const newPlayerState = { ...player, maxLife: PLAYER_MAX_LIFE_AFTER_BOSS };
    return { dealer: newDealer, player: newPlayerState };
}

//pure no side eff damage less than 4 regen
function bossRegen(dealerLife: number, dealerMaxLife: number, damageDealt: number): number {
    if (damageDealt < 4) {
        return Math.min(dealerLife + 1, dealerMaxLife);
    }
    return dealerLife;
}

// shop

//pure no side eff
function buyLife(
    player: { life: number; points: number; gearUses: number; knifeUses: number; hasAngel: boolean; maxLife: number; winStreak: number; totalWins: number },
    priceMultiplier: number
): { player: typeof player; message: string; success: boolean } {
    const price = getPrice(LIFE_PRICE, priceMultiplier);
    if (player.points < price) return { player, message: `point ไม่พอซื้อ life (ราคา ${price})`, success: false };
    if (player.life >= player.maxLife) return { player, message: "life เต็มเเล้ว ซื้อเพิ่มไม่ได้", success: false };
    const updated = { ...player, life: player.life + 1, points: player.points - price };
    return { player: updated, message: `ซื้อ life สำเร็จ (+1 life, -${price} point)`, success: true };
}

//pure no side eff
function buyGear(
    player: { life: number; points: number; gearUses: number; knifeUses: number; hasAngel: boolean; maxLife: number; winStreak: number; totalWins: number },
    priceMultiplier: number
): { player: typeof player; message: string; success: boolean } {
    const price = getPrice(GEAR_PRICE, priceMultiplier);
    if (player.points < price) return { player, message: `point ไม่พอซื้อ protection gear (ราคา ${price})`, success: false };
    if (player.gearUses > 0) return { player, message: "ยังมี gear เหลืออยู่ ใช้ให้หมดก่อนค่อยซื้อใหม่", success: false };
    const updated = { ...player, gearUses: ITEM_USES, points: player.points - price };
    return { player: updated, message: `ซื้อ protection gear สำเร็จ (ใช้ได้ ${ITEM_USES} ครั้ง, -${price} point)`, success: true };
}

//pure no side eff
function buyKnife(
    player: { life: number; points: number; gearUses: number; knifeUses: number; hasAngel: boolean; maxLife: number; winStreak: number; totalWins: number },
    priceMultiplier: number
): { player: typeof player; message: string; success: boolean } {
    const price = getPrice(KNIFE_PRICE, priceMultiplier);
    if (player.points < price) return { player, message: `point ไม่พอซื้อ knife (ราคา ${price})`, success: false };
    if (player.knifeUses > 0) return { player, message: "ยังมี knife เหลืออยู่ ใช้ให้หมดก่อนค่อยซื้อใหม่", success: false };
    const updated = { ...player, knifeUses: ITEM_USES, points: player.points - price };
    return { player: updated, message: `ซื้อ knife สำเร็จ (ใช้ได้ ${ITEM_USES} ครั้ง, -${price} point)`, success: true };
}

//pure no side eff
function buyAngel(
    player: { life: number; points: number; gearUses: number; knifeUses: number; hasAngel: boolean; maxLife: number; winStreak: number; totalWins: number },
    priceMultiplier: number
): { player: typeof player; message: string; success: boolean } {
    const price = getPrice(ANGEL_PRICE, priceMultiplier);
    if (player.points < price) return { player, message: `point ไม่พอซื้อ angel card (ราคา ${price})`, success: false };
    if (player.hasAngel) return { player, message: "มี angel card อยู่เเล้ว ใช้ก่อนค่อยซื้อใหม่", success: false };
    const updated = { ...player, hasAngel: true, points: player.points - price };
    return { player: updated, message: `ซื้อ angel card สำเร็จ (-${price} point)`, success: true };
}

// item eff agnel 1 use knife 3 uses protection gear 3 uses
//pure no side eff recive less damage 50%
function applyGearReduction(loss: number, gearUses: number): { newLoss: number; usesLeft: number } {
    if (gearUses <= 0) return { newLoss: loss, usesLeft: gearUses };
    const reduced = Math.ceil(loss / 2);
    return { newLoss: reduced, usesLeft: gearUses - 1 };
}

//pure no side eff deal more damage 50%
function applyKnifeBoost(damage: number, knifeUses: number): { newDamage: number; usesLeft: number } {
    if (knifeUses <= 0) return { newDamage: damage, usesLeft: knifeUses };
    const boosted = Math.ceil(damage * 1.5);
    return { newDamage: boosted, usesLeft: knifeUses - 1 };
}

//pure no side eff
function resultMessage(betSymbol: string, outcome: string[], matchCount: number, winnerName: string, actualLoss: number, note: string): string {
    const outcomeText = outcome.join(", ");
    return `แทง ${betSymbol} | ออก: ${outcomeText} | ตรง ${matchCount} ตัว | ${winnerName} ชนะ ปล้น life ไป ${actualLoss}${note}`;
}

//impure
function playRound(
    player: { life: number; points: number; gearUses: number; knifeUses: number; hasAngel: boolean; maxLife: number; winStreak: number; totalWins: number },
    dealer: { life: number; points: number; maxLife: number; isBoss: boolean },
    betSymbol: string,
    betAmount: number
): { player: typeof player; dealer: typeof dealer; message: string } {
    const outcome = rollThree();
    const matchCount = countMatch(outcome, betSymbol);
    const dealerLabel = dealer.isBoss ? "Boss" : "Dealer";

    if (matchCount > 0) {
        // player ชนะ knife + damage
        const baseDamage = Math.min(betAmount, dealer.life);
        const boost = applyKnifeBoost(baseDamage, player.knifeUses);
        const finalDamage = Math.min(boost.newDamage, dealer.life);

        const transferred = transferLife(player, dealer, finalDamage, player.maxLife);
        let newPlayerLife = transferred.winner.life;
        let newPlayerPoints = transferred.winner.points;
        let newDealerLife = transferred.loser.life;
        let newMaxLife = player.maxLife;

        const newWinStreak = player.winStreak + 1;
        const newTotalWins = player.totalWins + 1;

        let note = "";
        if (boost.usesLeft !== player.knifeUses) note += ` (knife boost! เหลือใช้ได้อีก ${boost.usesLeft} ครั้ง)`;

        const streakResult = calcStreakBonus(newPlayerPoints, newWinStreak);
        if (streakResult.triggered) {
            newPlayerPoints = newPlayerPoints + streakResult.bonusPoints;
            note += ` (streak ${newWinStreak} ชนะติด! bonus +${streakResult.bonusPoints} point)`;
        }

        let newDealer = { ...dealer, life: newDealerLife };

        // boss regen dmg less than 4
        if (dealer.isBoss) {
            const regenLife = bossRegen(newDealerLife, dealer.maxLife, finalDamage);
            if (regenLife !== newDealerLife) {
                note += ` (Boss regen! ฟื้น hp คืน 1 เพราะโดน damage เเค่ ${finalDamage})`;
                newDealer = { ...newDealer, life: regenLife };
            }
        } else if (shouldTriggerBoss(newDealerLife, dealer.isBoss)) {
            const transformed = transformToBoss(newDealer, { ...player, maxLife: newMaxLife });
            newDealer = transformed.dealer;
            newMaxLife = transformed.player.maxLife;
            note += ` !! Dealer เหลือ hp 1 เเล้วกลายร่างเป็น BOSS (hp ${BOSS_LIFE})! player max life เพิ่มเป็น ${PLAYER_MAX_LIFE_AFTER_BOSS} !!`;
        }

        const message = resultMessage(betSymbol, outcome, matchCount, "Player", finalDamage, note) + ` (vs ${dealerLabel})`;

        const updatedPlayer = {
            ...player,
            life: newPlayerLife,
            points: newPlayerPoints,
            knifeUses: boost.usesLeft,
            maxLife: newMaxLife,
            winStreak: newWinStreak,
            totalWins: newTotalWins,
        };
        return { player: updatedPlayer, dealer: newDealer, message };
    } else {
        // dealer/boss ชนะ -> เช็ค angel card ก่อน ไม่งั้นเช็ค gear
        if (player.hasAngel) {
            const updatedPlayer = { ...player, hasAngel: false, winStreak: 0 };
            const message = `แทง ${betSymbol} | ออก: ${outcome.join(", ")} | ตรง 0 ตัว | ${dealerLabel} ชนะเเต่ angel card ปกป้อง player ไว้! ไม่เสีย life`;
            return { player: updatedPlayer, dealer, message };
        }

        const baseLoss = Math.min(betAmount, player.life);
        const reduction = applyGearReduction(baseLoss, player.gearUses);

        const result = transferLife(dealer, player, reduction.newLoss, dealer.maxLife);
        const note = reduction.usesLeft !== player.gearUses ? ` (gear ลด damage เหลือ ${reduction.newLoss}! เหลือใช้ได้อีก ${reduction.usesLeft} ครั้ง)` : "";
        const message = resultMessage(betSymbol, outcome, matchCount, dealerLabel, reduction.newLoss, note);

        const updatedPlayer = {
            ...player,
            life: result.loser.life,
            points: result.loser.points,
            gearUses: reduction.usesLeft,
            winStreak: 0,
        };
        const updatedDealer = { ...dealer, life: result.winner.life, points: result.winner.points };
        return { player: updatedPlayer, dealer: updatedDealer, message };
    }
}

//pure no side eff
function shopMenuText(
    player: { life: number; points: number; gearUses: number; knifeUses: number; hasAngel: boolean; maxLife: number; winStreak: number; totalWins: number },
    priceMultiplier: number
): string {
    const lifePrice = getPrice(LIFE_PRICE, priceMultiplier);
    const gearPrice = getPrice(GEAR_PRICE, priceMultiplier);
    const knifePrice = getPrice(KNIFE_PRICE, priceMultiplier);
    const angelPrice = getPrice(ANGEL_PRICE, priceMultiplier);

    return `\n--- ร้านค้า (point: ${player.points}, ราคาคูณ x${priceMultiplier.toFixed(1)} จากชนะสะสม ${player.totalWins} ครั้ง) ---
1. life          ${lifePrice} point  (life: ${player.life}/${player.maxLife})
2. protection gear  ${gearPrice} point  (มีอยู่: ${player.gearUses} ใช้)
3. knife         ${knifePrice} point  (มีอยู่: ${player.knifeUses} ใช้)
4. angel card    ${angelPrice} point  (มีอยู่: ${player.hasAngel ? "1" : "0"})
0. ออกจากร้าน (พิมพ์ exit ได้ตลอดเพื่อออกจากเกมทันที)`;
}

//impure input from user
function shopLoop(
    player: { life: number; points: number; gearUses: number; knifeUses: number; hasAngel: boolean; maxLife: number; winStreak: number; totalWins: number },
    purchases: { life: number; gear: number; knife: number; angel: number }
): { player: typeof player; purchases: typeof purchases; exited: boolean } {
    let current = player;
    let currentPurchases = purchases;

    while (true) {
        const priceMultiplier = calcPriceMultiplier(current.totalWins);
        console.log(shopMenuText(current, priceMultiplier));
        const choice = (prompt("เลือกซื้อ (0-4): ") ?? "").trim();

        if (choice.toLowerCase() === "exit") return { player: current, purchases: currentPurchases, exited: true };
        if (choice === "0") return { player: current, purchases: currentPurchases, exited: false };

        if (choice === "1") {
            const result = buyLife(current, priceMultiplier);
            console.log(result.message);
            current = result.player;
            if (result.success) currentPurchases = { ...currentPurchases, life: currentPurchases.life + 1 };
        } else if (choice === "2") {
            const result = buyGear(current, priceMultiplier);
            console.log(result.message);
            current = result.player;
            if (result.success) currentPurchases = { ...currentPurchases, gear: currentPurchases.gear + 1 };
        } else if (choice === "3") {
            const result = buyKnife(current, priceMultiplier);
            console.log(result.message);
            current = result.player;
            if (result.success) currentPurchases = { ...currentPurchases, knife: currentPurchases.knife + 1 };
        } else if (choice === "4") {
            const result = buyAngel(current, priceMultiplier);
            console.log(result.message);
            current = result.player;
            if (result.success) currentPurchases = { ...currentPurchases, angel: currentPurchases.angel + 1 };
        } else {
            console.log("เลือกไม่ถูกต้อง");
        }
    }
}

//impure input from user
function playDaGame(): void {
    let player = newPlayer();
    let dealer = newDealer();
    let purchases = newPurchases();
    let round = 1;
    let exited = false;

    console.log(`สัญลักษณ์ที่เลือกได้: ${symbolList().join(", ")}`);
    console.log(`เริ่มเกมด้วย ${START_POINTS} point (พิมพ์ exit ได้ตลอดเพื่อออกจากเกม)`);

    while (player.life > 0 && dealer.life > 0) {
        const dealerLabel = dealer.isBoss ? "BOSS" : "Dealer";
        console.log(`\n--- Round ${round} ---`);
        console.log(`Player life: ${player.life}/${player.maxLife} | points: ${player.points} | score: ${totalScore(player)} | gear: ${player.gearUses} | knife: ${player.knifeUses} | angel: ${player.hasAngel ? "yes" : "no"} | winStreak: ${player.winStreak} | totalWins: ${player.totalWins}`);
        console.log(`${dealerLabel} life: ${dealer.life}/${dealer.maxLife} | points: ${dealer.points} | score: ${totalScore(dealer)}`);

        const goShop = (prompt("เข้าร้านค้าไหม (y/n): ") ?? "").trim();
        if (goShop.toLowerCase() === "exit") {
            exited = true;
            break;
        }
        if (goShop.toLowerCase() === "y") {
            const shopResult = shopLoop(player, purchases);
            player = shopResult.player;
            purchases = shopResult.purchases;
            if (shopResult.exited) {
                exited = true;
                break;
            }
        }

        const betSymbol = (prompt("เลือกสัญลักษณ์ที่จะเเทง: ") ?? "").trim();
        if (betSymbol.toLowerCase() === "exit") {
            exited = true;
            break;
        }
        if (!isValidSymbol(betSymbol)) {
            console.log("สัญลักษณ์ไม่ถูกต้อง ลองใหม่");
            continue;
        }

        const betAnswer = (prompt(`เดิมพันเท่าไหร่ (1 - ${player.life}): `) ?? "").trim();
        if (betAnswer.toLowerCase() === "exit") {
            exited = true;
            break;
        }
        const betAmount = parseInt(betAnswer);
        if (isNaN(betAmount) || !isValidBet(betAmount, player.life)) {
            console.log("จำนวนเดิมพันไม่ถูกต้อง ลองใหม่");
            continue;
        }

        const result = playRound(player, dealer, betSymbol, betAmount);
        console.log(result.message);

        player = result.player;
        dealer = result.dealer;
        round = round + 1;
    }

    const roundsPlayed = round - 1;
    let outcomeLabel: string;
    if (exited) outcomeLabel = "ออกจากเกมกลางคัน";
    else if (player.life <= 0) outcomeLabel = "Dealer/Boss wins the game!";
    else outcomeLabel = "Player wins the game!";

    console.log(summaryText(roundsPlayed, purchases, outcomeLabel));
}

playDaGame();
