const TelegramBot = require('node-telegram-bot-api');

// Укажите ваш токен
const token = '7572082955:AAHBY1VgVh1adY3jQgdPQWBbKiEmwD4-qa0';
const bot = new TelegramBot(token, { polling: true });

// Хранилища данных
let playerData = {}; // Информация о пользователях: монеты, энергия, скины
let leaderboards = []; // Турнирная таблица

// Константы для игры
const maxEnergy = 10; // Максимальное количество энергии
const energyRegenTime = 60000; // Время восстановления энергии (1 минута)

// Функция для проверки и восстановления энергии
function regenerateEnergy(chatId) {
    if (playerData[chatId].energy < maxEnergy) {
        playerData[chatId].energy++;
    }
}

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Инициализация игрока
    if (!playerData[chatId]) {
        playerData[chatId] = {
            coins: 0,
            energy: maxEnergy,
            skin: 'default', // Скин монеты по умолчанию
        };
        setInterval(() => regenerateEnergy(chatId), energyRegenTime); // Восстановление энергии
    }

    bot.sendMessage(chatId, 'Добро пожаловать в игру KLETKATAP! Используйте /play, чтобы начать.');
});

// Команда /play
bot.onText(/\/play/, (msg) => {
    const chatId = msg.chat.id;
    
    if (playerData[chatId].energy > 0) {
        // Уменьшение энергии и увеличение монет
        playerData[chatId].energy--;
        playerData[chatId].coins++;

        bot.sendMessage(chatId, `Вы заработали 1 монету! Ваш счет: ${playerData[chatId].coins} монет. Осталось энергии: ${playerData[chatId].energy}`);
    } else {
        bot.sendMessage(chatId, 'У вас закончилась энергия! Подождите немного, чтобы восстановить энергию.');
    }
});

// Команда /leaderboard
bot.onText(/\/leaderboard/, (msg) => {
    const chatId = msg.chat.id;

    // Сортируем игроков по количеству монет
    let leaderboard = Object.keys(playerData)
        .map(id => ({ id, coins: playerData[id].coins }))
        .sort((a, b) => b.coins - a.coins);

    let leaderboardMessage = '🏆 Турнирная таблица игроков:\n';
    leaderboard.forEach((player, index) => {
        leaderboardMessage += `${index + 1}. Игрок ${player.id}: ${player.coins} монет\n`;
    });

    bot.sendMessage(chatId, leaderboardMessage);
});

// Команда /skins
bot.onText(/\/skins/, (msg) => {
    const chatId = msg.chat.id;

    // Вывод доступных скинов
    bot.sendMessage(chatId, 'Выберите скин для вашей монеты:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Биткоин 💰', callback_data: 'skin_bitcoin' }],
                [{ text: 'Золотая монета 🪙', callback_data: 'skin_gold' }],
                [{ text: 'Обычная монета ⚪', callback_data: 'skin_default' }],
            ],
        },
    });
});

// Обработка выбора скинов
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data.startsWith('skin_')) {
        let skin = data.split('_')[1];
        playerData[chatId].skin = skin;

        bot.sendMessage(chatId, `Вы выбрали скин ${skin}!`);
    }
});
const ADMIN_ID = '@gmfdfff'; // Замените на ваш ID
bot.onText(/\/givecoins (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const amount = parseInt(match[1]); // Сколько монет выдать

    // Проверяем, является ли пользователь администратором
    if (msg.from.id.toString() === ADMIN_ID) {
        if (!playerScores[chatId]) {
            playerScores[chatId] = { score: 0, clicks: 0 };
        }

        playerScores[chatId].score += amount; // Добавляем монеты
        bot.sendMessage(chatId, `Вы выдали себе ${amount} монет! Текущий счёт: ${playerScores[chatId].score}`);
    } else {
        bot.sendMessage(chatId, 'У вас нет прав на выполнение этой команды.');
    }
});
