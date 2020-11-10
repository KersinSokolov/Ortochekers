const express = require('express');
const app = express();
const WebSocket = require('ws');
const Game = require('./coregame');
const serverWS = new WebSocket.Server({
    port:3001
});
//let games = {};
let players =  {};
let game = new Game();

app.set('view engine', 'pug')
app.use(express.static('public'));
/*app.get('/', (req, res)=>{
    res.render('index', {games});
});*/

app.get('/game', (req,res)=>{
    res.render('game', {title:'Game'});
});


app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

serverWS.on('connection', ws=>{
    ws.send(JSON.stringify({type:'connected'}));
    ws.on('message', data=>{
        try{
            message = JSON.parse(data);
            function sendState(){
                let state = game.getState();
                state.type ="desk";
                ws.send(JSON.stringify(state));
            }
            if (message.type === 'ready'){
                sendState();
            }
            if (message.type === 'turn'){
                game.makeTurn(message.data);
                sendState();
            }
        }catch(e){
            //todo handling
        }
    });
});
