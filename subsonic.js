const request = require('request');
const https = require('https');
const fs = require('fs');
const TeleBot = require('telebot');

const bot = new TeleBot({
    token: 'bot_telegram_token',
    usePlugins: ['askUser', 'commandButton'],
});

const API_DOMAIN = 'https://your_server/rest/';
const API_USER = 'user';
const API_PASSWORD = 'md5_hash';
const API_PASSWORD_SALT = 'md5_hash_salt';
const API_CONFIG = `?u=${API_USER}&t=${API_PASSWORD}&s=${API_PASSWORD_SALT}&v=1.15.0&c=TelegramBot&f=json`;

const getAPI = (method, option = '') => API_DOMAIN + method + API_CONFIG + option;

bot.on('/playing', msg => {
    const id = msg.chat.id;

    request(getAPI('getNowPlaying'), (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const obj = JSON.parse(body);
            const players = obj['subsonic-response'].nowPlaying.entry;

            if (players != undefined) {
                players.map(player => {
                    const {username, artist, album, title} = player;
                    bot.sendMessage(id, `🎶 ${username} is listening: ${artist} "${album}": ${title}`);
                });
            } else {
                return bot.sendMessage(id, 'Upsss, nobody connected');
            }
        }
    });
});

bot.on('/search', msg => {
    return bot.sendMessage(msg.from.id, 'What song are you looking?', {ask: 'query'});
});

bot.on('ask.query', msg => {
    const id = msg.from.id;
    const query = msg.text;
    const songsLimit = 30;

    request(getAPI('search3', `&query=${query}&songCount=${songsLimit}`), (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const obj = JSON.parse(body);
            const songs = obj['subsonic-response'].searchResult3.song;

            if (songs != undefined) {
                const promise = songs.map(song => {
                    const {id, artist, album, title} = song;
                    return [
                        bot.inlineButton(`${artist} "${album}" ${title}`, {
                            callback: id,
                        }),
                    ];
                });
                const replyMarkup = bot.inlineKeyboard(promise);

                Promise.all(promise).then(() => {
                    return bot.sendMessage(
                        id,
                        'What of this songs are you looking? Choose the song and press the button',
                        {replyMarkup}
                    );
                });
            } else {
                return bot.sendMessage(id, `No results with ${query}, try with another search`, {
                    ask: 'query',
                });
            }
        }
    });
});

bot.on('callbackQuery', msg => {
    const id = msg.from.id;
    const idSong = msg.data;
    const getCoverUrl = getAPI('getCoverArt', `&id=${idSong}&size=600`);
    const getFileUrl = getAPI('stream', `&id=${idSong}&maxBitRate=192&format=mp3`);

    const fileSong = fs.createWriteStream(`tmp/${idSong}.mp3`);
    const getFileSong = https.get(getFileUrl, response => {
        bot.sendPhoto(id, getCoverUrl).then(() => bot.sendMessage(id, 'Uploading song...'));

        response.pipe(fileSong);
        fileSong.on('finish', () => {
            bot.sendAudio(id, fileSong.path)
                .then(() => fs.unlinkSync(fileSong.path))
                .catch(e => console.log(e));
        });
    });
    return getFileSong;
});

bot.on('/about', msg => bot.sendMessage(msg.chat.id, '😽 A subsonic telegram bot by Pol Escolar'));

bot.connect();
