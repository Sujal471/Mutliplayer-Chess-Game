const socket =io();

const chess=new Chess();
const boardElement=document.querySelector(".chessboard");
let draggedPiece=null;
let sourceSquare=null;
let playerRole=null;
const renderBoard =()=>{
    boardElement.innerText="";
    const board=chess.board();
    board.forEach((row,rowindex)=>{
        row.forEach((square,squareindex)=>{
           
            const squareElement=document.createElement("div");
            squareElement.innerHTML="";
            squareElement.classList.add(
                "square",(rowindex+squareindex)%2===0 ? "light" : "dark"
            );
            squareElement.dataset.row=rowindex;
            squareElement.dataset.col=squareindex;
            if(square){ 
                const pieceElement=document.createElement("div");
                pieceElement.innerText="";
                pieceElement.classList.add("piece",
                square.color==='w' ?"white" : "black"
                );
                pieceElement.innerText=getPieceUnicode(square);


                pieceElement.draggable=playerRole===square.color;
                pieceElement.addEventListener("dragstart",(e)=>{
                    if(pieceElement.draggable){
                        draggedPiece=pieceElement;
                        sourceSquare={row:rowindex,col:squareindex};
                        e.dataTransfer.setData("text/plain","");
                    }
                });
                pieceElement.addEventListener("dragged",(e)=>{
                    draggedPiece=null;
                    sourceSquare=null;
                });
                squareElement.appendChild(pieceElement);

            };
            squareElement.addEventListener("dragover",function(e){
                e.preventDefault();
            })
            squareElement.addEventListener("drop",function (e){
                e.preventDefault();
                if(draggedPiece){
                    const targetSource={
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };
                    handleMove(sourceSquare,targetSource);


                }

            })
           
            boardElement.appendChild(squareElement);

        });
     });
    if(playerRole==='b') boardElement.classList.add("flipped");
    else  boardElement.classList.remove("flipped");


};


const getPieceUnicode=(piece)=>{
    const unicodePieces={
        "r":"♖",
        "n":"♘",
        "b": "♗" ,
        "q" :"♕",
        "k":"♔",
        "p":"♙",



    


    };
    return unicodePieces[piece.type]||"";
}
const handleMove=(source,target)=>{
    const move={
        from: `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion:'q'
    };
    socket.emit("move",move);
}
let heading=document.querySelector(".st");
socket.on("playerRole",(role)=>{
    playerRole=role;
    
    if(role==="w") heading.innerText="White";
    else heading.innerText="Black";
   

    renderBoard();
});
socket.on("spectatorRole",()=>{
    heading.innerText="Spectator";
    playerRole=null;
    renderBoard();
});
socket.on("boardState",(fen)=>{
    chess.load(fen);
    renderBoard();
});
socket.on("move",(move)=>{
    chess.move(move);
    renderBoard();
});
socket.on("gameOver", (chessturn) => {
    if(chessturn==='b'){
       if(playerRole==="w") heading.innerText="Winner";
       else if(playerRole==="b") heading.innerText="Loser"
       else heading.innerText="White Wins";
    }
    else{
        if(playerRole==="w") heading.innerText="Loser";
        else if(playerRole==="b") heading.innerText="Winner"
        else heading.innerText="Black Wins";
     }


    }
   

    
);
renderBoard();





