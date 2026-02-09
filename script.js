const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const chessNotation = {
    king: 'K',
    queen: 'Q',
    bishop: 'B',
    knight: 'N',
    rook: 'R',
    pawn: 'P',
    shortCastle: 'O-O',
    longCastle: 'O-O-O',
    check: '+',
    checkmate: '#',
    blunder: '??',
    mistake: '?',
    inaccuracy: '?!',
    good: '-',
    excellent: '$',
    best: '*',
    great: '!',
    brilliant: '!!',
}

class Piece {
    constructor(y='a', x=1) {
        this.coordinates = [x,y]
        this.numberPos = x
        this.letterPos = y
    }
    
    isMoveLegal(move) {
        if (move) { 
            //if move is legal, return true
            return true
        } else {
            return false
        }
    }
    
    move(position, accuracy) {
        const pieceMove = `${chessNotation[this.constructor.name.toLowerCase()]}${position}${chessNotation[accuracy.toLowerCase()]}`
        if (this.isMoveLegal(pieceMove)) {
            console.log(pieceMove);
        }
    }

    capture(position, pieceCaptured, accuracy) {
        console.log(`${this.constructor.name[0]}x${position}${chessNotation[accuracy.toLowerCase()]}`);
    }
}

class King extends Piece {
    constructor() {
        super()
    }
}

class Queen extends Piece {
    constructor() {
        super()
    }
}

class Bishop extends Piece {
    constructor() {
        super()
    }
}

class Knight extends Piece {
    constructor() {
        super()
    }
}

class Rook extends Piece {
    constructor() {
        super()
    }
}

class Pawn extends Piece {
    constructor() {
        super()
    }
}


const draw = ()=> {
    //to implement
}