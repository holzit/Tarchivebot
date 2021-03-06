const db = require('../db');

module.exports = {

  fetchLatest: function(key, amount, callback) {
    var data = []

    if (amount === null || isNaN(amount)) {
      amount = 1000
    }

    if (key !== null) {
      const query =
        `SELECT message.id, message.data, message.timestamp,
          chat.name AS chat_name, user.name AS user_name,
          user.first_name AS first_name, user.last_name AS last_name,
          message_type.name AS message_type
        FROM message
        JOIN chat ON message.chat_id=chat.id
        JOIN user ON message.user_id=user.id
        JOIN message_type ON message.message_type_id=message_type.id
        WHERE chat_id=(SELECT id FROM chat WHERE api_key=?)
        ORDER BY timestamp DESC`
      if (amount && !isNaN(amount)) {
        // An amount limit was specified
        const queryLimit = query + ' LIMIT ?'
        db.conn.all(queryLimit, key, amount, function(err, rows) {
          rows.forEach(function(row) {
            data.push(row)
          })
          callback(data)
        })
      } else {
        // Return all the messeges we've got
        db.conn.all(query, key, function(err, rows) {
          rows.forEach(function(row) {
            data.push(row)
          })
          callback(data)
        })
      }
    }
  },

  searchForMessages: function(key, amount, str, callback) {
    var data = []

    if (amount === null || isNaN(amount)) {
      amount = 1000
    }

    if (key !== null && str && (typeof str === 'string' || str instanceof String)) {
      const query =
        `SELECT message.id, message.data, message.timestamp,
          chat.name AS chat_name, user.name AS user_name,
          user.first_name AS first_name, user.last_name AS last_name,
          message_type.name AS message_type
        FROM message
        JOIN chat ON message.chat_id=chat.id
        JOIN user ON message.user_id=user.id
        JOIN message_type ON message.message_type_id=message_type.id
        WHERE chat_id=(SELECT id FROM chat WHERE api_key=?) AND
          (message.data LIKE ? OR message.data LIKE ? OR
          message.data LIKE ? OR  message.data LIKE ?)
        ORDER BY timestamp DESC`
      if (amount && !isNaN(amount)) {
        // An amount was specified
        const queryLimit = query + ' LIMIT ?'
        db.conn.all(queryLimit, key, str, '%' + str, str + '%', '%' + str +
          '%', amount,
          function(err, rows) {
            rows.forEach(function(row) {
              data.push(row)
            })
            callback(data)
          })
      } else {
        db.conn.all(query, key, str, '%' + str, str + '%', '%' + str + '%',
          function(err, rows) {
            rows.forEach(function(row) {
              data.push(row)
            })
            callback(data)
          })
      }
    } else {
      callback(data)
    }
  },

  validateApiKey: function(key, callback) {
    if (key !== null) {
      const query =
        `SELECT rowid
        FROM chat
        WHERE name != '' AND api_key=?
        LIMIT 1`

      db.conn.all(query, key, function(err, row) {
        var status = false
        if (row.length >= 1) {
          status = true
        }
        callback({
          'status': status
        })
      })
    } else {
      callback([])
    }
  }
}
