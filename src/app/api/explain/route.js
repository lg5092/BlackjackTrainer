export async function POST(request) {
    const { playerHand, dealerUpcard, correctMove } = await request.json();
  
    const moveNames = {
      "H": "Hit",
      "S": "Stand",
      "D": "Double Down",
      "SP": "Split"
    };
  
    const prompt = `You are a blackjack coach teaching a beginner. 
    
  The player has: ${playerHand.map(c => c.rank + c.suit).join(", ")}
  The dealer is showing: ${dealerUpcard.rank + dealerUpcard.suit}
  The correct move is: ${moveNames[correctMove]}
  
  In 2-3 sentences, explain clearly and simply why ${moveNames[correctMove]} is the right move here. 
  Speak directly to the player. No fluff, just the reasoning.`;
  
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }]
      })
    });
  
    const data = await response.json();
    
    // Log the full response so we can see what's happening
    console.log("Anthropic API response:", JSON.stringify(data, null, 2));
  
    if (!response.ok || !data.content) {
      console.error("API error:", data);
      return Response.json({ explanation: "Could not load explanation." }, { status: 500 });
    }
  
    const explanation = data.content[0].text;
    return Response.json({ explanation });
  }