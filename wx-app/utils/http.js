const config = require('./config.js')

const endpoint = config.endpoint.https

var auth = null

function request(options) {

    // 网络检查
    let networkType = wx.getStorageSync('networkType')
    let networkNomeShowModal = wx.getStorageSync('networkNomeShowModal')
    if (networkType == 'none' && !networkNomeShowModal) {
        wx.showModal({
            title: '当前没有网络，请检查网络设置',
            content: '',
            showCancel: false,
            success: res => {
                wx.setStorageSync('networkNomeShowModal', false)
            }
        })
        wx.setStorageSync('networkNomeShowModal', true)
        return
    }

    var reg = new RegExp('^/')
    if (reg.test(options.url)) {
        options.url = endpoint + options.url
        options.data = options.data || {}
        options.data.lang = 'zh'
    }

    // 展示加载框
    if (options.showLoading) {
        if (options.loadingText) {
            wx.showLoading({
                title: options.loadingText,
            })
        } else {
            wx.showLoading({title: '  '})
        }
    }
		let complete = options.complete
		options.complete = function() {
			if (options.showLoading) {
				wx.hideLoading()
			}
			complete && complete()
		}
    let success = options.success
    options.success = function(res) {
			if (res.statusCode == 500) {
				wx.showModal({
						title: '后台出错啦',
						content: JSON.stringify(res.data),
				})
			} else if (res.statusCode == 1000) {
				wx.showModal({
						title: '您的版本太老啦，请杀掉进程重新打开小程序来触发更新吧',
						content: ''
				})
			} else {
				res.isOk = function() {
						return res.statusCode >= 200 && res.statusCode <= 300
				}
				success && success(res)
			}
    }

    // 是否需要令牌
    if (options.requireAuth) {
        if (!auth) {
            auth = require('./auth.js')
        }
        return auth.token(function(wxToken) {
            options.header = options.header || {}
            options.header['WX-Token'] = wxToken
            return wx.request(options)
        })
    } else {
        return wx.request(options)
    }
}


module.exports = {

    get: function(options) {
        options.method = 'GET'
        return request(options)
    },

    post: function(options) {
        options.method = 'POST'
        options.header = options.header || {}
        options.header['content-type'] = 'application/x-www-form-urlencoded'
        return request(options)
    },

    put: function(options) {
        options.method = 'PUT'
        return request(options)
    },

    delete: function(options) {
        options.method = 'DELETE'
        return request(options)
    }

}