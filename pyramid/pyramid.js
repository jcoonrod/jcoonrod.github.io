const ncards=52;
createCards();
shuffle();
deal();
function deal(){
    ndealt=0;
    for(i=0;i<7;i++){
        createRow(i); // create overlapping rows of cards
        for (j=0;j<i+1;j++){
            appendCard(ndealt,i,1); // add cards to the row
            ndealt++;
        }
    }
}
function createRow(i){ // create overlapping rows in the tableau
    const tableau=document.getElementById("tableau");
    console.log("createRow "+i);
    row=document.createElement("div");
    row.id="c"+i;
    row.style.position='absolute';
    row.style.width='100%';
	y=(i+1)*5;
    row.style.top=y.toString()+"vw";
    row.style.textAlign="center";
    tableau.appendChild(row);
}
function appendCard(cardNo,i,up) { // add a card to row i 
	row=document.getElementById("c"+i);
    card=document.createElement("div");
    if(up) {card.innerHTML=cards[deck[cardNo]];
		flips[cardNo]=1;}
	else{card.innerHTML=back;flips[cardNo]=0;}
    card.id="v"+cardNo;
    card.classList.add("card");
    card.style.width="12vw";
    card.style.display='inline-block';
	if(up) card.setAttribute("onclick","tryMove(this);");
    row.appendChild(card);
}
