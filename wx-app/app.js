//app.js
const http = require('./utils/http.js')
const auth = require('./utils/auth.js')
const client = require('./utils/client.js')
const constant = require('./utils/constant.js')
const logger = require('./utils/logger.js')

App({

    userInfo: null,
    firstShow: true,
    chargeStatus: constant.NO_CHARGING, // 充电状态
    chargeStatusCallbacks: [],
    chargeStatusData: {},
    chagePageShowing: false,
    listenDone: false, // 是否已完成监听
    lastChargeDoneEmitedTime: 0, // 上一次充电完成事件触发时间

    onLaunch: function() {
        logger.info('APP Launch ...')
            // 网络检测
        wx.getNetworkType({
                success: (res) => {
                    wx.setStorageSync('networkType', res.networkType)
                }
            })
            // 网络状态监听
        wx.onNetworkStatusChange((res) => {
                wx.setStorageSync('networkType', res.networkType)
            })
            // 登录
        auth.login(() => {
            //查询自己后台用户简介	
            logger.info('查询用户简介.')
            http.get({
                url: '/user/brief-info',
                requireAuth: true,
                success: res => {
                    logger.debug('APP /user/brief-info 返回：' + JSON.stringify(res.data))
                    if (res.statusCode === 200) {
                        let data = res.data
                        auth.saveUserInfo(data)
                        this.recoverChargeStatus()
                    } else {
                        logger.error('APP /user/brief-info 没有用户信息')
                        wx.removeStorageSync('user-info')
                        wx.removeStorageSync('recordId')
                        wx.removeStorageSync('curPileId')
                        wx.removeStorageSync('curPileTimeInfo')
                        wx.removeStorageSync('avatarAndname')
                    }
                }
            });
        })
        this.firstShow = true
    },

    onShow: function() {
        wx.getLocation({ //获取当前经纬
            fail: function(res) {
                console.log(res)
                if (res.errMsg == 'getLocation:fail:auth denied') {
                    wx.openSetting()
                }
            },
            success: function(res) {
                console.log(res)
            },
            complete: function(res) {
                console.log(res)
            }
        })
        if (!this.firstShow) {
            auth.checkSession()
        }
        this.checkChargeStatusAndPage()
        this.firstShow = false
    },

    setAvatarAndName(userInfo) {
        wx.setStorageSync('avatarAndname', userInfo)
    },

    getAvatarAndName() {
        return wx.getStorageSync('avatarAndname')
    },

    startListenStompMessage(recordId) {
        console.log('开始订阅。。。')
            // 监听充电启动通知
        console.log('APP ------ status = ' + this.getChargeStatus())
        if (this.getChargeStatus() == constant.WAIT_NOTICE) {
            console.log('APP ------ 监听 app-charge-started ')
            client.topic('/app-charge-started', data => {
                if (data.status == 0) { // 等待负载
                    this.updateChargeStatus(constant.WAIT_CHARGE, data)
                } else if (data.status == 1) { // 充电中
                    this.updateChargeStatus(constant.CHARGING, data)
                } else { // 故障
                    this.updateChargeStatus(constant.CHARG_FINISH, data)
                }
            })
        }
        // 监听接上负载通知
        client.topic('/ app-charge-payload', (data) => {
                console.log('APP topic / app-charge-payload')
                this.updateChargeStatus(constant.CHARGING, data)
            })
            // 监听充电暂停通知
        client.topic('/app-charge-suspend', (data) => {
                this.updateChargeStatus(constant.CHARG_SUSPEND, data)
            })
            // 监听充电继续通知
        client.topic('/app-charge-continue', (data) => {
                console.log('APP topic / app-charge-continue')
                this.updateChargeStatus(constant.CHARGING, data)
            })
            // 监听充电完成通知
        client.topic('/app-charge-done', (data) => {
            var now = Date.now() / 1000
            if (now - this.lastChargeDoneEmitedTime > 5) {
                this.updateChargeStatus(constant.CHARG_FINISH, data)
                this.lastChargeDoneEmitedTime = now
            }
        })

        client.start(wx.getStorageSync('user-info').id, () => {
            this.listenDoneCallback && this.listenDoneCallback()
            this.listenDone = true
        })
        client.onStoped(() => {
            this.listenDone = false
        })
        console.log('116app.js		recordId = ' + recordId)
        wx.setStorageSync('recordId', recordId);
    },

    stopListenStompMessage() {
        this.resetChargeStatus()
        client.stop()
        wx.removeStorageSync('recordId')
    },

    resetChargeStatus() {
        this.clearChargeStatusCallbacks()
        this.updateChargeStatus(constant.NO_CHARGING)
    },

    getChargeStatus() {
        return this.chargeStatus
    },

    updateChargeStatus(status, data) { //回调有了才会进来
        this.chargeStatus = status
        this.chargeStatusCallbacks.forEach(it => {
            if (it.status == status && it.callback) {
                it.callback(data)
            }
        })
        if (data) {
            this.chargeStatusData[status] = data
        }
        this.checkChargeStatusAndPage()
    },

    checkChargeStatusAndPage() {
        if ((this.chargeStatus == constant.CHARG_FINISH ||
                this.chargeStatus == constant.CHARG_SUSPEND) &&
            !this.chagePageShowing) {
            wx.redirectTo({
                url: '/pages/charge/control/index' // 充电的进度情况页面
            })
        }
    },

    registeChargeStatusCallback(status, callback) {
        if (this.getChargeStatus() == status) {
            callback(this.chargeStatusData[status])
        }
        this.chargeStatusCallbacks.push({
            status: status,
            callback: callback
        })
    },

    registeListenDoneCallback(callback) {
        if (this.listenDone) {
            callback()
        } else {
            this.listenDoneCallback = callback
        }
    },

    clearChargeStatusCallbacks() {
        this.chargeStatusCallbacks.splice(0, this.chargeStatusCallbacks.length)
        this.listenDoneCallback = null
        this.listenDone = false
    },

    setChagePageShowing(showing) {
        this.chagePageShowing = showing
    },

    /**
     * 恢复充电状态
     */
    recoverChargeStatus() {
        let success = (res) => {
            console.log(res, 'recoverChargeStatus++++++++++++++++')
            let recordId = res.data.id
                // 防止关闭微信在充电charge页面本地存储的curPileTimeInfo拿不到	
            wx.setStorageSync('curPileTimeInfo', {
                    hour: res.data.planHour,
                    port: res.data.port
                })
                // 防止关闭微信在充电的时候本地存储的curPileId拿不到	
            wx.setStorageSync('curPileId', res.data.pileId)
                // 更新充电charge页面的地名					
            wx.setStorageSync('siteName', res.data.siteName)
            wx.setStorageSync("pileNo", res.data.pileNo)
            wx.setStorageSync("pileAddress", res.data.pileAddress)
            wx.setStorageSync("siteAddress", res.data.siteAddress)

            let status = res.data.status
            if (status == 1) {
                // 充电中
                this.updateChargeStatus(constant.CHARGING)
                this.startListenStompMessage(recordId)
                console.log('退出情况下查询状态充电中')
            } else if (status == 2) {
                // 充电完成
                console.log('退出情况下查询状态充电完成')
                this.updateChargeStatus(constant.CHARG_FINISH, {
                    recordId: recordId,
                    message: '充电已完成'
                })
            } else if (status == 4) {
                this.updateChargeStatus(constant.CHARG_SUSPEND, {
                    recordId: recordId,
                    message: '充电已暂停'
                })
                this.startListenStompMessage(recordId)
            }
        }
        let recordId = wx.getStorageSync('recordId')
        if (recordId) {
            http.get({
                url: `/charge-record/show/${recordId}`,
                success: success
            })
        } else {
            // 防止recordId本地存取的问题
            http.get({
                url: `/charge-record/mine`,
                requireAuth: true,
                success: (res) => {
                    if (res.statusCode == 200) {
                        success(res)
                    } else {
                        console.log(res)
                    }
                }
            })
        }
    }


})