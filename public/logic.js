var ws = new WebSocket('ws://'+window.location.hostname+':3001');
var tableId = document.querySelector('table').getAttribute('data-id');
ws.addEventListener('open', function(){
    ws.send(JSON.stringify({type:"ready", id:tableId}));
});

ws.onmessage = function(event){
    var data = JSON.parse(event.data);
    if (data.type === "desk"){
        clearingBeforeTurn(data);
    }
}

//The initial setup
//1,2,3 - types of whites 1 - orto, 2 - checker, 3 - king
//4,5,6 - types of blacks 4 - orto, 5 - checker, 6 - king
let table = document.getElementById('desk');
let isModeSelectionOfFigure = true;
let currentJumper = undefined;
let currentAvailableActions;
let desk = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 1, 1, 1, 1, 2, 2],
    [2, 2, 1, 1, 1, 1, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 5, 4, 4, 4, 4, 5, 5],
    [5, 5, 4, 4, 4, 4, 5, 5],
    [0, 0, 0, 0, 0, 0, 0, 0]
];
initialGenerateTable();


function initialGenerateTable() {
    for (let i = 0; i < desk.length; i++) {
        let trElem = document.createElement('tr');
        for (let j = 0; j < desk.length; j++) {
            let tdElem = document.createElement('td');
            tdElem.id = '' + i + j;
            tdElem.addEventListener('click', clickHandler);
            trElem.appendChild(tdElem);
        }
        table.appendChild(trElem);
    }
}

function renderDesk(desk, actions) {
    currentAvailableActions = actions;
    for (let i = 0; i < desk.length; i++) {
        for (let j = 0; j < desk.length; j++) {
            document.getElementById('' + i + j).setAttribute('data-val', desk[i][j]);
        }
    }
    for (let action of actions) {
        document.getElementById('' + action.x + action.y).classList.add(isModeSelectionOfFigure?'highlighted':'highlighted-w');
    }
}

function clickHandler(event) {
    const t = event.target,
        x = parseInt(t.id[0]),
        y = parseInt(t.id[1]);
    if (isModeSelectionOfFigure) {
        let selectedFig = currentAvailableActions.filter(e => (e.x === x && e.y === y));
        if (selectedFig[0]) {
            let elems = document.querySelectorAll('.highlighted-w');
            for (let i = 0; i < elems.length; i++) {
                elems[i].classList.remove('highlighted-w');
            }
            currentJumper = selectedFig[0];
            selectedFig[0].fields.forEach(c => {
                document.getElementById('' + c.x + c.y).classList.add('highlighted-w');
            })
        }
    }
    if (t.classList.contains('highlighted-w')) {
        ws.send(JSON.stringify({
            type: 'turn',
            data: {
                from: currentJumper,
                to: {x:x,y:y}
            }
        }));
    }
}

function clearingBeforeTurn(data) {
    var desk = data.desk;
    var actions = data.actions;
    currentJumper = undefined;
    isModeSelectionOfFigure = data.isModeSelectionOfFigure;
    let elems = document.querySelectorAll('.highlighted-w, .highlighted');
    for (let i = 0; i < elems.length; i++) {
        elems[i].classList.remove('highlighted-w');
        elems[i].classList.remove('highlighted');
    }
    renderDesk(desk, actions);
}


