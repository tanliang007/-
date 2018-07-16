const ws = require('./ws.js')
const Stomp = require('./stomp.js').Stomp
const config = require('./config.js')

const login = 'user'
const passcode = 'user123'
const endpoint = config.endpoint.wss

var userId = 0
var started = false
var subscribers = []
var stopCallback = null

Stomp.setInterval = function (interval, f) {
  return setInterval(f, interval)
};
Stomp.clearInterval = function (id) {
  clearInterval(id)
	subscribers.splice(0, subscribers.length)
	stopCallback && stopCallback()
	started = false
};

let client = Stomp.over(ws)

client.debug = function (msg) {
  console.log('STOMP: ' + msg)
}

function subscribe(destination, handler) {
  if (started) {
    client.subscribe(destination, function(frame) {
			handler(JSON.parse(frame.body), frame.headers)
    }, {
        selector: 'userId = ' + userId
    })
  } else {
    subscribers.push({
      destination: destination,
      handler: function (frame) {
				handler(JSON.parse(frame.body), frame.headers)
      }
    })
  }
}

module.exports = {

  topic: function (destination, handler) {
    subscribe('/topic' + destination, handler)
  },

  queue: function (destination, handler) {
    subscribe('/queue' + destination, handler)
  },

  start: function (_userId, callback) {
		if (started) {
			return
		}
    userId = _userId
    client.connect(login, passcode, function (frame) {
      started = true
      subscribers.forEach(function(it) {
        client.subscribe(it.destination, it.handler, {
          selector: 'userId = ' + userId
        })
      })
			callback && callback()
    }, function (error) {
      console.log('Connect Error:', error)
    })
    console.log('client 中的start触发了')
    ws.init(endpoint, ['v10.stomp', 'v11.stomp'])
  },

  stop: function() {
		if (started) {
			client.disconnect()
		}
		started = false
		stopCallback && stopCallback()
  },

	onStoped: function(callback) {
		stopCallback = callback
	}

}