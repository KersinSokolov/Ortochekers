window.onload = function () {
    //The initial setup
    //1,2,3 - types of whites 1 - orto, 2 - checker, 3 - king
    //4,5,6 - types of blacks 4 - orto, 5 - checker, 6 - king
    let table = document.getElementById('desk');
    let isTurnWhite = true;
    let isStartedJuming = false;
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
    let testDesk = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [2, 2, 1, 0, 1, 1, 0, 2],
        [2, 2, 1, 1, 1, 0, 2, 2],
        [0, 0, 4, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 2, 0, 0, 3],
        [0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 3, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 3]
    ];
    //desk = testDesk;

    function isBlackCellPlayer(x, y) {
        return desk[x][y] > 3;
    }

    function isWhiteCellPlayer(x, y) {
        return (desk[x][y] < 4) && (desk[x][y] > 0);
    }

    function getJumpFieldsByCoords(x, y) {
        let possibleFieldsForJump = [];
        const type = desk[x][y];
        if (!type || (isTurnWhite && type > 3) || (!isTurnWhite && type < 4)) {
            return possibleFieldsForJump;
        }
        const isNextFieldWithEnemyFunction = (type < 4) ? isBlackCellPlayer : isWhiteCellPlayer;
        if (type !== 2 && type !== 5) { //orts
            if (desk[x - 2] && (desk[x - 2][y] === 0) && isNextFieldWithEnemyFunction(x - 1, y)) {
                possibleFieldsForJump.push({
                    x: x - 2,
                    y: y,
                    removingX: x - 1,
                    removingY: y
                });
            }
            if (desk[x + 2] && (desk[x + 2][y] === 0) && isNextFieldWithEnemyFunction(x + 1, y)) {
                possibleFieldsForJump.push({
                    x: x + 2,
                    y: y,
                    removingX: x + 1,
                    removingY: y
                });
            }
            if (desk[x] && (desk[x][y - 2] === 0) && isNextFieldWithEnemyFunction(x, y - 1)) {
                possibleFieldsForJump.push({
                    x: x,
                    y: y - 2,
                    removingX: x,
                    removingY: y - 1
                });
            }
            if (desk[x] && (desk[x][y + 2] === 0) && isNextFieldWithEnemyFunction(x, y + 1)) {
                possibleFieldsForJump.push({
                    x: x,
                    y: y + 2,
                    removingX: x,
                    removingY: y + 1
                });
            }
        }
        if (type !== 1 && type !== 4) { //diagonals
            if (desk[x - 2] && (desk[x - 2][y - 2] === 0) && isNextFieldWithEnemyFunction(x - 1, y - 1)) {
                possibleFieldsForJump.push({
                    x: x - 2,
                    y: y - 2,
                    removingX: x - 1,
                    removingY: y - 1
                });
            }
            if (desk[x + 2] && (desk[x + 2][y - 2] === 0) && isNextFieldWithEnemyFunction(x + 1, y - 1)) {
                possibleFieldsForJump.push({
                    x: x + 2,
                    y: y - 2,
                    removingX: x + 1,
                    removingY: y - 1
                });
            }
            if (desk[x - 2] && (desk[x - 2][y + 2] === 0) && isNextFieldWithEnemyFunction(x - 1, y + 1)) {
                possibleFieldsForJump.push({
                    x: x - 2,
                    y: y + 2,
                    removingX: x - 1,
                    removingY: y + 1
                });
            }
            if (desk[x + 2] && (desk[x + 2][y + 2] === 0) && isNextFieldWithEnemyFunction(x + 1, y + 1)) {
                possibleFieldsForJump.push({
                    x: x + 2,
                    y: y + 2,
                    removingX: x + 1,
                    removingY: y + 1
                });
            }
        }
        return possibleFieldsForJump;
    }

    function getWalkFieldsByCoords(x, y) {
        let possibleFieldsForWalk = [];
        const type = desk[x][y];
        if (!type || (isTurnWhite && type > 3) || (!isTurnWhite && type < 4)) {
            return possibleFieldsForWalk;
        }
        const newXDirectionByType = (type === 1 || type === 2) ? x + 1 : x - 1;

        if (type === 1 || type === 4) { //orts 1,4
            if (desk[x] && (desk[x][y - 1] === 0)) {
                possibleFieldsForWalk.push({
                    x: x,
                    y: y - 1
                });
            }
            if (desk[x] && (desk[x][y + 1] === 0)) {
                possibleFieldsForWalk.push({
                    x: x,
                    y: y + 1
                });
            }
            if (desk[newXDirectionByType] && (desk[newXDirectionByType][y] === 0)) {
                possibleFieldsForWalk.push({
                    x: newXDirectionByType,
                    y: y
                });
            }
        }
        if (type === 2 || type === 5) { //diagonals checker
            if (desk[newXDirectionByType] && (desk[newXDirectionByType][y - 1] === 0)) {
                possibleFieldsForWalk.push({
                    x: newXDirectionByType,
                    y: y - 1
                });
            }
            if (desk[newXDirectionByType] && (desk[newXDirectionByType][y + 1] === 0)) {
                possibleFieldsForWalk.push({
                    x: newXDirectionByType,
                    y: y + 1
                });
            }
        }
        if (type === 3 || type === 6) {
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    if (desk[x + i] && (desk[x + i][y + j] === 0)) {
                        possibleFieldsForWalk.push({
                            x: x + i,
                            y: y + j
                        });
                    }
                }
            }
        }
        return possibleFieldsForWalk;
    }

    function getActionsByActionType(isJump = true) {
        let players = [];
        const functionAction = isJump ? getJumpFieldsByCoords : getWalkFieldsByCoords;
        for (let i = 0; i < desk.length; i++) {
            for (let j = 0; j < desk[i].length; j++) {
                const actions = functionAction(i, j);
                if (actions.length) {
                    players.push({
                        x: i,
                        y: j,
                        fields: actions
                    })
                }
            }
        }
        return players;
    }

    function getAvailabelsActions() {
        if (isStartedJuming && currentJumper) {
            return getJumpFieldsByCoords(currentJumper.x, currentJumper.y);
        } else {
            let pp = getActionsByActionType();
            if (pp.length) {
                isStartedJuming = true;
                return pp;
            }
            isStartedJuming = false;
            return getActionsByActionType(false);
        }
    }

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
        renderDesk();
    }

    function renderDesk() {
        for (let i = 0; i < desk.length; i++) {
            for (let j = 0; j < desk.length; j++) {
                document.getElementById('' + i + j).setAttribute('data-val', desk[i][j]);
            }
        }
        currentAvailableActions = getAvailabelsActions();
        for (let action of currentAvailableActions) {
            document.getElementById('' + action.x + action.y).classList.add('highlighted');
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
            if (!isStartedJuming) {
                makeSimpleWalk(x, y);
            } else {
                makeJumpWalk(x, y);
            }
        }
    }

    function makeSimpleWalk(x, y) {
        const isAvailableCell = currentJumper.fields.some(e => (e.x == x && e.y == y));
        if (!isAvailableCell) {
            return;
        }
        const currentType = desk[currentJumper.x][currentJumper.y];
        desk[currentJumper.x][currentJumper.y] = 0;
        desk[x][y] = currentType;
        if (isTurnWhite && x === desk.length - 1) {
            desk[x][y] = 3;
        }
        if (!isTurnWhite && x === 0) {
            desk[x][y] = 6;
        }
        clearingBeforeTurn();
    }

    function makeJumpWalk(x, y) {
        const availableCell = currentJumper.fields.filter(e => (e.x == x && e.y == y));
        if (!availableCell.length) {
            return;
        }
        let cell = availableCell[0];
        desk[cell.removingX][cell.removingY] = -1;
        const currentType = desk[currentJumper.x][currentJumper.y];
        desk[currentJumper.x][currentJumper.y] = 0;
        desk[x][y] = currentType;
        if (isTurnWhite && x === desk.length - 1) {
            desk[x][y] = 3;
        }
        if (!isTurnWhite && x === 0) {
            desk[x][y] = 6;
        }
        let elems = document.querySelectorAll('.highlighted-w, .highlighted');
        for (let i = 0; i < elems.length; i++) {
            elems[i].classList.remove('highlighted-w');
            elems[i].classList.remove('highlighted');
        }
        currentJumper = {
            x: x,
            y: y,
            fields: getJumpFieldsByCoords(x, y)
        }
        if (!currentJumper.fields.length) {
            clearingBeforeTurn();
        } else {
            isModeSelectionOfFigure = false;
            currentJumper.fields.forEach(c => {
                document.getElementById('' + c.x + c.y).classList.add('highlighted-w');
            })
        }
        renderDesk();
    }

    function clearingBeforeTurn() {
        isTurnWhite = !isTurnWhite;
        isStartedJuming = false;
        currentJumper = undefined;
        isModeSelectionOfFigure = true;
        let elems = document.querySelectorAll('.highlighted-w, .highlighted');
        for (let i = 0; i < elems.length; i++) {
            elems[i].classList.remove('highlighted-w');
            elems[i].classList.remove('highlighted');
        }
        for (let i = 0; i < desk.length; i++) {
            for (let j = 0; j < desk[i].length; j++) {
                if (desk[i][j] === -1) {
                    desk[i][j] = 0;
                };
            }
        }
        renderDesk();
    }

    initialGenerateTable();
}