const ncards=52;
createCards();
shuffle();
deal();
function deal(){
    ndealt=0;
    for(i=0;i<7;i++){
        for (j=1;j<i+1;j++){
            appendCard(ndealt);
            ndealt++;
        }
    }
}
function appendCard(cardNo,j,up) { // add a card position i in the deck to the end of cascade j
	cascade=document.getElementById("c"+j);
	z=cascade.childElementCount;
    card=document.createElement("div");
    if(up) {card.innerHTML=cards[deck[cardNo]];
		flips[cardNo]=1;}
	else{card.innerHTML=back;flips[cardNo]=0;}
    card.id="v"+cardNo;
    card.classList.add("card");
    card.style.position='absolute';
    card.style.width='100%';
	y=(z-1)*5;
    card.style.top=y.toString()+"vw";
	if(up) card.setAttribute("onclick","tryMove(this);");
    cascade.appendChild(card);
}
