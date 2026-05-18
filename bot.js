const { Telegraf, Markup } = require('telegraf')

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
if (!TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN topilmadi!')
  process.exit(1)
}

const bot = new Telegraf(TOKEN)
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
      return Markup.button.callback(te
