// pages/authorization/index.js
const app = getApp()
const http = require('../../utils/http.js')
const auth = require('../../utils/auth.js')
const logger = require('../../utils/logger.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        whetherthelogin: true,
        phoneBound: false
    },

    redirect_url: null,

    // 需要注册
    shouldRegiste: true,

    // 需要更新用户信息
    shouldUpdate: false,

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        if (options.redirect_url) {
            this.redirect_url = decodeURIComponent(options.redirect_url)
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        logger.info('AUTHORIZATION /user/brief-info 请求')
        http.get({
            url: '/user/brief-info',
            requireAuth: true,
            success: res => {
                console.log(res)
                if (res.statusCode === 200) {
                    logger.debug('AUTHORIZATION /user/brief-info 返回：' + JSON.stringify(res.data))
                    let data = res.data
                    if (!data.nickname || !data.avatar || data.nickname == 'undefined' || data.avatar == 'undefined') {
                        this.shouldUpdate = true
                    } else {
                        auth.saveUserInfo(data)
                    }
                    this.shouldRegiste = false
                } else {
                    this.shouldRegiste = true
                    logger.error('AUTHORIZATION /user/brief-info 没有用户信息')
                    wx.removeStorageSync('user-info')
                    wx.removeStorageSync('recordId')
                    wx.removeStorageSync('curPileId')
                    wx.removeStorageSync('curPileTimeInfo')
                    wx.removeStorageSync('avatarAndname')
                }
            }
        });
    },

    bindGetUserInfo: function(e) {
        if (e.detail.userInfo) {
            // 用户按了允许授权按钮
            let userInfo = {
                avatarUrl: e.detail.userInfo.avatarUrl,
                nickName: e.detail.userInfo.nickName
            }
            app.setAvatarAndName(userInfo)
            if (this.shouldRegiste) {
                this.setData({ phoneBound: true })
            } else if (this.shouldUpdate) {
                this.updateUserInfo(userInfo)
            } else {
                auth.setAuthorized()
                this.redirectToTarget()
            }
        }
    },

    // 处理之前头像undefined接口
    updateUserInfo(userInfo) {      
        http.post({
            url: '/user/update',
            requireAuth: true,
            data: {
                nickname: userInfo.nickName,
                avatar: userInfo.avatarUrl
            },
            success: (res) => {
                auth.setAuthorized()
                this.redirectToTarget()
            }
        })
    },

    // 注册成功回调
    onRegisteSuccess() {
        auth.setAuthorized()
        this.closeRegistDialog()
        this.redirectToTarget()
    },

    closeRegistDialog() {
        this.setData({ phoneBound: false })
    },

    redirectToTarget() {
        if (this.redirect_url) {
            wx.redirectTo({ url: this.redirect_url })
        } else {
            wx.redirectTo({ url: '/pages/index/index' })
        }
    }


})