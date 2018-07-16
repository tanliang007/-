// pages/mine/eleccardmgt/index.js
const http = require('../../../utils/http.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        aa: 12,
        cardList: '', // 卡列表
        nocard: false, // 是否显示无卡提示
        selectedList: [], // 切换下拉框样式
        time: '获取验证码', // 倒计时视图	
        VerificationCode: true, // 倒计时样式切换
        currentTime: 60, // 初始化倒计时时间
        showcardmodal: false,
        phone: "", //  手机号码框的值
        captcha: "" //  验证码的值
    },
    captchaClick: false, // 用户点击了获取验证码	
		showmoreMdoal:[],
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        http.get({
            url: '/card/index',
            requireAuth: true,
            success: (res) => {        
                if (res.statusCode == 200) {     
										for(var i = 0 ; i < res.data.length ; i++){
											res.data[i].moreShowStau = false
										}
										console.log(res)
                    this.setData({
                        cardList: res.data
                    })

                }
            },
            fail: (err) => {
                console.log(err)
            }
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    // 自定义事件
    navtoActivationCard() { // 跳转到激活页面,必须先激活才能添加卡
        wx.navigateTo({
            url: './activationcard/index',
        })
    },

    navtoSubStitute() { // 跳转到代充页面
        wx.navigateTo({
            url: './substitute/index',
        })
    },

    navtoAddElecard() { // 新增充电卡
        wx.navigateTo({
            url: './addelecard/index',
        })
    },

    // 自定义事件
    Delete(e) {
        console.log(e)
        var cardNo = e.currentTarget.dataset.cardno
        console.log(cardNo)
        var delId = e.currentTarget.dataset.delid
        wx.showModal({
            title: '确认解绑电卡:' + cardNo + '吗?',
            content: '',
            success: (res) => {
                if (res.confirm) {
                    http.delete({
                        url: `/card/delete/${delId}`,
                        requireAuth: true,
                        success: (res) => {
                            console.log(res)
                            if (res.isOk()) {
                                //  删除的是user_id
                                console.log(res)
                                    // 删除成功刷新页面
                                this.pullcardList()
                            } else {
                                wx.showToast({ title: res.data, icon: 'none' })
                            }

                        },
                        fail: (err) => {
                            console.log(err)
                        }
                    })

                } else {

                }
            }
        })
    },

    loss(e) { // 点卡挂失
        // 初始化注册框
        this.curglobalcardNo = e.currentTarget.dataset.cardno
        wx.showModal({
            title: '确认挂失电卡:' + this.curglobalcardNo + '吗?',
            content: '',
            success: (res) => {
                if (res.confirm) {
                    this.mobile = ''
                    clearInterval(this.interval)
                    this.setData({
                        phone: '',
                        captcha: '',
                        time: '获取验证码',
                        currentTime: 60,
                        VerificationCode: true
                    })
                    this.captchaClick = false
                        // 设置变量判断是挂失还是找回
                    this.setData({ judge: 0 })
                    this.curglobalcardId = e.currentTarget.dataset.id
                    this.setData({ showcardmodal: true })
                }
            }
        })

    },

    backto(e) { // 电卡找回
        // 初始化注册框
        this.curglobalcardNo = e.currentTarget.dataset.cardno
        wx.showModal({
            title: '确认找回电卡:' + this.curglobalcardNo + '吗?',
            content: '',
            success: (res) => {
                if (res.confirm) {
                    this.mobile = ''
                    clearInterval(this.interval)
                    this.setData({
                        phone: '',
                        captcha: '',
                        time: '获取验证码',
                        currentTime: 60,
                        VerificationCode: true
                    })
                    this.captchaClick = false
                    this.setData({ judge: 1 })
                    this.curglobalcardNo = e.currentTarget.dataset.cardno
                    this.curglobalcardId = e.currentTarget.dataset.id
                    this.setData({ showcardmodal: true })	
                } else {

                }
            }
        })

    },

    changeName(e) {
        var x = e.currentTarget.dataset.index
        this.setData({
            ['selectedList[' + x + ']']: this.data.selectedList[x] ? null : x + 1
        })

				for (var i = 0; i < this.data.selectedList.length; i++){
					if (!this.data.selectedList[i]){
						this.data.cardList[i].moreShowStau =false
					 }			
				}
				this.setData({ cardList:this.data.cardList})	
        // console.log(this.data.selectedList)
    },

    // 拉取电卡列表接口
    pullcardList() {
        http.get({
            url: '/card/index',
            requireAuth: true,
            success: (res) => {
                if (res.statusCode == 200) {
                    if (res.data.length == 0) {
												
                        this.setData({
                            nocard: true,
														cardList: res.data
                        })

                    } else {
											var retunrnmap = this.data.cardList.map((item, index) => {
												return Object.assign(item, res.data[index])
											})
											console.log(retunrnmap, '-=-=-=-=-=-=-=-=')		
                        console.log('返回走了')
                        this.setData({
													cardList: retunrnmap
                        })
                    }
                }
            },
            fail: (err) => {
                console.log(err)
            }
        })
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
        console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++')
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
                    this.interval = setInterval(() => {
                        currentTime--;
                        this.setData({
                            time: currentTime + '秒',
                            VerificationCode: false
                        })
                        if (currentTime <= 0) {
                            clearInterval(this.interval)
                            this.setData({
                                time: '重新获取',
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
        console.log('form发生了submit事件，携带数据为：', e.detail.value)
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

        console.log(formdata)
        if (this.data.judge == 0) {
            console.log(formdata, this.curglobalcardId)
            http.post({
                url: `/card/set-lost/${this.curglobalcardId}`,
                requireAuth: true,
                data: formdata,
                success: (res) => {
                    console.log('/card/set-lost   res = ', res)
                    if (res.statusCode == 200) {
                        console.log(res)
                            // 挂失成功刷新页面
                        this.pullcardList()
                        this.setData({ showcardmodal: false })
                        wx.showToast({ title: '挂失成功', icon: 'none' })
                    } else {
                        wx.showToast({ title: res.data, icon: 'none' })
                    }

                },
                fail: (err) => {
                    console.log(err)
                }
            })

        } else {

            console.log(formdata, this.curglobalcardId)
            http.post({
                url: `/card/get-back/${this.curglobalcardId}`,
                data: formdata,
                requireAuth: true,
                success: (res) => {
                    if (res.statusCode == 200) {
                        console.log(res)
                            // 找回成功刷新页面
                        this.pullcardList()
                        this.setData({ showcardmodal: false })
                        wx.showToast({ title: '找回成功', icon: 'none' })
                    } else {
                        wx.showToast({ title: res.data, icon: 'none' })
                    }
                },
                fail: (err) => {
                    console.log(err)
                }
            })
        }

    },

    //////////小程序事件/////////////
    mobileInputEvent: function(e) { // 手机input失去焦点事件
        this.mobile = e.detail.value
    },

    // 隐藏弹框事件
    maskhide() {
        this.setData({ showcardmodal: false })
    },

		// 电卡转入到余额中	
		rollOut(e){
			var id = e.currentTarget.dataset.id
			var availablebalance = e.currentTarget.dataset.availablebalance
			var cardNum = e.currentTarget.dataset.cardnum
			wx.navigateTo({
				url: `./rollinorout/index?id=${id}&cardNum=${cardNum}&availablebalance=${availablebalance}&type=${0}`,

			})
		},

		// 查询余额
		serachWalletBalance(id, cardNum){
			http.get({
				url: '/wallet/balance',
				requireAuth: true,
				success:(res)=>{
					console.log(res)
					if ( res.statusCode == 200 ){
						var availablebalance = res.data.amount
						wx.navigateTo({
							url: `./rollinorout/index?id=${id}&cardNum=${cardNum}&availablebalance=${availablebalance}&type=${1}`,
					})
					}					

				}
			})
		},

		rollIn(e){
			var id = e.currentTarget.dataset.id
			var cardNum = e.currentTarget.dataset.cardnum
			console.log(e)
			this.serachWalletBalance(id, cardNum)		
	
		},

		// 根据索引来控制当前的显示
		controlmoresuspension(e){
			for (var i = 0; i < this.data.cardList.length;i++){
				if ( i == e.currentTarget.dataset.i){
					this.data.cardList[i].moreShowStau = !e.currentTarget.dataset.moreshowstau
				}else{
					this.data.cardList[i].moreShowStau = false      
				}
			
			}
		
			this.setData({
				cardList: this.data.cardList
			})

		}
})