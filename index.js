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
        spectacorsWs: []
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
                        gm.spectacorsWs.push(ws);
                    }
                }
                sendState(ws);
            }
            if (message.type === 'turn') {
                ws._gameLink.game.makeTurn(message.data);
                sendState(ws._gameLink.player1Ws);
                sendState(ws._gameLink.player2Ws);
                ws._gameLink.spectacorsWs.forEach(sendState);
            }
        } catch (e) {
            //todo handling
        }
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});