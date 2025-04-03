const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const token = '7833329625:AAEvrw3fPKvgczCCdNsBh3S-mKC8kW5Gp9I';
const bot = new TelegramBot(token, {polling: true});
const express = require('express')
const app = express()
const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

const webAppUrl = 'https://click-master-lime.vercel.app/';

const userSchema = new mongoose.Schema({
    // New fields
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [3, 'Full name must be at least 3 characters']
    },
    telegramId: {
        type: String,
        required: [true, 'Telegram ID is required'],
        unique: true,
        trim: true,
        match: [/^@?[\w\d_]{5,32}$/, 'Please enter a valid Telegram ID']
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
        required: true
    },

    // Legacy fields maintained for compatibility
    username: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default : null
    },
    role: {
        type: String,
        enum: ['admin', 'moderator', 'user'],
        default: 'user',
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    lastWatchTime: {
        type: Date,
        default: null
    },
    adsWatched: {
        type: Number,
        default: 0
    },
    lastResetDate: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

mongoose.connect('mongodb+srv://admin:admin@atlascluster.nei8u.mongodb.net/clickmasterads')
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Failed to connect to MongoDB:', err));


const startHandler = async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.chat.first_name;
    const lastName = msg.chat.last_name;
    const username = msg.chat.username;
    
    try {
        const user = await User.findOne({ telegramId: chatId.toString() });
  
     if(!user){
         
        user = await User.create({
            telegramId: userId,
            fullName: `${firstName} ${lastName}`.trim(),
            username: username,
            status: 'active',
            role: 'user',
            balance: 0,
            totalEarnings: 0,
            lastWatchTime: null,
            adsWatched: 0,
            lastResetDate: null
        });

        return bot.sendMessage(
            chatId,
            `Welcome ${firstName}! Your account has been created successfully.`,
            {
                reply_markup: {
                    inline_keyboard: [[
                        {
                            text: '🎯 Open Mini App',
                            web_app: { url: webAppUrl }
                        }
                    ]]
                }
            }
        );
     }
      
     return  bot.sendMessage(
        chatId,
        `Welcome back ${firstName}!`,
        {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: '🎯 Open Mini App',
                        web_app: { url: webAppUrl }
                    }
                ]]
            }
        }
    );
     
    } catch (error) {
        bot.sendMessage(chatId, 'Something went wrong, please try again later.');
    }
};

bot.onText(/\/start/, startHandler);

console.log('Bot started');
