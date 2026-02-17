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
    constructor(color, x=0, y=0, board) {
        this.color = color
        this.coordinates = [x,y]
        this.background = null
        this.board = board
    }
    
    isMoveLegal(board, to) {
        return false
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
    constructor(color, x, y, board, background) {
        super(color, x, y, board, background)
    }
}

class Queen extends Piece {
    constructor(color, x, y, board, background) {
        super(color, x, y, board, background)
    }
}

class Bishop extends Piece {
    constructor(color, x, y, board, background) {
        super(color, x, y, board, background)
    }

    isMoveLegal(board, [toRow, toCol]) {
        const [fromRow, fromCol] = this.coordinates

        const dRow = toRow - fromRow
        const dCol = toCol - fromCol

        // Must be diagonal
        if (Math.abs(dRow) !== Math.abs(dCol)) return false

        const stepRow = Math.sign(dRow)
        const stepCol = Math.sign(dCol)

        //Checking if the path is empty (not including starting position && final position)
        for (let i=1; i < Math.abs(dRow); i++) {
            const r = fromRow + stepRow * i
            const c = fromCol + stepCol * i
            if (board[r][c] instanceof Piece) {
                return false
            }
        }

        //Checking if the target isn't the same color (capture) or is empty (move)
        const target = board[toRow][toCol]
        return (!target || target.color !== this.color)
    }
}

class Knight extends Piece {
    constructor(color, x, y, board, background) {
        super(color, x, y, board, background)
    }
}

class Rook extends Piece {
    constructor(color, x, y, board, background) {
        super(color, x, y, board, background)
    }
}

class Pawn extends Piece {
    constructor(color, x, y, board, background) {
        super(color, x, y, board, background)
        this.canDoubleStep = true
        this.color == "white" 
            ? this.dir = -1
            : this.dir = 1
        this.moves = 0
    }
    
    isMoveLegal(board, [toRow, toCol]) {
        const [fromRow, fromCol] = this.coordinates

        //1 step
        if (
            toCol === fromCol &&
            toRow - fromRow === this.dir &&
            board[toRow][toCol] == null
        ) {
            return true
        }

        //2 steps
        if (this.canDoubleStep == true) {
            if (
                toCol === fromCol &&
                toRow - fromRow === this.dir*2 &&
                board[toRow][toCol] == null &&
                board[toRow - this.dir][toCol] == null
            ) {
                return true
            }
        }

        //Capture diagonally
        if (
            (toCol - fromCol === -1 || toCol - fromCol === 1) &&
            toRow - fromRow == this.dir &&
            board[toRow][toCol] instanceof Piece
        ) {
            return true
        }

        return false
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


        for (let row = 0; row < this.board.length; row++) {
            for (let col = 0; col < this.board[row].length; col++) {
                const item = this.board[row][col]
                if (item) item.coordinates = [row, col]
            }
        }
    }

    deletePiece([x,y]) {
        this.board[x][y] = null
    }

    setPiece([x,y], piece) {
        this.board[x][y] = piece
    }

    movePiece([moveOrSelection, piece, [x,y]]) {
        if (moveOrSelection === "M") {
            this.deletePiece(piece.coordinates)
            this.setPiece([x,y],piece)
            piece.coordinates = [x,y]
            if (piece instanceof Pawn) {
                piece.canDoubleStep = false
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
        this.turn = "w"

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
        const target = this.board.board[row][col]

        // 1. No hay pieza seleccionada
        if (!this.selectedPiece) {
            if (target && target.color[0] === this.turn) {
                this.selectedPiece = target
                target.background = "#0003"
            }
            return
        }

        // 2. Hay pieza seleccionada
        const piece = this.selectedPiece

        // click en pieza propia → cambiar selección
        if (target && target.color === piece.color) {
            piece.background = null
            this.selectedPiece = target
            target.background = "#0003"
            return
        }

        // click en enemigo → captura
        if (target && target.color !== piece.color && piece.isMoveLegal(this.board.board ,[row, col])) {
            this.board.movePiece(["M", piece, [row, col]])
            piece.coordinates = [row, col]
            this.turn = this.turn === "w" ? "b" : "w"
        }

        // click en vacío → mover
        else if (!target && piece.isMoveLegal(this.board.board, [row, col])) {
            this.turn = this.turn === "w" ? "b" : "w"
            this.board.movePiece(["M", piece, [row, col]])
        }

        piece.background = null
        this.selectedPiece = null
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
