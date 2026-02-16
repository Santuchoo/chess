const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const BLACK_SQUARE_COLOR = "#cfb998"
const WHITE_SQUARE_COLOR = "#fdfff0"
const SQUARE_SIZE = 100;

canvas.width = SQUARE_SIZE*8
canvas.height = SQUARE_SIZE*8

const chessNotation = {
    whiteking: 'K',
    whitequeen: 'Q',
    whitebishop: 'B',
    whiteknight: 'N',
    whiterook: 'R',
    whitepawn: 'P',
    blackking: 'k',
    blackqueen: 'q',
    blackbishop: 'b',
    blackknight: 'n',
    blackrook: 'r',
    blackpawn: 'p',
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
    constructor(color, x=1, y=0) {
        this.color = color
        this.coordinates = [x,y]
        this.background = null
    }
    
    isMoveLegal(move) {
        if (move) { 
            //if move is legal, return true
            return true
        } else {
            return false
        }
    }
    
    move(move, accuracy=null) {
        if (!accuracy) {
            if (this.isMoveLegal(move)) {
                console.log(move);
                game.movesLog.push(move)
            }
        }        
    }

    capture(position, pieceCaptured, accuracy) {
        console.log(`${this.constructor.name[0]}x${position}${Utilities.toChessNotation(accuracy.toLowerCase())}`);
    }
}

class King extends Piece {
    constructor(color, x, y, background) {
        super(color, x, y, background)
    }
}

class Queen extends Piece {
    constructor(color, x, y, background) {
        super(color, x, y, background)
    }
}

class Bishop extends Piece {
    constructor(color, x, y, background) {
        super(color, x, y, background)
    }
}

class Knight extends Piece {
    constructor(color, x, y, background) {
        super(color, x, y, background)
    }
}

class Rook extends Piece {
    constructor(color, x, y, background) {
        super(color, x, y, background)
    }
}

class Pawn extends Piece {
    constructor(color, x, y, background) {
        super(color, x, y, background)
        this.canDoubleStep = true
    }
}

class Board {
    constructor() {
        this.board = [
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
        ]

        this.init()
    }

    init() {
        this.board = [
            [new Rook("black"),new Knight("black"),new Bishop("black"),new Queen("black"),new King("black"),new Bishop("black"),new Knight("black"),new Rook("black")],
            [new Pawn("black"),new Pawn("black"),new Pawn("black"),new Pawn("black"),new Pawn("black"),new Pawn("black"),new Pawn("black"),new Pawn("black")],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [new Pawn("white"),new Pawn("white"),new Pawn("white"),new Pawn("white"),new Pawn("white"),new Pawn("white"),new Pawn("white"),new Pawn("white")],
            [new Rook("white"),new Knight("white"),new Bishop("white"),new Queen("white"),new King("white"),new Bishop("white"),new Knight("white"),new Rook("white")],
        ]


        for (let rowIndex in this.board) {

            let rowItems = this.board[rowIndex]

            for (let itemIndex in rowItems) {
                let item = rowItems[itemIndex]
                if (item != null) {
                    item.coordinates = [rowIndex, itemIndex]
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
                    if (piece.background != null) {
                        this.ctx.fillStyle = piece.background
                        this.ctx.fillRect(c*SQUARE_SIZE, r*SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE)
                    }
                    this.ctx.drawImage(img, c*SQUARE_SIZE, r*SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE)
                }
            }
        }
    }
}

class Game {
    constructor(canvas, board, renderer) {
        this.canvas = canvas
        this.board = board
        this.renderer = renderer
        this.movesLog = []
        this.selectedPieceLog = []
        this.selectedPiece = null

        this.initInput()
    }

    initInput() {
        this.canvas.addEventListener("click", (event) => {
            const rect = this.canvas.getBoundingClientRect()

            const x = event.clientX - rect.left
            const y = event.clientY - rect.top

            const col = Math.floor(x / SQUARE_SIZE)
            const row = Math.floor(y / SQUARE_SIZE)

            this.handleClick(row, col)
        })
    }

    handleClick(row, col) {
        const piece = this.board.board[row][col]
        let pieceKey;
        if (piece) {
            const previousPiece = this.selectedPieceLog.at(-1)
            // seleccionar
            this.selectedPiece = piece
            this.selectedPieceLog.push(piece)
            pieceKey = this.selectedPiece.color + this.selectedPiece.constructor.name.toLowerCase()
            console.log(["S", Utilities.toChessNotation(pieceKey), piece.coordinates])
            
            if (previousPiece) {
                previousPiece.background = null
            }
            piece.background = "#0003"
        } else if (this.selectedPiece && piece == null) {
            // intentar mover
            pieceKey = this.selectedPiece.color + this.selectedPiece.constructor.name.toLowerCase()
            this.selectedPiece.move(["M", Utilities.toChessNotation(pieceKey), [row, col]])
            this.selectedPiece.background = null
            this.selectedPiece = null
        }
    }
}

class Utilities {
    static toChessCoords([x, y]) {
        //TOP LEFT BASED
        const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        return letters[x] + (8 - y);
    }

    static toArrayCoords(notation) {
        const col = notation.charCodeAt(0) - 97; // 'a' es 97 en ASCII
        const row = 8 - parseInt(notation[1]);
        return [row, col];
    }

    static toChessNotation(expression) {
        if (chessNotation[expression] !== undefined) {
            return chessNotation[expression]
        }
        return null
    }
}


const board = new Board
const renderer = new Renderer(ctx)
const game = new Game(canvas, board, renderer)

const draw = ()=> {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    renderer.drawBoard()
    renderer.drawPieces(board)
    requestAnimationFrame(draw)
}

draw()