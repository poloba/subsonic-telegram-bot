# Telegram bot for subsonic

Connect and interact with your subsonic server using a telegram bot, powered with node.js and telebot.


## Install
Requisites:
- [node.js](https://nodejs.org/en/download/)
- [npm](https://www.npmjs.com/get-npm)

```
git clone https://github.com/poloba/subsonic-telegram-bot.git
npm install
```

Remember to change this parameters:
```
const bot = new TeleBot({
    token: 'bot_telegram_token',
    usePlugins: ['askUser', 'commandButton'],
});

const API_DOMAIN = 'https://your_server/rest/';
const API_USER = 'user';
const API_PASSWORD = 'md5_hash';
const API_PASSWORD_SALT = 'md5_hash_salt';
```

**How to generate your MD5 hash password**
1. Calculate the authentication token as follows: **token = md5(password + salt)**. The md5() function takes a string and returns the 32-byte ASCII hexadecimal representation of the MD5 hash, using lower case characters for the hex values. The '+' operator represents concatenation of the two strings. Treat the strings as UTF-8 encoded when calculating the hash.
2. For example: if the password is **sesame** and the random salt is **c19b2d**, then **token = md5("sesamec19b2d") = 26719a1196d2a940705a59634eb18eab**. The corresponding request URL then becomes:
```
https://your_server/rest/ping.view?u=user&t=26719a1196d2a940705a59634eb18eab&s=c19b2d&v=1.15.0&c=TelegramBot
```

After you have all installed and configurated simply **run your bot**:
```
npm run up
```

### Commands

**/playing**

- Retrieve all the listeners that are playing music.

**/search**

- You can search providing one or multiples keywords. The bot will return a list of button with the results.
Press the song that you want to listen and it will be send you a mp3 file with the cover.
- The mp3 file will be download to a temporal directory. When the file it is sent to telegram it will be deleted locally. 

**/about**

- Credits.


### External documentation

[Subsonic API ](http://www.subsonic.org/pages/api.jsp)
[Telebot](https://github.com/mullwar/telebot)
