const express = require('express');
const app = express();
const WebSocket = require('ws');
const Game = require('./coregame');
const serverWS = new WebSocket.Server({
    port: 3001
});
let games = {};

app.set('view engine', 'pug')
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.render('index', {
        games: Object.keys(games)
    });
});

app.get('/game', (req, res) => {
    const id = req.query.id;
    res.render('game', {
        title: 'Game',
        id: id
    });
});

app.get('/new', (req, res) => {
    const id = new Date().getTime();
    games[id] = {
        game: new Game(),
        player1Ws: undefined,
        player2Ws: undefined,
        spectatorsWs: []
    };
    res.redirect('/game?id='+id);
});  

serverWS.on('connection', ws => {
    ws.send(JSON.stringify({
        type: 'connected'
    }));
    ws.on('message', data => {
        try {
            message = JSON.parse(data);

            function broadcastData(data){
                const broadcastingData = JSON.stringify(data)
                ws._gameLink.player1Ws.send(broadcastingData);
                ws._gameLink.player2Ws.send(broadcastingData);
                ws._gameLink.spectatorsWs.forEach(w =>{
                    w.send(broadcastingData);
                })
            }

            function sendState(ws) {
                let state = ws._gameLink.game.getState();
                let stateToSend = {
                    type: "desk",
                    desk: state.desk,
                    actions: [],
                    isModeSelectionOfFigure: state.isModeSelectionOfFigure
                }
                if (state.isTurnWhite && (ws === ws._gameLink.player1Ws)) {
                    stateToSend.actions = state.actions;
                }
                if (!state.isTurnWhite && (ws === ws._gameLink.player2Ws)) {
                    stateToSend.actions = state.actions;
                }
                ws.send(JSON.stringify(stateToSend));
            }
            if (message.type === 'ready') {
                let gm = games[message.id];
                ws._gameLink = gm;
                if (!gm.player1Ws) {
                    gm.player1Ws = ws;
                } else {
                    if (!gm.player2Ws) {
                        gm.player2Ws = ws;
                    } else {
                        gm.spectatorsWs.push(ws);
                    }
                }
                sendState(ws);
            }
            if (message.type === 'turn') {
                ws._gameLink.game.makeTurn(message.data);
                sendState(ws._gameLink.player1Ws);
                sendState(ws._gameLink.player2Ws);
                ws._gameLink.spectatorsWs.forEach(sendState);
            }
            if (message.type === 'message'){
                let text = message.text;
                if (ws === ws._gameLink.player1Ws){
                    text = '(Player 1): ' + text;
                }else if (ws === ws._gameLink.player2Ws){
                    text = '(Player 2): ' + text;
                }else{
                    text = '(Spectator): ' + text;
                }
                broadcastData({
                    type: 'message',
                    text: text
                });
            }
        } catch (e) {
            //todo handling
        }
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});