// Returns the correct move given player hand and dealer upcard
// Moves: "H" = Hit, "S" = Stand, "D" = Double, "SP" = Split

export function getCorrectMove(hand, dealerUpcard) {
    const playerValue = getHandValue(hand);
    const dealerValue = getCardValue(dealerUpcard.rank);
    const isPair = hand.length === 2 && hand[0].rank === hand[1].rank;
    const isSoft = hasSoftAce(hand);
  
    if (isPair) return getPairStrategy(hand[0].rank, dealerValue);
    if (isSoft) return getSoftStrategy(playerValue, dealerValue);
    return getHardStrategy(playerValue, dealerValue);
  }
  
  function hasSoftAce(hand) {
    let value = 0;
    let aces = 0;
    for (const card of hand) {
      value += getCardValue(card.rank);
      if (card.rank === "A") aces++;
    }
    return aces > 0 && value <= 21;
  }
  
  function getCardValue(rank) {
    if (["J", "Q", "K"].includes(rank)) return 10;
    if (rank === "A") return 11;
    return parseInt(rank);
  }
  
  function getHandValue(hand) {
    let value = 0;
    let aces = 0;
    for (const card of hand) {
      value += getCardValue(card.rank);
      if (card.rank === "A") aces++;
    }
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }
    return value;
  }
  
  function getHardStrategy(playerValue, dealerValue) {
    if (playerValue >= 17) return "S";
    if (playerValue >= 13 && dealerValue <= 6) return "S";
    if (playerValue === 12 && dealerValue >= 4 && dealerValue <= 6) return "S";
    if (playerValue === 11) return "D";
    if (playerValue === 10 && dealerValue <= 9) return "D";
    if (playerValue === 9 && dealerValue >= 3 && dealerValue <= 6) return "D";
    return "H";
  }
  
  function getSoftStrategy(playerValue, dealerValue) {
    if (playerValue >= 19) return "S";
    if (playerValue === 18 && dealerValue >= 9) return "H";
    if (playerValue === 18) return "S";
    if ((playerValue === 17 || playerValue === 18) && dealerValue >= 3 && dealerValue <= 6) return "D";
    if ((playerValue === 15 || playerValue === 16) && dealerValue >= 4 && dealerValue <= 6) return "D";
    if ((playerValue === 13 || playerValue === 14) && dealerValue >= 5 && dealerValue <= 6) return "D";
    return "H";
  }
  
  function getPairStrategy(rank, dealerValue) {
    if (rank === "A" || rank === "8") return "SP";
    if (rank === "10" || rank === "J" || rank === "Q" || rank === "K") return "S";
    if (rank === "9" && ![7, 10, 11].includes(dealerValue)) return "SP";
    if (rank === "7" && dealerValue <= 7) return "SP";
    if (rank === "6" && dealerValue <= 6) return "SP";
    if (rank === "4" && dealerValue >= 5 && dealerValue <= 6) return "SP";
    if (rank === "3" || rank === "2" && dealerValue <= 7) return "SP";
    return "H";
  }