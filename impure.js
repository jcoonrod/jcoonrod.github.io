// impure functions pushed to the edge to handle dom
function getStack(cardId){ // return array from this card to top
	const parent=document.getElementById(cardId).parentElement;
	let stack=[];
	console.log("getStack",parent.id);
	const children=parent.children;
	let start=-1;
	let i=0;
	for (let child of children){ // run through them
		if(child.id==cardId) start=i;
		if(start>-1) stack.push(child.id);
		i++;
		console.log("getStack",i,stack);
	}
	return stack;
}
function dealCard(parentId,childId,y,content,color,clickable){ // create a new card with absolute offset string y
	let child=document.createElement("div");
	child.id=childId;
	child.classList="card "+color;
	child.style.position="absolute";
	child.style.width="100%";
	child.style.top=y+"vw";
	child.innerHTML=content;
	if(clickable) child.setAttribute("onclick","tryMove(this.id);");
	document.getElementById(parentId).appendChild(child);
}
function nchildren(destId) { // how many children in cascade j?
	const n=document.getElementById(destId).childElementCount;
	console.log("nchildren",destId,n);
	return n;
}
function getParent(childId){
	console.log("getParent",childId);
	return document.getElementById(childId).parentElement;
}
function getTopId(destId) {
	return document.getElementById(destId).lastElementChild.id;
}
function addCard(srcId,destId,y){
	console.log("addCard",srcId,destId,y);
	child=document.getElementById(srcId);
	child.style.top=y+"vw";
	document.getElementById(destId).append(child);
	return true;
}
function faceUp(cascadeId){
    if(nchildren(cascadeId)){
		child=document.getElementById(cascadeId).lastElementChild;
		console.log("faceUp",cascadeId,child.id);
        cardId=child.id.substring(1);
        child.setAttribute("onclick","tryMove(this.id);");
        child.innerHTML=createContent(cardId);
    }
}
function faceDn(cardId){
	card=document.getElementById(cardId);
	card.removeAttribute("onclick");
	card.innerHTML="<img src=/back.jpg>";
}
function resetCard(cardId,content){
	console.log("resetCard",cardId,content);
	document.getElementById("cardId").innerHTML=content;
}