/**
 * File: commands.js
 * Contains Telegram-Bot routines
 */
const telegramBot = require('node-telegram-bot-api')
const jsonFile = require('jsonfile')
const logger = require('./logger')
const db = require('./db')

module.exports = {

  run: function(config) {
    bot = new telegramBot(config.token, {
        polling: true
      })
      // Log message
    bot.onText(/.*/, function(msg, match) {
      //console.log(msg)
      logger.logMessage(msg)
    })

    // Greeting
    bot.onText(/\/start/, function(msg, match) {
      var chatId = msg.chat.id
      bot.sendMessage(chatId,
        'Hello there! I am *Tarchivebot*. I log all your messages and calculate statistics.\nSelfhost it yourself for full privacy: https://github.com/fuerbringer/Tarchivebot', {
          "parse_mode": "Markdown"
        }
      )
    })

    // Return user apikey
    bot.onText(/\/apikey/, function(msg, match) {
      // TODO move to apibackend.js
      db.conn.serialize(function() {
        db.conn.each("SELECT api_key FROM chat WHERE name = ?", msg
          .chat.id,
          function(err, row) {
            bot.sendMessage(msg.chat.id, 'Your API-Key:\n`' + row
              .api_key + '`', {
                'parse_mode': 'Markdown'
              })
          })
      })
    })
  }
}
