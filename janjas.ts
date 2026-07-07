//impure cuz random
function Cards() {
    const Ranks: string[] = ["Hearts", "Diamonds", "Clubs", "Spades"];
    const Values: string[] = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9","10", "Jack", "Queen", "King"];
   
    const rank = Ranks[Math.floor(Math.random() * Ranks.length)];
    const value = Values[Math.floor(Math.random() * Values.length)];    // make it int cuz random make it 0 - 1 include 0.? - 0.? * length(13)
    
    return {rank , value};
}

//impure
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
function pokMai2(score: number):boolean {       // check score = 8 or 9?
    return score === 8 || score === 9;
}

//impure
function play(): { rank: string; value: string }[] {
    let hand = drawCards();
    let score = calculate4Pok(hand);

    if (pokMai2(score)) return hand;        //if pok return with card(hand)
    if (score <= 5) {                       // <= 5 draw third cards
        const thirdCard = Cards();
        hand = [...hand, thirdCard];        // เอาค่าarray hand มากระจายเเล้วadd thircard เข้าไป
    }
    return hand
}

//pure no side eff
function pairMai(card:{ rank: string; value: string }[]):boolean {    // check value if it the same
    return  card[0].value === card[1].value ; 
}

//pure no side eff
function checkPair2 (card:{ rank: string; value: string }[]):boolean {      // check rank if it the same
    return  card[0].rank === card[1].rank ; 
}

//pure no side eff
function doubleOrTriple(cards:{ rank: string; value: string }[]):string{        // double pair or triple pair
    const firstpair = pairMai(cards);
    const secondpair = checkPair2(cards);

    if(firstpair && secondpair) return "Here comes the money!! u got Triple pair!!";
    if (firstpair || secondpair) return "You got pair!!";
    return "No pair found.";
}

//pure no side eff
function tripleMai(cards:{rank:string,value:string}[]):boolean{                     // check if it triple
    if (cards.length !== 3) return false;
    return cards[0].value === cards[1].value && cards[1].value === cards[2].value;
}


//pure no side eff
function takeCardOrder(values:string):number{                                   
    const order = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9","10", "Jack", "Queen", "King"];
    return order.indexOf(values);
}

//pure no side eff
function strainghtMai(cards:{ rank: string; value: string }[]):boolean{
    if (cards.length !== 3) return false;                            // Check if there are exactly 3 cards
     
    const order = cards.map(card => takeCardOrder(card.value));
    const sort = [...order].sort((a, b) => a - b);
    
    return sort[1] === sort[0] + 1 && sort[2] === sort[1] + 1;       // Check if the sorted values are real
}

//pure no side eff
function strainghtMessage(cards:{ rank: string; value: string }[]):string{          //log message if it straight or nah uses strainghtMai function
    const values = cards.map(card => card.value).join(", ");
    if (strainghtMai(cards)) {
        return `You got a straight with cards: ${values}`;
    }
    return `No straight found your cards value : ${values}`;
}  

//pure no side eff
function compare(playerHand:{rank:string , value:string}[],dealerHand:{rank:string , value:string}[]): string {         // player vs dealer
     const playerscore = calculate4Pok(playerHand);             // need to calculate score first then compare
     const dealerScore = calculate4Pok(dealerHand);
   
   
    if (playerscore > dealerScore) return "Player wins";
    if (playerscore < dealerScore) return "Dealer wins";
    return "Draw";
}


//pure
function summary(hand: {rank:string , value:string}[]):string {                     // all thing in the world ends here
        const score = calculate4Pok(hand)
        const pok = pokMai2(score) ? `pok with ${score}!! ` : `${score} points`;
        const triple = tripleMai(hand) ? `u got triple!! with ${hand}` : "";
        const double = doubleOrTriple(hand);
        const strainght = hand.length === 3 ? strainghtMessage(hand) : "";

         return `${triple} ${pok} | ${double} ${strainght}`;
}


function playDaGame():string{                       // the fun begins
        const playerHand = play();
        const dealerHand = play()

        const playerSummary = summary(playerHand);
        const dealerSummary = summary(dealerHand);
        const result = compare(playerHand, dealerHand);

        return `Player: ${playerSummary}\nDealer: ${dealerSummary}\nResult: ${result}`;
}



console.log(playDaGame());