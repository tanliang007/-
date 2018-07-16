const http = require('./http.js')
const logger = require('../utils/logger.js')
const saveWxToken = function(token) {
    if (token && token.wxToken && token.expiresIn) {
        token.expiresAt = Date.now() + token.expiresIn * 1000
        delete token.expiresIn
        wx.setStorageSync('wx-token', token)
    }
}

const getWxToken = function() {
    let token = wx.getStorageSync('wx-token')
    if (token && token.wxToken && token.expiresAt &&
        token.expiresAt > Date.now() + 30000) {
        return token.wxToken
    }
}

var logining = false
let loginSuccessCallbacks = []

const wxLogin = function(success) {
    if (success) {
        loginSuccessCallbacks.push(success)
    }
    if (logining) {
        return
    }
    logining = true
    logger.debug('微信登录。。。')
    var task = {
        aborted: false,
        abort: function() {
            task.aborted = true
            logining = false
            loginSuccessCallbacks.splice(0, loginSuccessCallbacks.length)
        }
    }
    wx.login({
        success: res => {
            if (task.aborted) {
                return
            }
            const requestTask = http.post({
                url: '/oauth/wx-signin',
                data: {
                    code: res.code
                },
                success: function(res) {
                    logger.debug('/oauth/wx-signin 接口登录返回：' + JSON.stringify(res.data))
                    saveWxToken(res.data)
                    logining = false
                    if (task.aborted) {
                        return
                    }
                    var newTaskList = []
                    loginSuccessCallbacks.forEach(callback => {
                        var newTask = callback(res.data.wxToken)
                        if (newTask && typeof newTask.abort == 'function') {
                            newTaskList.push(newTask)
                        }
                    })
                    loginSuccessCallbacks.splice(0, loginSuccessCallbacks.length)
                    task.abort = function() {
                        newTaskList.forEach(nTask => {
                            nTask.abort()
                        })
                    }
                },
                fail(res) {
                    logining = false
                    loginSuccessCallbacks.splice(0, loginSuccessCallbacks.length)
                    logger.error('AUTH:/oauth/wx-signin 请求失败！--- ' + JSON.stringify(res))
                }
            })
            task.abort = function() {
                task.aborted = true
                requestTask.abort()
            }
        },
        fail() {
            logining = false
            loginSuccessCallbacks.splice(0, loginSuccessCallbacks.length)
            logger.error('AUTH:微信登录失败！')
        }
    })
    return task
}


module.exports = {

    // 登录
    login: wxLogin,

    // 检查会话
    checkSession: function(success) {
        logger.debug('检查会话...')
        wx.checkSession({
            success: function() {
                logger.debug('检查会话成功')
                success && success()
            },
            fail: function() {
                logger.debug('检查会话失败，去微信登录')
                wxLogin(success)
            }
        })
    },

    // 取得令牌
    token: function(success) {
        let token = getWxToken()
        if (token) {
            return success(token)
        } else {
            logger.debug('没有令牌，去微信登录')
            return wxLogin(success)
        }
    },

    // 微信用户授权某项功能
    scope: function(scope, success, fail) {
        wx.getSetting({
            success(res) {
                console.log('检查授权设置：' + scope)
                if (res.authSetting['scope.' + scope]) {
                    console.log('已经授权')
                    success()
                } else {
                    console.log('调用授权，等待用户响应...')
                    wx.authorize({
                        scope: 'scope.' + scope,
                        success() {
                            console.log('授权成功！')
                            success && success()
                        },
                        fail() {
                            console.log('授权失败！')
                            fail && fail()
                        }
                    })
                }
            }
        })
    },

    saveUserInfo: function(data) { //存储自己后台用户信息
        wx.setStorageSync('user-info', data)
    },

		getUserInfo() {
			return wx.getStorageSync('user-info')
		},

    /**
     * 用户已微信授权
     */
    authorized: function() {
        return wx.getStorageSync('wx-authorized')
    },

    setAuthorized: function() {
        wx.setStorageSync('wx-authorized', true)
    }

}