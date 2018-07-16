const http = require('../../utils/http.js')
const auth = require('../../utils/auth.js')
const logger = require('../../utils/logger.js')
const app = getApp()
    // 用户手机注册模态框组件components/register/index.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {},

    /**
     * 组件的初始数据
     */
    data: {
        time: '获取验证码', //倒计时视图	
        VerificationCode: true, // 倒计时样式切换
        currentTime: 60, // 初始化倒计时时间
    },
	
    captchaClick: false, // 用户点击了获取验证码	

    /**
     * 组件的方法列表
     */
		ready(){
			this.userInfo = app.getAvatarAndName()
		},
    methods: {

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
                    title: '手机号码格式不正确',
                    icon: 'none',
                    duration: 1000
                })
                console.log('手机号码格式不正确')
                return false
            }
            if (this.captchaClick || e.currentTarget.id == 'countdownnow') {
                console.log('正在倒计时无法点击');
                return false
            }
            this.captchaClick = true
            this.getCode()
        },

        getCode: function(options) { //倒计时方法
            var mobile = this.mobile
            console.log(mobile)
                //调验证码接口
            http.post({
                url: '/comm/captcha',
                data: { phone: mobile },
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

        formSubmit: function(e) { // 绑定手机号事件
            var formdata = e.detail.value
                /////发送请求/////
                //共有校验表单验证
            if (formdata.phone === "") {
                wx.showToast({
                    title: '手机号码不能为空',
                    icon: 'none',
                    duration: 1000
                })
                console.log('手机号码不能为空')
                return false
            } else if (!/^1\d{10}$/.test(formdata.phone)) {
                wx.showToast({
                    title: '手机号码格式不正确',
                    icon: 'none',
                    duration: 1000
                })
                console.log('手机号码格式不正确')
                return false
            }

            if (formdata.captcha == "") {
                wx.showToast({
                    title: '验证码不能为空',
                    icon: 'none',
                    duration: 1000
                })
                console.log('验证码不能为空')
                return false
            }

            ///////发送post请求///////
						formdata.nickname = this.userInfo.nickName
						formdata.avatar = this.userInfo.avatarUrl
						console.log(formdata)
            logger.debug('新建用户formdata：' + JSON.stringify(formdata))
            http.post({
                url: '/user/wx-save',
                data: formdata,
                requireAuth: true,
                success: (res) => {
                    logger.debug('/user/wx-save 返回：' + JSON.stringify(res.statusCode))
                    if (res.statusCode === 200) {
                        wx.showToast({
                            title: '注册用户成功',
                            icon: 'success',
                            duration: 1000
                        })
                        //告诉父page去掉弹框						
                        // 在去查询一次 /user/brief-info
                        this.checkBriefInfo()
                    } else {
                        wx.showToast({ title: res.data, icon: 'none' })
                    }
                }
            });

        },

        checkBriefInfo() {
            http.get({
                url: '/user/brief-info',
                requireAuth: true,
                success: (res) => {
                    console.log('res = ', res)
                    if (res.statusCode === 200) {
                        let data = res.data
                        auth.saveUserInfo(data)
                        this.triggerEvent('onRegisteSuccess')
                    }
                }
            });
        },
        //////////小程序事件/////////////
        mobileInputEvent: function(e) { // 手机input失去焦点事件
            this.mobile = e.detail.value
        },

        //自定义事件
				closeDialog() {
            this.triggerEvent('shouldCloseRegistDialog')
        }
    }
})