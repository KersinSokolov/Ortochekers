class Game{

    constructor (){
         //initial state
        this.desk = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [2, 2, 1, 1, 1, 1, 2, 2],
            [2, 2, 1, 1, 1, 1, 2, 2],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [5, 5, 4, 4, 4, 4, 5, 5],
            [5, 5, 4, 4, 4, 4, 5, 5],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];
        this.isStartedJumping = false;
        this.isTurnWhite = true;
        this.isStartedJumping = false;
        this.isModeSelectionOfFigure = true;
        this.currentJumper = undefined;
        this.getJumpFieldsByCoords = this.getJumpFieldsByCoords.bind(this);
        this.getWalkFieldsByCoords = this.getWalkFieldsByCoords.bind(this);
        this.makeTurn = this.makeTurn.bind(this);
    }

    _killFigureTurn(turn, cell){
        this.desk[cell.removingX][cell.removingY] = -1 * this.desk[cell.removingX][cell.removingY] ;
        const currentType = this.desk[turn.from.x][turn.from.y];
        this.desk[turn.from.x][turn.from.y] = 0;
        this.desk[turn.to.x][turn.to.y] = currentType;
        if (this.isTurnWhite && turn.to.x === this.desk.length - 1) {
            this.desk[turn.to.x][turn.to.y] = 3;
        }
        if (!this.isTurnWhite && turn.to.x === 0) {
            this.desk[turn.to.x][turn.to.y] = 6;
        }
        this.currentJumper = turn.to;
        const newTurns = this.getAvailabelsActions();
        if (!this.isStartedJumping){
            this.isTurnWhite = !this.isTurnWhite;
            for(let i=0; i<this.desk.length; i++){
                for (let j=0; j<this.desk[i].length; j++){
                    if (this.desk[i][j] < 0){
                        this.desk[i][j] = 0;
                    }
                }
            }
            this.currentJumper = undefined;
            this.isModeSelectionOfFigure = true;
        }else{
            this.isModeSelectionOfFigure = false;
        }
    }


    makeTurn(turn){
        const available = this.getAvailabelsActions();
        if (this.isStartedJumping){
            if (this.isStartedJumping && !this.isModeSelectionOfFigure && this.currentJumper){
                let availableCell = available.filter(e => (e.x === turn.to.x && e.y === turn.to.y));
                turn.from = this.currentJumper;
                this._killFigureTurn(turn, availableCell[0]);
            }else{
                const availableCell = available.filter(e => (e.x === turn.from.x && e.y === turn.from.y));
                if (!availableCell.length) {
                    return;
                }
                const availableRemoving = availableCell[0].fields.filter(e => (e.x === turn.to.x && e.y === turn.to.y));
                if (!availableRemoving.length){
                    return;
                }
                this._killFigureTurn(turn, availableRemoving[0]);
            }
        }else{
            const availableCell = available.filter(e => (e.x === turn.from.x && e.y === turn.from.y));
            if (!availableCell.length) {
                return;
            }
            const currentType = this.desk[turn.from.x][turn.from.y];
            this.desk[turn.from.x][turn.from.y] = 0;
            this.desk[turn.to.x][turn.to.y] = currentType;
            if (this.isTurnWhite && turn.to.x === this.desk.length - 1) {
                this.desk[turn.to.x][turn.to.y] = 3;
            }
            if (!this.isTurnWhite && turn.to.x === 0) {
                this.desk[turn.to.x][turn.to.y] = 6;
            }
            this.isTurnWhite = !this.isTurnWhite;
        }
    }

    getAvailabelsActions() {
        if (this.isStartedJumping && this.currentJumper) {
            const jumpersTurns = this.getJumpFieldsByCoords(this.currentJumper.x, this.currentJumper.y);
            if (!jumpersTurns.length){
                this.isStartedJumping = false;
                return this.getActionsByActionType(false);
            }
            return jumpersTurns;
        } else {
            let pp = this.getActionsByActionType();
            if (pp.length) {
                this.isStartedJumping = true;
                return pp;
            }
            this.isStartedJumping = false;
            return this.getActionsByActionType(false);
        }
    }

    getJumpFieldsByCoords(x, y) {
        let possibleFieldsForJump = [];
        let desk = this.desk;
        const type = desk[x][y];
        if (!type || (type<0) || (this.isTurnWhite && type > 3) || (!this.isTurnWhite && type < 4)) {
            return possibleFieldsForJump;
        }
        function rO(x,y,removingX,removingY){
            //function for map returning object
            return {
                x: x,
                y: y,
                removingX: removingX,
                removingY: removingY
            }
        }

        const isNextFieldWithEnemyFunction = (type < 4) ? 
            (x,y)=>(desk[x][y] > 3) : 
            (x,y)=>((desk[x][y] < 4) && (desk[x][y] > 0));

        if (type !== 2 && type !== 5) { //orts
            if (desk[x - 2] && (desk[x - 2][y] === 0) && isNextFieldWithEnemyFunction(x - 1, y)) {
                possibleFieldsForJump.push(rO(x - 2, y, x-1, y));
            }
            if (desk[x + 2] && (desk[x + 2][y] === 0) && isNextFieldWithEnemyFunction(x + 1, y)) {
                possibleFieldsForJump.push(rO(x + 2, y, x+1, y));
            }
            if (desk[x] && (desk[x][y - 2] === 0) && isNextFieldWithEnemyFunction(x, y - 1)) {
                possibleFieldsForJump.push(rO(x, y-2, x, y-1));
            }
            if (desk[x] && (desk[x][y + 2] === 0) && isNextFieldWithEnemyFunction(x, y + 1)) {
                possibleFieldsForJump.push(rO(x, y+2, x, y+1));
            }
        }
        if (type !== 1 && type !== 4) { //diagonals
            if (desk[x - 2] && (desk[x - 2][y - 2] === 0) && isNextFieldWithEnemyFunction(x - 1, y - 1)) {
                possibleFieldsForJump.push(rO(x-2, y-2, x-1, y-1));
            }
            if (desk[x + 2] && (desk[x + 2][y - 2] === 0) && isNextFieldWithEnemyFunction(x + 1, y - 1)) {
                possibleFieldsForJump.push(rO(x+2, y-2, x+1, y-1));
            }
            if (desk[x - 2] && (desk[x - 2][y + 2] === 0) && isNextFieldWithEnemyFunction(x - 1, y + 1)) {
                possibleFieldsForJump.push(rO(x-2, y+2, x-1, y+1));
            }
            if (desk[x + 2] && (desk[x + 2][y + 2] === 0) && isNextFieldWithEnemyFunction(x + 1, y + 1)) {
                possibleFieldsForJump.push(rO(x+2, y+2, x+1, y+1));
            }
        }
        return possibleFieldsForJump;
    }

    getWalkFieldsByCoords(x, y) {
        let possibleFieldsForWalk = [];
        const desk = this.desk;
        const type = desk[x][y];
        
        if (!type || (type<0) ||(this.isTurnWhite && type > 3) || (!this.isTurnWhite && type < 4)) {
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

    getActionsByActionType(isJump = true) {
        let turns = [];
        const desk = this.desk;
        const functionAction = isJump ? this.getJumpFieldsByCoords : this.getWalkFieldsByCoords;
        for (let i = 0; i < desk.length; i++) {
            for (let j = 0; j < desk[i].length; j++) {
                const actions = functionAction(i, j);
                if (actions.length) {
                    turns.push({
                        x: i,
                        y: j,
                        fields: actions
                    })
                }
            }
        }
        return turns;
    }

    getState(){
        return {
            desk: this.desk,
            actions: this.getAvailabelsActions(),
            isTurnWhite: this.isTurnWhite,
            isModeSelectionOfFigure : this.isModeSelectionOfFigure
        }
    }

}
module.exports = Game;