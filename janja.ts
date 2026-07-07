//pure no side eff
function Cards() {
    const Ranks: string[] = ["Hearts", "Diamonds", "Clubs", "Spades"];
    const Values: string[] = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9","10", "Jack", "Queen", "King"];
   
    const rank = Ranks[Math.floor(Math.random() * Ranks.length)];
    const value = Values[Math.floor(Math.random() * Values.length)];    // make it int cuz random make it 0 - 1 include 0.? - 0.? * length(13)
    
    return {rank , value};
}

//pure no side eff
function drawCards(): { rank: string; value: string }[] {     
    const card1 = Cards();
    const card2 = Cards();
    return [card1, card2];
}

//pure no side eff
function calcuLateCard4Points(card: { rank: string; value: string }): number {      // it check only 1 card at time
    if (card.value === "Ace") return 1;
    if (card.value === "Jack" || card.value === "Queen" || card.value === "King" || card.value === "10") return 0;
    
    return parseInt(card.value);
}   

//pure no side eff
function calculate4Pok(cards: { rank: string; value: string }[]): number {
    const total = cards.reduce((sum, card) => sum + calcuLateCard4Points(card), 0);     //reduce loop (card)times => sum + ?? (1) sum + ?? (2)
    return total % 10;                                                                  // in here card = 2 so loop 2 times 
}

//pure no side eff
function pokMai() {                 // check if it pok or nah
    const cards = drawCards();          // card = random cards
    const score = calculate4Pok(cards);     //score = calculated(card)
   if (score === 8 || score === 9) {
    return  `You got Pok ${score}!!  `;
   } else {
    return ` ${score} points ` ;
   }
}

//pure no side eff
function pokMai2(score: number):boolean {       // mys
    return score === 8 || score === 9;
}
//pure no side eff
function drawthirdcards():string {              // if points below 4 draw third cards
        let draw = drawCards();
        let score = calculate4Pok(draw);

        if (pokMai2(score)) {
            return `You got Pok ${score}!  `;  
        }
        if (score <= 5) {
            const firstpoint = calcuLateCard4Points(draw[0]);
            const secondpoint = calcuLateCard4Points(draw[1]);
            const thirdcard = Cards();
            draw = [...draw, thirdcard];
            const thirdpoints = calcuLateCard4Points(thirdcard);
            const final = calculate4Pok(draw);
            return `first card = ${firstpoint} + second = ${secondpoint} + third = ${thirdpoints} = ${final} points`;
        }
     return `Your score is ${score} points`;
}
console.log(drawthirdcards());
