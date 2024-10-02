const TelegramBot = require('node-telegram-bot-api');

// Укажите ваш токен бота
const token = '7572082955:AAHBY1VgVh1adY3jQgdPQWBbKiEmwD4-qa0';
const bot = new TelegramBot(token, { polling: true });

// ID администратора (замени на свой Telegram ID)
const ADMIN_ID = '1698627777';

// Инициализация переменных для хранения данных игроков
let playerScores = {};
let tournaments = [];

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Добро пожаловать в игру KLETKATAP! Используйте команду /play, чтобы начать.');
});

// Команда /play
bot.onText(/\/play/, (msg) => {
    const chatId = msg.chat.id;
    
    // Начинаем игру для игрока
    if (!playerScores[chatId]) {
        playerScores[chatId] = { score: 0, clicks: 0 };
    }
    
    bot.sendMessage(chatId, 'Нажмите на монетку, чтобы заработать баллы!', {
        reply_markup: {
            inline_keyboard: [[
                { text: '💰 Нажми на монетку', callback_data: 'coin_click' },
            ]],
        },
    });
});

// Обработка нажатия на монетку
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;

    if (callbackQuery.data === 'coin_click') {
        playerScores[chatId].score += 1;
        playerScores[chatId].clicks += 1;

        bot.sendMessage(chatId, `Вы заработали 1 балл! Текущий счёт: ${playerScores[chatId].score}`);
    }
});

// Команда /tournament
bot.onText(/\/tournament/, (msg) => {
    const chatId = msg.chat.id;

    // Добавляем игрока в турнир
    if (!tournaments.includes(chatId)) {
        tournaments.push(chatId);
    }

    bot.sendMessage(chatId, `Игрок добавлен в турнир! Всего участников: ${tournaments.length}`);
});

// Команда /score
bot.onText(/\/score/, (msg) => {
    const chatId = msg.chat.id;
    
    const score = playerScores[chatId] ? playerScores[chatId].score : 0;
    bot.sendMessage(chatId, `Ваш текущий счёт: ${score}`);
});

// Команда для выдачи монет (только для администратора)
bot.onText(/\/givecoins (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const coins = parseInt(match[1]);

    if (msg.from.id.toString() === ADMIN_ID) {
        if (!playerScores[chatId]) {
            playerScores[chatId] = { score: 0, clicks: 0 };
        }
        
        playerScores[chatId].score += coins;
        bot.sendMessage(chatId, `Вы получили ${coins} монет! Ваш новый счёт: ${playerScores[chatId].score}`);
    } else {
        bot.sendMessage(chatId, 'У вас нет прав для использования этой команды.');
    }
});
