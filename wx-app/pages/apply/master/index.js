const http = require('../../../utils/http.js')
Page({
    /**
     * 页面的初始数据
     */
    data: {
        phoneBound: false, //是否注册显示
        selected: true,
        area: '', // 三省联动数据
        time: '获取验证码',
        VerificationCode: true, // 倒计时样式切换
        currentTime: 60, // 初始化倒计时时间
    },
    onReady() {

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

    },

    // ---- 自定义事件 ---- 
    //切换标题以及个人企业
    personal(e) {
        this.setData({
            selected1: false,
            selected: true,
            condition: false
        })
    },

    Corp(e) {
        this.setData({
            selected: false,
            selected1: true,
            condition: true
        })
    },

    getVerificationCode(e) { // 获取验证码接口
        console.log(e.currentTarget.id)
        if (e.currentTarget.id === 'countdownnow') {
            console.log('正在倒计时无法点击');
            return
        }
        this.getCode()
    },

    getCode: function() { // 倒计时方法
        var mobile = this.data.mobile
        console.log(mobile)
        if (!mobile) {
            wx.showToast({
                title: '请先填写手机号',
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
        // 调验证码接口
        http.post({
            url: '/comm/captcha',
            success(res) {
                console.log(res)
                if (res.statusCode === 200) {
                    wx.showToast({
                        title: '发送短信验证码成功，请注意查看您的手机',
                        icon: 'none'
                    })
                } else {
                    wx.showToast({
                        title: res.data,
                        icon: 'none',
                        duration: 2000
                    })
                }
            }
        });

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
                    currentTime: 10,
                    VerificationCode: true
                })
            }
        }, 1000)

    },

    onMyEvent: function(e) { // 第一次注册成功会回调这个函数自动隐藏弹框
        this.setData({
            phoneBound: false
        })
    },

    ////////小程序api/////////
    formSubmit: function(e) { // 表单提交事件
        var reg = /\s+/g
        var formdata = e.detail.value
        console.log('form发生了submit事件，携带数据为：', e.detail.value)
            /////发送请求/////
            //共有校验表单验证
        formdata.realName = formdata.realName.replace(/\s/g, "")
        if (formdata.realName == '') {
            wx.showToast({
                title: '姓名不能为空',
                icon: 'none',
                duration: 1000
            })
            console.log('姓名不能为空')
            return false
        }
        formdata.address = formdata.address.replace(/\s/g, "")
        if (formdata.address === '') {
            wx.showToast({
                title: '请选择所在地',
                icon: 'none',
                duration: 1000
            })
            console.log('请选择所在地')
            return false
        }
        // formdata.addressDetail = formdata.addressDetail.replace(/\s/g, "")
        // if (formdata.addressDetail === '' ) {
        // 	wx.showToast(
        // 		{
        // 			title: '请填写详细地址',
        // 			icon: 'none',
        // 			duration: 1000
        // 		}
        // 	)
        // 	console.log('请填写详细地址')
        // 	return false
        // }

        if (formdata.hasOwnProperty('orgCode')) { //区别类型
            formdata.type = 2
            formdata.orgCode = formdata.orgCode.replace(/\s/g, "")
            if (formdata.orgCode == '') {
                wx.showToast({
                    title: '请填写组织机构代码',
                    icon: 'none',
                    duration: 1000
                })
                console.log('请填写组织机构代码')
                return false
            }
        } else {
            formdata.type = 1
        }
        wx.showLoading({
            title: '加载中...',
        })
        http.post({
            url: '/agent/apply',
            data: formdata,
            requireAuth: true,
            success(dk) {
                console.log(dk)
                var backdata = dk
                if (dk.statusCode === 200) {
                    wx.hideLoading()
                        // 说明已经有了申请
                    wx.showModal({
                        title: '申请成功请耐心等候',
                        content: '',
                        showCancel: false,
                        success: (res) => {
                            if (res.confirm) {
                                // 更新本地用户信息（有代理商了）
                                var old = wx.getStorageSync('user-info');
                                var agent = Object.assign(old, backdata.data);
                                wx.setStorageSync('user-info', agent);
                                console.log(wx.getStorageSync('user-info'), '创建代理商合并的json')
                                    // 调到申请中页面
                                wx.redirectTo({ url: '../complete/index' })
                            }
                        }
                    })
                } else {
                    wx.showToast({
                        title: dk.data,
                        icon: 'none',
                        duration: 2000
                    })
                }
            }
        });
    },

    bindRegionChange(e) { // 选择省市事件
        var citydArr = e.detail.value
        var showarea = citydArr[0] + ' ' + citydArr[1] + ' ' + citydArr[2]
        this.setData({ // 视图
            area: showarea
        })
    },

})