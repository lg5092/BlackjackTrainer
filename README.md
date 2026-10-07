# AI-Integrated Blackjack Strategy Trainer

A simulated blackjack trainer that teaches beginners a basic, optimal strategy using AI-generated explanations.

##Features

- Complete blackjack game logic including hit, stand and split actions (currently implementing double down functions)
- Basic game engine that covers hard hands, soft hands and pair splitting
- Advice system that gives most ideal action suggestion
- Dealer logic that follows standard casino rules (hitting on soft 16, standing on soft 17)
- Responsive UI

## Tech Stack
- Next.js -- frameworks and API routes
- React/JavaScript -- game logic and user interface
- Tailwind CSS - styling
- Claude API -- AI explanations

## How It Functions
1. Press **Deal** to start a new hand
2. The Player cards and Dealer cards will be shown.
3. Press **Get Advice** to see the optimal move with an explanation from Claude about why
4. Play the Player hand to either Hit, Stand or Split
5. After each action, a new advice option is allowed given the cards currently shown. 
