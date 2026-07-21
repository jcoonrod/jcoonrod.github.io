## FreeCell based on SVG and Emoticons

This is a PWA version of Freecell, rewritten from a web version I wrote in 2001 and now rewritten consistent with what I hope are best practices in the 2019 web. 

The goal is to have a super-simple, super-light version.

I've written a Medium article going into some details of this at https://medium.com/@John.Coonrod/plain-vanilla-playing-cards-in-on-the-modern-web-18451cb54b5e

There are extra files in this repository not in the manifest - namely the svg files that I convert to png icons.

MANY thanks to jamesjohnson280 for his Medium Article "Hello World" which is an excellent tutorial on writing a PWA. I've tried other tutorials, but his actually worked for me.

ADDITIONAL thanks to kosamari for solving the problem of updating PWAs hosted on github: https://gist.github.com/kosamari/7c5d1e8449b2fbc97d372675f16b566e

The icon is based on the open source twemoji file for the crown emoji

## 2024 Update: v1.6 - prevent translation and search popups.

# Roadmap
0.2 - playable and described in medium.
0.3 - limit the automatic moves to Foundations
0.4 - establish full undo and ability to list the moves
0.5 - recreate the microsoft 32000 using the David Blau's http://solitairelaboratory.com/mshuffle.txt

# License
See GNU license in this folder

# The SetupThe Tableau: 
*One standard deck is dealt face-up into 8 columns. The first four columns have 7 cards each, and the last four have 6 cards.Free Cells: Four open spots in the top left corner used to temporarily hold single cards.Foundations: Four open spots in the top right corner where you build your Aces up to Kings by suit.Legal MovesTo the Foundations: Cards are moved here in ascending order, starting with the Ace of a suit up to the King (e.g., Ace of Spades, then 2 of Spades, etc.).On the Tableau: You can place any card on top of another card that is one rank higher and of the opposite color. (e.g., a Red 6 can only go on a Black 7).To the Free Cells: Any single card can be moved to any of the four Free Cells as a "parking spot" to get it out of the way. Any card can leave a Free Cell if it can be legally placed on a Foundation or column.Moving Sequences: You can move a sequential stack of cards at once, but the maximum number of cards you can move simultaneously is determined by the formula: (Number of Empty Free Cells) + 1.Empty Columns: If a Tableau column becomes completely empty, you can move any single card or valid stack of cards into that space.
