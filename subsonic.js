// Subsonic API documentation http://www.subsonic.org/pages/api.jsp
'use strict';

const TeleBot = require('./');
const bot = new TeleBot('-YOUR_TELEGRAM_BOT_API_TOKEN-');// Required. Telegram Bot API token.

const API_DOMAIN = 'http://YOUR_SERVER/rest/';// Required. Your url server.
const API_USER = 'YOUR_USER';// Required. Your user for the API.
const API_PASSWORD = 'YOUR_MD5';// Required. Generate your MD5 password with salt phrase.
const API_PASSWORD_SALT = 'YOUR_MD5_SALT';// Required. Your salt phrase.
const API_CONFIG = `.view?f=json&u=${API_USER}&t=${API_PASSWORD}&s=${API_PASSWORD_SALT}&v=1.14.0&c=TelegramBot`;
const getAPI = (urlAPI, optQuery = '') => API_DOMAIN + urlAPI + API_CONFIG + optQuery;

const request = require('request');
const body = '';

bot.on('/playing', msg => {
    const id = msg.chat.id;

    request(getAPI('getNowPlaying'), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const obj = JSON.parse(body);
            const getPlayers = obj['subsonic-response'].nowPlaying.entry;

            if(getPlayers != undefined) {
                const numberPlayers = getPlayers.length
                const arrayPlayers = [];

                for(var i = 0; i < numberPlayers; i++){
                    const getPlaying = getPlayers[i];

                    const getUser = getPlaying.username;
                    const getArtist = getPlaying.artist;
                    const getAlbum = getPlaying.album;
                    const getTitle = getPlaying.title;

                    arrayPlayers.push(`\n\n🎶 ${getUser} is listening:\n    ${getArtist} "${getAlbum}":\n     - ${getTitle}`);
                }
                return bot.sendMessage(id, 'Connected users:' + arrayPlayers);
            } else {
                var text = 'No users connected';
                return bot.sendMessage(id, text);
            }
        }
    })
});


bot.use(require('./modules/ask.js'));
bot.on('/search', msg => {
    const id = msg.from.id;
    return bot.sendMessage(id, '¿What song are you looking?', { ask: 'allSongs' });
});

let arraySongsId = [];
let arraySongsCover = [];
let arraySongsTitle = [];

bot.on('ask.allSongs', msg => {
    const id = msg.from.id;
    const allSongs = msg.text;
    const songLimit = 50;

    request(getAPI('search3', `&query=${allSongs}&songCount=${songLimit}`), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const obj = JSON.parse(body);
            const getSong = obj['subsonic-response'].searchResult3.song;

            if(getSong != undefined) {
                var objLength = getSong.length;

                if(objLength <= 1) {}
                const arraySongs = [];
                for(var i = 0; i < objLength; i++){
                    const getSongs = getSong[i];

                    const getSongsId = getSongs.id;
                    const getSongsArtist = getSongs.artist;
                    const getSongsAlbum = getSongs.album;
                    const getSongsTitle = getSongs.title;
                    const getSongsCover = getSongs.coverArt;

                    arraySongs.push(`\n${i+1}: ${getSongsArtist} "${getSongsAlbum}" ${getSongsTitle}`);
                    arraySongsId.push(getSongsId);
                    arraySongsCover.push(getSongsCover);
                    arraySongsTitle.push(getSongsTitle);
                };
                const resultText = `What of this songs are you looking?\n ${arraySongs}\n\nTell me the song number`;
                return bot.sendMessage(id, resultText, { ask: 'songNumber' });
            } else {
                return bot.sendMessage(id, `No results with ${allSongs}, try with another search`, { ask: 'allSongs'});
            }
        }
    });
});

bot.on('ask.songNumber', msg => {
    const id = msg.from.id;
    const songNumber = msg.text;
    const coverSize = 600;

    const getFile = getAPI('stream',`&id=${arraySongsId[songNumber-1]}&format=mp3`);
    const getCover = getAPI('getCoverArt', `&size=${coverSize}&id=${arraySongsCover[songNumber-1]}`);

    return [
        bot.sendPhoto(id, getCover, {fileName: 'portada.jpg'}),
        bot.sendAudio(id, getFile, {fileName: `${arraySongsTitle[songNumber-1]}.mp3`}),
        bot.sendMessage(id, 'Here is the song'),
        arraySongsId.length = 0,
        arraySongsCover.length = 0,
        arraySongsTitle.length = 0
    ];
});


bot.on('/about', function(msg) {
  let text = '😽 El bot vasilon del Puerto';

  return bot.sendMessage(msg.chat.id, text);
});

bot.connect();
