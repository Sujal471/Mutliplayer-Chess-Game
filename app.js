const express =require("express");
const socket=require("socket.io");
const http=require("http");
const { Chess }=require("chess.js");
const app=express();
//read
const server=http.createServer(app);
const io=socket(server);
const chess=new Chess();
let players={};
let currentPlayer="w";
app.set("view engine","ejs"); 
app.use(express.static("./public"));
app.get("/",(req,res)=>{
    res.render("index",{ title : "Multiplayer Chess Game"});

});
io.on("connection",(uniquesocket)=>{
   if(!players.white){
    players.white=uniquesocket.id;
    uniquesocket.emit("playerRole","w");
   }
   else if(!players.black){
    players.black=uniquesocket.id;
    uniquesocket.emit("playerRole","b");
   }
   else{
    uniquesocket.emit("spectatorRole");
   }
   uniquesocket.on("disconnect",()=>{
    if(uniquesocket.id===players.white){
        delete players.white;
    }
    else if(uniquesocket.id===players.black){
        delete players.black;
    }
   })

   uniquesocket.on("move",(move)=>{
    try{
        if(chess.turn()==="w"&&uniquesocket.id!==players.white) return;
        if(chess.turn()==="b"&&uniquesocket.id!==players.black) return;
        const result=chess.move(move);
        if(result){
            currentplayer=chess.turn();
            io.emit("move",move);
            io.emit('boardstate',chess.fen());
        }
        else{
            console.log("Invalid move : ",move);
            uniquesocket.emit("invalidMove",move);
        }
        if(chess.isGameOver()) io.emit("gameOver", chess.turn());
    } catch(err){
        console.log(err);
        uniquesocket.emit("invalidMove",move);
    };
})

});










const port=process.env.PORT || 3000;
server.listen(port,()=>{
    console.log("listening");
})
