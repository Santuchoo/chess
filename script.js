const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const audios = {
    capture: new Audio("audio/capture.mp3"),
    move: new Audio("audio/move.mp3"),
    check: new Audio("audio/check.mp3"),
    castle: new Audio("audio/castle.mp3"),
    promote: new Audio("audio/promote.mp3"),
    gameEnd: new Audio("audio/game-end.webp"),
}


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
}

class King extends Piece {
    constructor(color, x, y, board, background) {
        super(color, x, y, board, background)
        this.hasMoved = false
    }

    findKing(board, color) {
        for (let r=0; r<8; r++) {
            for (let c=0; c<8; c++) {
                const piece = board.board[r][c]
                if (piece &&
                    piece instanceof King &&
                    piece.color === color
                ) {
                    return piece.coordinates
                }
            }
        }
        return null //it shouldn't return null if the position is valid
    }

    isSquareAttacked(board, row, col, attackerColor) {
        const directions = {
            verticalMovement: [[1,0], //Positive x (right)
                                [-1,0], //Negative x (left)
                                [0,1], //Positive y (down)
                                [0,-1]], //Negative y (up)
            
            diagonalMovement: [[1,-1],
                                [-1,1],
                                [1,1], 
                                [-1,-1]],
            
            knightMovement: [
                            [2,1], [2,-1], [-2,1], [-2,-1],
                            [1,2], [1,-2], [-1,2], [-1,-2]
                        ],
            
            kingMovement: [
                [-1,-1], [-1,0], [-1,1],
                [0,-1],          [0,1],
                [1,-1],  [1,0],  [1,1]
            ],
        }

        //rook & queen
        for (const [dRow, dCol] of directions["verticalMovement"]) {
            let r = row + dRow
            let c = col + dCol

            while (board.inBounds(r, c)) {
                const piece = board.board[r][c]

                if (piece) {
                    if (
                        piece.color === attackerColor &&
                        (piece instanceof Rook || piece instanceof Queen)
                    ) return true

                    break
                }
                r += dRow
                c += dCol
            }
        }

        //bishop & queen
        for (const [dRow, dCol] of directions["diagonalMovement"]) {
            let r = row + dRow
            let c = col + dCol

            while (board.inBounds(r, c)) {
                const piece = board.board[r][c]

                if (piece) {
                    if (
                        piece.color === attackerColor &&
                        (piece instanceof Bishop || piece instanceof Queen)
                    ) return true

                    break
                }

                r += dRow
                c += dCol
            }
        }

        //knight
        for (const [dRow, dCol] of directions["knightMovement"]) {
            const r = row + dRow
            const c = col + dCol

            if (!board.inBounds(r, c)) continue

            const piece = board.board[r][c]

            if (
                piece &&
                piece.color === attackerColor &&
                piece instanceof Knight
            ) {
                return true
            }
        }

        //pawn
        const pawnDir = attackerColor === "white" ? -1 : 1
        const pawnMovement = [
            [pawnDir, -1],
            [pawnDir, 1]
        ]

        for (const [dRow, dCol] of pawnMovement) {
            const r = row + dRow
            const c = col + dCol

            if (!board.inBounds(r, c)) continue

            const piece = board.board[r][c]
            if (
                piece &&
                piece.color === attackerColor &&
                piece instanceof Pawn
            ) {
                return true
            }
        }

        //king
        for (const [dRow, dCol] of directions["kingMovement"]) {
            const r = row + dRow
            const c = col + dCol

            if (!board.inBounds(r,c)) continue

            const piece = board.board[r][c]

            if (
                piece &&
                piece.color === attackerColor &&
                piece instanceof King
            ) {
                return true
            }
        }
        return false
    }

    isInCheck(board, color) {
        let attackerColor;

        color === 'white'
            ? attackerColor = 'black'
            : attackerColor = 'white'
        
        const kingPos = this.findKing(board, color)
        if (!kingPos) {
            console.error('King not found')
            return null
        }
        if (this.isSquareAttacked(board, kingPos[0], kingPos[1], attackerColor)) {
            return true
        }
    }

    kingMove(board, [toRow, toCol]) {
        const [fromRow, fromCol] = this.coordinates

        const dRow = Math.abs(toRow - fromRow)
        const dCol = Math.abs(toCol - fromCol)

        // the move must be 1 square
        if (dRow > 1 || dCol > 1) return false

        const target = board.board[toRow][toCol]
        // can't capture his own piece
        if (target && target.color === this.color) return false

        // simulate the move
        const originalFrom = board.board[fromRow][fromCol]
        const originalTo = board.board[toRow][toCol]

        board.board[fromRow][fromCol] = null
        board.board[toRow][toCol] = this
        this.coordinates = [toRow, toCol]

        const isInCheck = this.isInCheck(board, this.color)

        // undo move
        board.board[fromRow][fromCol] = originalFrom
        board.board[toRow][toCol] = originalTo
        this.coordinates = [fromRow, fromCol]

        if(!isInCheck) this.hasMoved = true
        return !isInCheck
    }
    
    castle(board, [toRow, toCol]) {
        const [fromRow, fromCol] = this.coordinates

        const dRow = toRow - fromRow
        const dCol = toCol - fromCol

        const attackerColor = this.color === "white" ? "black" : "white"
        const kingSide = this.color === "white" ? "K" : "k"
        const queenSide = this.color === "white" ? "Q" : "q"

        if (dRow === 0 && (dCol === 2 || dCol === -2) &&
            board.fen.split(" ")[2].includes(kingSide) || board.fen.split(" ")[2].includes(queenSide)
        ) {
            if (!this.isSquareAttacked(board, toRow, toCol, attackerColor) &&
            !this.isSquareAttacked(board, toRow-1, toCol-1, attackerColor) &&
            !this.hasMoved &&
            !this.isInCheck(board, this.color)) {
                //King side castle
                if (board.board[toRow][toCol+1] instanceof Rook &&
                board.board[toRow][toCol+1].hasMoved === false) {
                    board.movePiece(["M", board.board[toRow][toCol+1], [toRow, toCol-1]])
                    audios.castle.play()
                    return true
                }

                //Queen side castle
                if (board.board[toRow][toCol-2] instanceof Rook &&
                board.board[toRow][toCol-2].hasMoved === false) {
                    board.movePiece(["M", board.board[toRow][toCol-2], [toRow, toCol+1]])
                    audios.castle.play()
                    return true
                }
            }
            
        
        }
    }

    isMoveLegal(board, [toRow, toCol]) {
        if (this.kingMove(board, [toRow, toCol]) || 
            this.castle(board, [toRow, toCol])) {
                return true
            }
    }
}

class Queen extends Piece {
    constructor(color, x, y, board, background) {
        super(color, x, y, board, background)
    }

    rookMovement(board, [toRow, toCol]) {
        const [fromRow, fromCol] = this.coordinates

        const dRow = toRow - fromRow
        const dCol = toCol - fromCol

        // must be straight line
        if (dRow !== 0 && dCol !== 0) return false

        const stepRow = Math.sign(dRow)
        const stepCol = Math.sign(dCol)

        let r = fromRow + stepRow
        let c = fromCol + stepCol

        // check path (exclude destination)
        while (r !== toRow || c !== toCol) {
            if (board.board[r][c] instanceof Piece) return false
            r += stepRow
            c += stepCol
        }

        // check destination color
        const target = board.board[toRow][toCol]
        return !target || target.color !== this.color
    }
    
    bishopMovement(board, [toRow, toCol]) {
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
            if (board.board[r][c] instanceof Piece) {
                return false
            }
        }

        //Checking if the target isn't the same color (capture) or is empty (move)
        const target = board.board[toRow][toCol]
        return (!target || target.color !== this.color)
    }

    isMoveLegal(board, [toRow, toCol]) {
        return (this.rookMovement(board, [toRow, toCol]) || this.bishopMovement(board, [toRow, toCol]))
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
            if (board.board[r][c] instanceof Piece) {
                return false
            }
        }

        //Checking if the target isn't the same color (capture) or is empty (move)
        const target = board.board[toRow][toCol]
        return (!target || target.color !== this.color)
    }
}

class Knight extends Piece {
    constructor(color, x, y, board, background) {
        super(color, x, y, board, background)
    }

    isMoveLegal(board, [toRow, toCol]) {
        const [fromRow, fromCol] = this.coordinates

        const dRow = toRow - fromRow
        const dCol = toCol - fromCol

        if ((Math.abs(dRow) === 1 && Math.abs(dCol) === 2) || (Math.abs(dRow) === 2 && Math.abs(dCol) === 1)) {
            const target = board.board[toRow][toCol]
            return (!target || target.color !== this.color)
        }
        return false
    }
}

class Rook extends Piece {
    constructor(color, x, y, board, background) {
        super(color, x, y, board, background)
        this.hasMoved = false
    }

    isMoveLegal(board, [toRow, toCol]) {
        const [fromRow, fromCol] = this.coordinates

        const dRow = toRow - fromRow
        const dCol = toCol - fromCol

        // must be a straight line
        if (dRow !== 0 && dCol !== 0) return false

        const stepRow = Math.sign(dRow)
        const stepCol = Math.sign(dCol)

        let r = fromRow + stepRow
        let c = fromCol + stepCol

        // check path (exclude destination)
        while (r !== toRow || c !== toCol) {
            if (board.board[r][c] instanceof Piece) return false
            r += stepRow
            c += stepCol
        }

        // check destination color
        const target = board.board[toRow][toCol]
        if (!target || target.color !== this.color) this.hasMoved = true
        return !target || target.color !== this.color
    }
}

class Pawn extends Piece {
    constructor(color, x, y, board, background) {
        super(color, x, y, board, background)
        this.canDoubleStep = true
        this.dir = this.color === "white" ? -1 : 1
        this.moves = 0
    }
    
    isMoveLegal(board, [toRow, toCol]) {
        const [fromRow, fromCol] = this.coordinates

        //1 step
        if (
            toCol === fromCol &&
            toRow - fromRow === this.dir &&
            board.board[toRow][toCol] == null
        ) {
            this.canDoubleStep = false
            return true
        }

        //2 steps
        if (this.canDoubleStep == true) {
            if (
                toCol === fromCol &&
                toRow - fromRow === this.dir*2 &&
                board.board[toRow][toCol] == null &&
                board.board[toRow - this.dir][toCol] == null
            ) {
                this.canDoubleStep = false
                return true
            }
        }

        //Capture diagonally
        if (
            (toCol - fromCol === -1 || toCol - fromCol === 1) &&
            toRow - fromRow == this.dir &&
            board.board[toRow][toCol] instanceof Piece
        ) {
            this.canDoubleStep = false
            return true
        }
        
        return false
    }
}

class Board {
    constructor(fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
        this.fen = fen
        this.board = []

        let row = []
        const boardFen = this.fen.split(" ")[0]

        for (let charIndex = 0; charIndex < boardFen.length; charIndex++) {
            let char = boardFen[charIndex]

            if (char === "/") {
                this.board.push(row)
                row = []
                continue
            }

            if (Utilities.isDigit(char)) {
                for (let i=0; i<parseInt(char); i++) {
                    row.push(null)
                }
            }

            if (!Utilities.isDigit(char)) {
                const color = char === char.toUpperCase() ? "white" : "black"

                const pieceMap = {
                    r: Rook,
                    n: Knight,
                    b: Bishop,
                    q: Queen,
                    k: King,
                    p: Pawn
                }

                const PieceClass = pieceMap[char.toLowerCase()]
                const piece = new PieceClass(color)
                piece.coordinates = [this.board.length, row.length]
                row.push(piece)
            }
        }
        this.board.push(row)
    }

    deletePiece([x,y]) {
        this.board[x][y] = null
    }

    setPiece([x,y], piece) {
        this.board[x][y] = piece
    }

    movePiece([type, piece, [x,y]]) {
        this.deletePiece(piece.coordinates)
        this.setPiece([x,y],piece)
        piece.coordinates = [x,y]
    }

    inBounds(r, c) {
        return r >= 0 && r < 8 && c >= 0 && c < 8
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
        this.turn = board.fen.split(" ")[1]

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

    simulateMove(piece, color, [toRow, toCol]) {
        const [fromRow, fromCol] = piece.coordinates
        const target = this.board.board[toRow][toCol]

        // simulate
        this.board.board[fromRow][fromCol] = null
        this.board.board[toRow][toCol] = piece
        piece.coordinates = [toRow, toCol]

        const kingChecker = new King(color)
        const inCheck = kingChecker.isInCheck(this.board, color)

        // undo
        this.board.board[fromRow][fromCol] = piece
        this.board.board[toRow][toCol] = target
        piece.coordinates = [fromRow, fromCol]
        return !inCheck
    }

    handleClick(row, col) {
        const target = this.board.board[row][col]

        // no piece is selected
        if (!this.selectedPiece) {
            if (target && target.color[0] === this.turn) {
                this.selectedPiece = target
                target.background = "#0003"
            }
            return
        }

        // a piece is selected
        const piece = this.selectedPiece

        // click on self piece -> change selection
        if (target && target.color === piece.color) {
            piece.background = null
            this.selectedPiece = target
            target.background = "#0003"
            return
        }

        // click on enemy's piece -> capture
        if (target && piece.isMoveLegal(this.board, [row, col])) {
            if (!this.simulateMove(piece, piece.color, [row, col])) {
                audios.check.play() // FIX
                return
            }
            this.board.movePiece(["C", piece, [row, col]])
            this.movesLog.push(["C", piece, [row, col]])
            audios.capture.play()
            this.turn = this.turn === "w" ? "b" : "w"
        }

        // click on an empty space -> move
        else if (!target && piece.isMoveLegal(this.board, [row, col])) {
            if (!this.simulateMove(piece, piece.color, [row, col])) {
                audios.check.play() // FIX
                return
            }
            this.board.movePiece(["M", piece, [row, col]])
            this.movesLog.push(["M", piece, [row, col]])
            audios.move.play()
            this.turn = this.turn === "w" ? "b" : "w"
        }

        piece.background = null
        this.selectedPiece = null
        console.log(Utilities.toFenNotation(this.board))
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

    static toFenNotation(board) {
        let counter;
        let fenstring = "";
        for (let r = 0; r < 8; r++) {
            counter = 0;
            for (let c = 0; c < 8; c++) {
                const piece = board.board[r][c];
                if (piece instanceof Piece) {
                    if (counter > 0) {
                        fenstring += counter;
                        counter = 0;
                    }
                    fenstring += Utilities.toChessNotation(`${piece.color}${piece.constructor.name.toLowerCase()}`);
                } else {
                    counter++;
                }
            }
            if (counter > 0) {
                fenstring += counter;
            }
            if (r < 7) fenstring += "/";
        }
        return fenstring
    }

    static isDigit(char) {
        return /^\d$/.test(char);
    }
}


const board = new Board()
const renderer = new Renderer(ctx)
const game = new Game(canvas, board, renderer)

const draw = ()=> {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    renderer.drawBoard()
    renderer.drawPieces(board)
    requestAnimationFrame(draw)
}

draw()