const { Telegraf, Markup } = require('telegraf')
console.log('Token:', process.env.TELEGRAM_BOT_TOKEN ? 'mavjud' : 'YOQ!')
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

const games = {}

function createBoard() {
  return [[' ',' ',' '],[' ',' ',' '],[' ',' ',' ']]
}

function checkWinner(board, player) {
  for (let i = 0; i < 3; i++) {
    if (board[i].every(c => c === player)) return true
    if (board.every(r => r[i] === player)) return true
  }
  if (board.every((r, i) => r[i] === player)) return true
  if (board.every((r, i) => r[2-i] === player)) return true
  return false
}

function boardFull(board) {
  return board.every(r => r.every(c => c !== ' '))
}

function makeKeyboard(board, gameOver = false) {
  const buttons = board.map((row, r) =>
    row.map((cell, c) => {
      const text = cell === 'X' ? '❌' : cell === 'O' ? '⭕' : '⬜'
      return Markup.button.callback(text, `${r}${c}`)
    })
  )
  if (gameOver) {
    buttons.push([Markup.button.callback('🔄 Yangi oyin', 'new')])
  }
  return Markup.inlineKeyboard(buttons)
}

bot.start((ctx) => {
  const userId = ctx.from.id
  games[userId] = { board: createBoard() }
  ctx.reply('X va O oyini! Siz X ❌, men O ⭕\nBoshlang!', makeKeyboard(createBoard()))
})

bot.action('new', (ctx) => {
  const userId = ctx.from.id
  games[userId] = { board: createBoard() }
  ctx.editMessageText('Yangi oyin! Siz X ❌', makeKeyboard(createBoard()))
})

bot.action(/^[0-2][0-2]$/, (ctx) => {
  const userId = ctx.from.id
  if (!games[userId]) games[userId] = { board: createBoard() }
  const board = games[userId].board
  const r = parseInt(ctx.match[0][0])
  const c = parseInt(ctx.match[0][1])
  if (board[r][c] !== ' ') return ctx.answerCbQuery()
  board[r][c] = 'X'
  if (checkWinner(board, 'X')) {
    return ctx.editMessageText('Siz yutdingiz! 🎉', makeKeyboard(board, true))
  }
  if (boardFull(board)) {
    return ctx.editMessageText('Durrang! 🤝', makeKeyboard(board, true))
  }
  const empty = []
  board.forEach((row, i) => row.forEach((cell, j) => { if (cell === ' ') empty.push([i,j]) }))
  const [r2, c2] = empty[Math.floor(Math.random() * empty.length)]
  board[r2][c2] = 'O'
  if (checkWinner(board, 'O')) {
    return ctx.editMessageText('Men yutdim! 🤖', makeKeyboard(board, true))
  }
  if (boardFull(board)) {
    return ctx.editMessageText('Durrang! 🤝', makeKeyboard(board, true))
  }
  ctx.editMessageText('Sizning navbatingiz ❌', makeKeyboard(board))
  ctx.answerCbQuery()
})

bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
