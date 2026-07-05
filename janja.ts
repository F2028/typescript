function Random():string[] {
    const Suits:string[] = ["Hearts", "Diamonds", "Clubs", "Spades"];
    const Cards:string[] = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "Jack", "Queen", "King"];
    const randomSuit = Suits[Math.floor(Math.random() * Suits.length)]; 
    const randomsSuit = Suits[Math.floor(Math.random() * Suits.length)];
    const random = Cards[Math.floor(Math.random() * Cards.length)];
    const randoms = Cards[Math.floor(Math.random() * Cards.length)];            // Card[..ปรับให้เป็น integer // สุ่ม random * cards]
    
    return [randomSuit ,random, randomsSuit , randoms];
}
    
console.log(Random())
