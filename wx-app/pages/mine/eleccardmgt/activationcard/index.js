// pages/mine/eleccardmgt/activationcard/index.js
const http = require('../../../../utils/http.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        time: '获取验证码', // 倒计时视图	
        VerificationCode: true, // 倒计时样式切换
        currentTime: 60, // 初始化倒计时时间
        Activationtypelist: []
    },
    captchaClick: false, // 用户点击了获取验证码	
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {},

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        // picker的列表
        this.makepricerange()
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    //////////小程序事件/////////////
    mobileInputEvent: function(e) { // 输入框实时事件
        this.mobile = e.detail.value
    },

    getVerificationCode(e) { // 获取验证码接口
        var mobile = this.mobile
        if (!mobile) {
            wx.showToast({
                title: '获取验证码之前请先填写手机号',
                icon: 'none',
                duration: 1000
            })
            console.log('获取验证码之前请先填写手机号')
            return false
        } else if (!/^1\d{10}$/.test(mobile)) {
            wx.showToast({
                title: '预留号码格式不正确',
                icon: 'none',
                duration: 1000
            })
            console.log('预留号码格式不正确')
            return false
        }

        if (this.captchaClick || e.currentTarget.id == 'countdownnow') {
            console.log('正在倒计时无法点击');
            return false
        }
        this.captchaClick = true
        console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++')
        this.getCode()
    },

    getCode: function(options) { //倒计时方法
        var mobile = this.mobile
        console.log(mobile)
            //调验证码接口
        http.post({
            url: '/comm/captcha',
            data: {
                phone: mobile
            },
            success: (res) => {
                console.log(res)
                if (res.statusCode === 200) {
                    var currentTime = this.data.currentTime
                    var interval = setInterval(() => {
                        currentTime--;
                        this.setData({
                            time: currentTime + '秒',
                            VerificationCode: false
                        })
                        if (currentTime <= 0) {
                            clearInterval(interval)
                            this.setData({
                                time: '重新发送',
                                currentTime: 60,
                                VerificationCode: true
                            })
                            this.captchaClick = false
                        }
                    }, 1000)
                    wx.showToast({
                        title: '发送短信验证码成功，请注意查看您的手机',
                        icon: 'none'
                    })
                } else {
                    this.captchaClick = false
                }
            },
        });
    },

    bindPowerChange(e) { // 选择激活金价格
        this.setData({
                showActivation: this.data.Activationtypelist[e.detail.value].showtext
            })
            // 传给后台的
        this.denominationId = this.data.Activationtypelist[e.detail.value].denominationId
    },

    makepricerange() { // 造激活面额选择的picker数据
        http.get({
            url: '/denomination/index',
            data: {
                type: 3
            },
            success: (res) => {
                console.log(res)
                var combination = []
                res.data.forEach(function(v) {
                    console.log(v)
                    var obj = {}
                    obj.showtext = '充' + v.rechargeAmount / 100 + '元 ,送' + v.bonusAmount / 100 + '元';
                    obj.denominationId = v.id
                    combination.push(obj)
                })
                console.log(combination)
                this.setData({
                    Activationtypelist: combination
                })
            }
        })
    },

    formSubmit(e) {
        var reg = /\s+/g
        var formdata = e.detail.value
        formdata.denominationId = this.denominationId
        if (formdata.cardNo == '') {
            wx.showToast({
                title: '充电卡号不能为空',
                icon: 'none'
            })
            return false
        } else if (formdata.cardNo.length != 10) {
            wx.showToast({
                title: '充电卡号长度为10位',
                icon: 'none'
            })
            return false
        }
        if (formdata.phone === "") {
            wx.showToast({
                title: '预留号码不能为空',
                icon: 'none'
            })
            return false
        } else if (!/^1\d{10}$/.test(formdata.phone)) {
            wx.showToast({
                title: '预留号码格式不正确',
                icon: 'none'
            })
            return false
        }
        if (formdata.captcha == "") {
            wx.showToast({
                title: '验证码不能为空',
                icon: 'none'
            })
            return false
        }
        //  else if (formdata.captcha.length !== 6) {
        // // 	wx.showToast({title: '验证码格式不正确',icon: 'none',duration: 1000})
        // // 	return false
        // // }
        if (!formdata.denominationId) {
            wx.showToast({
                title: '请选择激活金',
                icon: 'none',
                duration: 1000
            })
            return false
        }
        console.log(formdata, '通过验证发送求情的数据')
        wx.showModal({
            title: '确认激活该卡吗',
            content: '',
            success: (res) => {
                if (res.confirm) {
                    console.log('用户点击确定')
                    http.post({
                        url: `/card/enable`,
                        data: formdata,
                        showLoading: true,
                        requireAuth: true,
                        success: (res) => {
                            if (res.statusCode === 200) {
                                console.log(res)
                                this.wxTopup(res.data)
                            } else {
                                wx.showModal({
                                    title: res.data,
                                    showCancel: false,
                                    content: '',
                                })
                            }
                        }
                    })
                } else if (res.cancel) {

                }
            }
        })

    },

    wxTopup(payInfo) { // 微信支付方法
        wx.requestPayment({
            'timeStamp': payInfo.timestamp,
            'nonceStr': payInfo.noncestr,
            'package': payInfo.packageValue,
            'signType': payInfo.signType,
            'paySign': payInfo.sign,
            'success': function(res) {
                console.log(res, 'success进来了')
                if (res.errMsg === "requestPayment:ok") {
                    // 调试真机请求
                    wx.showModal({
                        title: '激活成功可以去添加卡了',
                        content: '',
                        showCancel: false,
                        success: () => {
                            wx.navigateBack({
                                delta: 1
                            })
                        }
                    })

                }

            },
            'fail': function(res) {
                wx.showToast({
                    title: '您取消了支付',
                    icon: 'none'
                })
            }
        })
    },

    saocard() { // 扫描桩点编号		
        wx.scanCode({
            success: (res) => {

                var patrn = /^[0-9]{10}$/;
                if (patrn.test(res.result)) {
                    // 是正确的10进制10位数
                    this.setData({
                        cardNo: res.result
                    })
                } else {
                    wx.showToast({
                        title: '扫码错误请手动输入卡号',
                    })
                }

            }
        })
    }
})