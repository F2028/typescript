
function DrawCards() {
    const Suits: string[] = ["Hearts", "Diamonds", "Clubs", "Spades"];
    const Values: string[] = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "Jack", "Queen", "King"];
   
    const suit = Suits[Math.floor(Math.random() * Suits.length)];
    const value = Values[Math.floor(Math.random() * Values.length)];
    
    return {suit , value};
}
function calcuLateCardPoints(card: { suit: string; value: string }): number {
    if (card.value === "Ace") return 1;{
        if (card.value === "Jack" || card.value === "Queen" || card.value === "King") return 0;
    }
    return parseInt(card.value);
}
console.log(calcuLateCardPoints(DrawCards()));
