export const suits = ["♠", "♥", "♦", "♣"];
export const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

export function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getCardValue(rank) {
  if (["J", "Q", "K"].includes(rank)) return 10;
  if (rank === "A") return 11;
  return parseInt(rank);
}

export function getHandValue(hand) {
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

export function isBust(hand) {
  return getHandValue(hand) > 21;
}

export function isBlackjack(hand) {
  return hand.length === 2 && getHandValue(hand) === 21;
}