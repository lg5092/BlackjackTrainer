"use client";
import { useState } from "react";
import { createDeck, shuffleDeck, getHandValue, isBust, isBlackjack } from "./lib/blackjack";
import { getCorrectMove } from "./lib/strategy";

export default function Home() {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameState, setGameState] = useState("idle"); // idle, playing, dealer, done
  const [message, setMessage] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [correctMove, setCorrectMove] = useState("");
  const [splitHand, setSplitHand] = useState([]);
  const [activeSplit, setActiveSplit] = useState(false);
  const [playingSplitHand, setPlayingSplitHand] = useState(false);

  function startGame() {
    const newDeck = shuffleDeck(createDeck());
    const playerCards = [newDeck[0], newDeck[2]];
    const dealerCards = [newDeck[1], newDeck[3]];
    const remaining = newDeck.slice(4);

    setDeck(remaining);
    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setGameState("playing");
    setMessage("");
    setExplanation("");
    setCorrectMove("");
    setSplitHand([]);
    setActiveSplit(false);
    setPlayingSplitHand(false);

    const move = getCorrectMove(playerCards, dealerCards[0]);
    setCorrectMove(move);

    if (isBlackjack(playerCards)) {
      setMessage("Blackjack! You win!");
      setGameState("done");
    }
  }

  async function fetchExplanation(hand, upcard, move) {
    setLoadingExplanation(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerHand: hand, dealerUpcard: upcard, correctMove: move })
      });
      const data = await res.json();
      setExplanation(data.explanation);
    } catch (e) {
      setExplanation("Could not load explanation.");
    }
    setLoadingExplanation(false);
  }

  function hit() {
    setExplanation("");
    const newCard = deck[0];
    const newDeck = deck.slice(1);

    if (activeSplit && playingSplitHand) {
      const newHand = [...splitHand, newCard];
      setSplitHand(newHand);
      setDeck(newDeck);
      if (isBust(newHand)) {
        setMessage("Bust on split hand! Dealer wins.");
        setGameState("done");
        return;
      }
      const move = getCorrectMove(newHand, dealerHand[0]);
      setCorrectMove(move);
    } else {
      const newHand = [...playerHand, newCard];
      setPlayerHand(newHand);
      setDeck(newDeck);
      if (isBust(newHand)) {
        if (activeSplit) {
          setMessage("Bust on first hand! Moving to split hand.");
          setPlayingSplitHand(true);
          const move = getCorrectMove(splitHand, dealerHand[0]);
          setCorrectMove(move);
        } else {
          setMessage("Bust! You lose.");
          setGameState("done");
        }
        return;
      }
      const move = getCorrectMove(newHand, dealerHand[0]);
      setCorrectMove(move);
    }
  }

  function stand() {
    if (activeSplit && !playingSplitHand) {
      standSplit();
      return;
    }

    let dealerCards = [...dealerHand];
    let remainingDeck = [...deck];

    while (getHandValue(dealerCards) < 17) {
      dealerCards.push(remainingDeck[0]);
      remainingDeck = remainingDeck.slice(1);
    }

    setDealerHand(dealerCards);
    setDeck(remainingDeck);

    const dealerValue = getHandValue(dealerCards);

    if (activeSplit) {
      const hand1Value = getHandValue(playerHand);
      const hand2Value = getHandValue(splitHand);
      const hand1Result = dealerValue > 21 || hand1Value > dealerValue ? "Win" : hand1Value === dealerValue ? "Push" : "Lose";
      const hand2Result = dealerValue > 21 || hand2Value > dealerValue ? "Win" : hand2Value === dealerValue ? "Push" : "Lose";
      setMessage(`Hand 1: ${hand1Result} | Hand 2: ${hand2Result}`);
    } else {
      const playerValue = getHandValue(playerHand);
      if (dealerValue > 21 || playerValue > dealerValue) {
        setMessage("You win!");
      } else if (playerValue === dealerValue) {
        setMessage("Push — it's a tie!");
      } else {
        setMessage("Dealer wins.");
      }
    }

    setGameState("done");
  }

  function split() {
    setExplanation("");
    const hand1 = [playerHand[0], deck[0]];
    const hand2 = [playerHand[1], deck[1]];
    const newDeck = deck.slice(2);

    setPlayerHand(hand1);
    setSplitHand(hand2);
    setDeck(newDeck);
    setActiveSplit(true);

    const move = getCorrectMove(hand1, dealerHand[0]);
    setCorrectMove(move);
  }

  function standSplit() {
    setExplanation("");
    setPlayingSplitHand(true);
    const move = getCorrectMove(splitHand, dealerHand[0]);
    setCorrectMove(move);
  }

  function renderCard(card) {
    const isRed = card.suit === "♥" || card.suit === "♦";
    return (
      <div key={card.rank + card.suit} className={`bg-white rounded-lg shadow-md w-16 h-24 flex flex-col items-center justify-center text-2xl font-bold ${isRed ? "text-red-600" : "text-gray-900"}`}>
        <div>{card.rank}</div>
        <div>{card.suit}</div>
      </div>
    );
  }

  const moveLabels = { H: "Hit", S: "Stand", D: "Double Down", SP: "Split" };

  return (
    <main className="min-h-screen bg-green-900 flex flex-col items-center justify-center p-8 gap-8">
      <h1 className="text-white text-4xl font-bold">Blackjack Trainer</h1>

      {/* Dealer Hand */}
      {dealerHand.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-green-200 text-sm uppercase tracking-wide">Dealer</p>
          <div className="flex gap-2">
            {dealerHand.map((card, i) =>
              gameState === "playing" && i === 1
                ? <div key="hidden" className="bg-blue-800 rounded-lg shadow-md w-16 h-24 flex items-center justify-center text-white text-2xl">?</div>
                : renderCard(card)
            )}
          </div>
        </div>
      )}

      {/* Player Hand(s) */}
      {playerHand.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-green-200 text-sm uppercase tracking-wide">
            {activeSplit ? (playingSplitHand ? "Hand 1 (done)" : "Hand 1 (active)") : `You — ${getHandValue(playerHand)}`}
          </p>
          <div className="flex gap-2">
            {playerHand.map(renderCard)}
          </div>
        </div>
      )}

      {/* Split Hand */}
      {activeSplit && splitHand.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-green-200 text-sm uppercase tracking-wide">
            {playingSplitHand ? `Hand 2 (active) — ${getHandValue(splitHand)}` : "Hand 2 (waiting)"}
          </p>
          <div className="flex gap-2 opacity-75">
            {splitHand.map(renderCard)}
          </div>
        </div>
      )}

      {/* AI Explanation */}
      {gameState === "playing" && (
        <div className="flex flex-col items-center gap-3">
          {!explanation && !loadingExplanation && (
            <button
              onClick={() => fetchExplanation(playerHand, dealerHand[0], correctMove)}
              className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-6 rounded-xl"
            >
              💡 Get Advice
            </button>
          )}
          {loadingExplanation && (
            <p className="text-green-200 text-sm">Thinking...</p>
          )}
          {explanation && (
            <div className="bg-green-800 rounded-xl p-4 max-w-md text-center">
              <p className="text-yellow-300 font-bold text-lg mb-2">
                Correct Move: {moveLabels[correctMove]}
              </p>
              <p className="text-green-100 text-sm">{explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Message */}
      {message && (
        <p className="text-yellow-300 text-2xl font-bold">{message}</p>
      )}

      {/* Buttons */}
      <div className="flex gap-4">
        {gameState === "idle" || gameState === "done" ? (
          <button onClick={startGame} className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-3 px-8 rounded-xl text-lg">
            {gameState === "done" ? "Play Again" : "Deal"}
          </button>
        ) : (
          <>
            <button onClick={hit} className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-6 rounded-xl">Hit</button>
            <button onClick={stand} className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-6 rounded-xl">Stand</button>
            {correctMove === "SP" && !activeSplit && (
              <button onClick={split} className="bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 px-6 rounded-xl">Split</button>
            )}
          </>
        )}
      </div>
    </main>
  );
}