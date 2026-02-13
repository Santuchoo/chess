const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.width = 800
canvas.height = 800

const BLACK_SQUARE_COLOR = "#cfb998"
const WHITE_SQUARE_COLOR = "#fdfff0"
const SQUARE_SIZE = 75;

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
    constructor(color, x=1, y='a') {
        this.color = color
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
    constructor(color, x, y) {
        super(color, x, y)
    }
}

class Queen extends Piece {
    constructor(color, x, y) {
        super(color, x, y)
    }
}

class Bishop extends Piece {
    constructor(color, x, y) {
        super(color, x, y)
    }
}

class Knight extends Piece {
    constructor(color, x, y) {
        super(color, x, y)
    }
}

class Rook extends Piece {
    constructor(color, x, y) {
        super(color, x, y)
    }
}

class Pawn extends Piece {
    constructor(color, x, y) {
        super(color, x, y)
    }
}

class Board {
    constructor() {
        this.board = [
            ["","","","","","","",""],
            ["","","","","","","",""],
            ["","","","","","","",""],
            ["","","","","","","",""],
            ["","","","","","","",""],
            ["","","","","","","",""],
            ["","","","","","","",""],
            ["","","","","","","",""],
        ]

        this.positions = [
            ["a8","b8","c8","d8","e8","f8","g8","h8"],
            ["a7","b7","c7","d7","e7","f7","g7","h7"],
            ["a6","b6","c6","d6","e6","f6","g6","h6"],
            ["a5","b5","c5","d5","e5","f5","g5","h5"],
            ["a4","b4","c4","d4","e4","f4","g4","h4"],
            ["a3","b3","c3","d3","e3","f3","g3","h3"],
            ["a2","b2","c2","d2","e2","f2","g2","h2"],
            ["a1","b1","c1","d1","e1","f1","g1","h1"],
        ]

        this.init()
    }

    init() {
        this.board = [
            [new Rook("black"),new Knight("black"),new Bishop("black"),new Queen("black"),new King("black"),new Bishop("black"),new Knight("black"),new Rook("black")],
            [new Pawn("black"),new Pawn("black"),new Pawn("black"),new Pawn("black"),new Pawn("black"),new Pawn("black"),new Pawn("black"),new Pawn("black")],
            ["","","","","","","",""],
            ["","","","","","","",""],
            ["","","","","","","",""],
            ["","","","","","","",""],
            [new Pawn("white"),new Pawn("white"),new Pawn("white"),new Pawn("white"),new Pawn("white"),new Pawn("white"),new Pawn("white"),new Pawn("white")],
            [new Rook("white"),new Knight("white"),new Bishop("white"),new Queen("white"),new King("white"),new Bishop("white"),new Knight("white"),new Rook("white")],
        ]


        for (let rowIndex in this.board) {

            let rowItems = this.board[rowIndex]

            for (let itemIndex in rowItems) {
                let item = rowItems[itemIndex]
                if (item != "") {
                    item.coordinates = [ this.positions[rowIndex][itemIndex][0], this.positions[rowIndex][itemIndex][1] ]
                }
            }
        }
    }    
}

class Renderer {
    constructor(ctx) {
        this.ctx = ctx
        this.images = {}
        this.loadImages()
    }

    drawBoard() {
        for (let c=0; c<8; c++) {
            for (let r=0; r<8; r++) {
                ctx.fillStyle = (r + c) % 2 === 0
                ? WHITE_SQUARE_COLOR
                : BLACK_SQUARE_COLOR;
                ctx.fillRect(r*SQUARE_SIZE, c*SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE)
            }
        }
    }

    loadImages() {
        const pieces = ["pawn", "rook", "knight", "bishop", "queen", "king"]
        const colors = ["white", "black"]

        for (let color of colors) {
            for (let piece of pieces) {
                const img = new Image()
                const key = `${color}-${piece}`
                img.src = `pieces/${key}.png`
                this.images[key] = img
            }
        }
    }

    drawPieces(board) {
        for (let r=0; r<8; r++) {
            for (let c=0; c<8; c++) {
                const piece = board.board[r][c]
                if (!piece) continue

                const key = `${piece.color}-${piece.constructor.name.toLowerCase()}`
                const img = this.images[key]

                if (img) {
                    this.ctx.drawImage(img, c*SQUARE_SIZE, r*SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE)
                }
            }
        }
    }
}

const board = new Board
const renderer = new Renderer(ctx)

const draw = ()=> {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    renderer.drawBoard()
    renderer.drawPieces(board)
    requestAnimationFrame(draw)
}

draw()