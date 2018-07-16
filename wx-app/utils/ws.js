var socketOpen = false
var socketMsgQueue = []

function sendSocketMessage(msg) {
    if (socketOpen) {
        wx.sendSocketMessage({
            data: msg
        })
    } else {
        socketMsgQueue.push(msg)
    }
}

var ws = {
    send: sendSocketMessage,
    close: function() {
        if (socketOpen) {
            wx.closeSocket()
        }
    },
    onopen: null,
    onmessage: null,
    onclose: null
}

ws.init = function(url, protocols) {

    wx.connectSocket({
        url: url,
        protocols: protocols
    })

    wx.onSocketOpen(function(res) {
        console.log('WebSocket连接已打开！-------------3434')
        wx.setStorageSync('ws-open', 1)
        socketOpen = true
        for (var i = 0; i < socketMsgQueue.length; i++) {
            sendSocketMessage(socketMsgQueue[i])
        }
        socketMsgQueue = []
        ws.onopen && ws.onopen()
    })

    wx.onSocketMessage(function(res) {
        ws.onmessage && ws.onmessage(res)
    })

    wx.onSocketClose(function(res) {
        socketOpen = false
        wx.setStorageSync('ws-open', 0)
        console.log('WebSocket 已关闭！')
        ws.onclose && ws.onclose()
    })
    console.log('54行ws.init触发了');

}

module.exports = ws