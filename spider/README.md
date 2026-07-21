# One-Click Spider Solitaire

This is a free, web-based, no-ad version based on some of the same code as my One-click FreeCell. 

# What's New

* Version 1.8 - fix pwd bug and allow confetti
* Version 1.27 - use emoji that work on Android 4.4
* Version 1.24 - bug fix to kings don't stack on top of aces of the next suit
* Version 1.2 - allow the game to start from clicking the "deal" deck
* Version 1.1 - improve intelligence to prioritize same-suit stacking
* Version 1.0 - all is working - a real release

# To Do List

* Refactor for cleaner variable names, like !nmove should be canMove
* Functional coding for the dealing timing? Like slowly(deal())?
* Nicer looking css for buttons? Have buttons disappear when not relevant?

# Rules

*The goal of Spider Solitaire is to assemble 13 cards of a single suit in descending order (King to Ace) in the tableau. Once completed, the entire sequence is removed from the board. You win the game by successfully removing all eight suit sequences.
* The SetupThe Deck: Spider Solitaire uses two standard 52-card decks (104 cards total).
*The Tableau: 54 cards are dealt into 10 columns. The first four columns get 6 cards each, and the remaining six columns get 5 cards each. Only the very top card of each column is face up.
* The Stockpile: The remaining 50 cards are placed in a stack to the side to be used later.
* Basic GameplayBuilding Sequences: You can place any face-up card onto a card of the next-higher rank regardless of its suit (e.g., placing any 9 on any 10).Moving Stacks: You can move multiple cards at once as a "stack" or "run" only if they are already in sequential order and of the same suit. If the cards are alternating in suit, you can only move the single top card.
* Revealing Cards: Whenever you move a face-up card, the face-down card underneath it is turned face up, revealing new playable options.
* Empty Columns: If a column is completely emptied, you can move any single card or correctly sequenced stack of cards into that space.
* Dealing from the StockpileWhen you run out of moves or want to open up new opportunities, click the stockpile in the corner.This deals exactly 10 cards face up, placing one card onto the bottom of each of the 10 tableau columns.Note: You are only allowed to deal from the stockpile if all 10 tableau columns have at least one card in them. If a column is completely empty, you must fill it with a card or sequence before you can draw from the stock.