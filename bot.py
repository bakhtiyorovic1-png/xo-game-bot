import os
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, ContextTypes

logging.basicConfig(level=logging.INFO)
TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")

def create_board():
    return [[" "," "," "],[" "," "," "],[" "," "," "]]

def check_winner(board, player):
    for row in board:
        if all(cell == player for cell in row):
            return True
    for col in range(3):
        if all(board[row][col] == player for row in range(3)):
            return True
    if all(board[i][i] == player for i in range(3)):
        return True
    if all(board[i][2-i] == player for i in range(3)):
        return True
    return False

def board_full(board):
    return all(board[r][c] != " " for r in range(3) for c in range(3))

def make_keyboard(board, game_over=False):
    keyboard = []
    for r in range(3):
        row = []
        for c in range(3):
            cell = board[r][c]
            text = cell if cell != " " else "."
            row.append(InlineKeyboardButton(text, callback_data=f"{r}{c}"))
        keyboard.append(row)
    if game_over:
        keyboard.append([InlineKeyboardButton("🔄 Yangi o'yin", callback_data="new")])
    return InlineKeyboardMarkup(keyboard)

games = {}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    games[update.effective_user.id] = {"board": create_board(), "turn": "X"}
    await update.message.reply_text(
        "X va O o'yini! Siz X, men O 🎮\nQatorni bosing:",
        reply_markup=make_keyboard(create_board())
    )

async def button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    user_id = update.effective_user.id
    
    if query.data == "new":
        games[user_id] = {"board": create_board(), "turn": "X"}
        await query.edit_message_text("Yangi o'yin! Siz X 🎮", reply_markup=make_keyboard(create_board()))
        return
    
    if user_id not in games:
        games[user_id] = {"board": create_board(), "turn": "X"}
    
    game = games[user_id]
    board = game["board"]
    r, c = int(query.data[0]), int(query.data[1])
    
    if board[r][c] != " ":
        return
    
    board[r][c] = "X"
    if check_winner(board, "X"):
        await query.edit_message_text("Siz yutdingiz! 🎉", reply_markup=make_keyboard(board, True))
        return
    if board_full(board):
        await query.edit_message_text("Durrang! 🤝", reply_markup=make_keyboard(board, True))
        return
    
    import random
    empty = [(r,c) for r in range(3) for c in range(3) if board[r][c]==" "]
    if empty:
        r2,c2 = random.choice(empty)
        board[r2][c2] = "O"
    
    if check_winner(board, "O"):
        await query.edit_message_text("Men yutdim! 🤖", reply_markup=make_keyboard(board, True))
        return
    if board_full(board):
        await query.edit_message_text("Durrang! 🤝", reply_markup=make_keyboard(board, True))
        return
    
    await query.edit_message_text("Sizning navbatingiz:", reply_markup=make_keyboard(board))

app = ApplicationBuilder().token(TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(CallbackQueryHandler(button))
app.run_polling()
