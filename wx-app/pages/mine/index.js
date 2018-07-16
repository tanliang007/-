// pages/mine/index.js
const app = getApp()
const http = require('../../utils/http.js')
const auth = require('../../utils/auth.js')
const logger = require('../../utils/logger.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    noAgent: true, //	默认情况下是个人项显示
    walletAmount: '0', //	视图余额
    avatarUrl: '',
    phone: '',
    noAgent: false, // 显示个人选项
    isAgent: false, // 显示代理商选项
    sponsor: false, // sponsor控制显示收益桩点

    // 切换账号数据
    changeUsermodal: false, // 点击头像切换头像弹窗
    changeUserOrPhone: false,
    time: '获取验证码', //倒计时视图	
    VerificationCode: true, // 倒计时样式切换
    currentTime: 60, // 初始化倒计时时间
    titleText: '',
    bindtext: ''
  },
  captchaClick: false, // 用户点击了获取验证码	
  isjumpTositemanagementclicked: false, // 防止导航去代理商站点列表页面的多次点击

  agentId: '', //	是代理商跳转站点了列表页面使用	
  agentStatus: '',
  /**
   * 生命周期函数--监听页面显示
   */
  onLoad() {
    logger.debug('MINE INDEX')
  },

  onReady() {
    // 获取用户头像信息            
    // 头像都用getuseinfo接口存到本地的头像
    this.replaceUserinformation = app.getAvatarAndName()
    console.log(this.replaceUserinformation)
    this.setData({
      avatarUrl: this.replaceUserinformation.avatarUrl
    })
  },

  onShow: function() {
    //  调用接口查询余额
		this.queryBalance((userInfo) => {
			this.setData({
				phone: userInfo.phone
			})
		})

  },
	
  //---- 自定义事件 ----
  navtoTopup() { // 导航去平台充值页面
    this.isCreateBrief('./topup/index')
  },

  jumpToRecords() { // 导航去交易记录
    this.isCreateBrief('./records/index')
  },

  jumpToIncome() { // 导航去我的收益
    this.isCreateBrief('./bonus/index')
  },

  jumpToapplymaster() {
    if (this.agentStatus === 0) { //申请中,跳完成请等待页面
      wx.navigateTo({
        url: '/pages/apply/complete/index'
      })
    } else if (this.agentStatus === 2) {
      wx.showModal({
        title: '审核未通过',
        content: '',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/apply/master/index' // 创建个人或者企业桩主
            })
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/apply/master/index' // 创建个人或者企业桩主
      })
    }

  },

  jumptoNearSite() { // 跳转附近站点
    wx.navigateTo({
      url: '/pages/index/near-pites/index'
    })
  },

  jumpTositemanagement() { // 导航去代理商站点列表页面
    if (!this.isjumpTositemanagementclicked) {
      wx.navigateTo({
        url: `/pages/sites/index?agentId=${this.agentId}`
      })
      this.isjumpTositemanagementclicked = true
      setTimeout(() => {
        this.isjumpTositemanagementclicked = false
      }, 1000)
    }
    
  },

  jumptoCardManagement() { // 跳转到电卡管理页面
    this.isCreateBrief('./eleccardmgt/index')
  },

  queryBalance(call) { // 检查是否是代理商和检查余额   ` 
    http.get({
      url: '/user/brief-info',
      requireAuth: true,
      success: res => {
        console.log(res)
        if (res.statusCode === 200) {
          auth.saveUserInfo(res.data)
          this.setData({
            walletAmount: res.data.walletAmount,
            sponsor: res.data.sponsor,
						bonus: res.data.bonus
          })
          let userInfo = auth.getUserInfo()
					// 重新赋值号码

          call && call(userInfo)
          // 动态显示收益桩点
          if (res.data.agentId || res.data.agentId == 0) {
            if (res.data.agentStatus == 1) { //审核通过站点管理页面
              this.setData({
                isAgent: true, //切换成代理商		
                noAgent: false
              })

              this.agentId = res.data.agentId
              this.agentStatus = res.data.agentStatus
            } else if (res.data.agentStatus == 0) { //申请中,跳完成请等待页面
              console.log('申请中')
              this.agentStatus = res.data.agentStatus
              this.setData({
                isAgent: false, //切换成代理商			
              })
            } else if (res.data.agentStatus == 2) { // 审核拒绝	
              this.agentStatus = res.data.agentStatus
              this.setData({
                isAgent: false, //切换成代理商			
								noAgent:true
              })
            }
          } else {
            this.setData({
              noAgent: true, //切换成不是代理商		
              isAgent: false, //切换成不是代理商					
            })

          }

        }
      }
    });
  },
  // 跳转收益桩点
  jumpToPilePointReturn() {
    wx.navigateTo({
      url: './pilepointreturn/index',
    })
  },

  isCreateBrief(navUrl) {
    wx.navigateTo({
      url: navUrl
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
          this.interval = setInterval(() => {
            currentTime--;
            this.setData({
              time: currentTime + '秒',
              VerificationCode: false
            })
            if (currentTime <= 0) {
              clearInterval(this.interval)
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

    if (this.changeType == 'x') {
      console.log(formdata)
      // 调用更换手机号接口
      http.post({
        url: '/user/changePhone',
        showLoading: true,
        requireAuth: true,
        data: formdata,
        success: (res) => {
          if (res.statusCode == 200) {
            console.log(res)
            this.queryBalance((userInfo) => {
              this.setData({
                phone: userInfo.phone
              })
              this.closeDialog()
            })

            // logger.debug('MINE avatarUrl = ' + userInfo.avatar)
          } else {
            console.log(res)
            wx.showModal({
              title: res.data,
              content: '',
              showCancel: false
            })
          }
        }

      })
    } else if (this.changeType == 'y') {
      // 调用更换用户接口
      ///////发送post请求///////
      formdata.nickname = this.replaceUserinformation.nickName
      // app.getAvatarAndName()
      formdata.avatar = this.replaceUserinformation.avatarUrl
      console.log(formdata)
      http.post({
        url: '/user/switchUser',
        showLoading: true,
        requireAuth: true,
        data: formdata,
        success: (res) => {
          if (res.statusCode == 200) {
            console.log(res,'切换成功');
            // 清除recordID  
            app.stopListenStompMessage()
            app.recoverChargeStatus()
            this.queryBalance((userInfo) => {
							console.log(userInfo, '账号切换成功回调函数')
							console.log('switchUser')
							wx.showToast({
								title: '账号切换成功',
								icon: 'none'
							})
              // this.closeDialog()   
							setTimeout(()=>{
								wx.reLaunch({
									url: '/pages/index/index',
								})
							},1000)
            })

          } else {
            console.log(res)
            wx.showModal({
              title: res.data,
              content: '',
              showCancel: false
            })
          }
        }

      })

    }






  },

  mobileInputEvent: function(e) { // 手机input失去焦点事件
    this.mobile = e.detail.value
  },

  // 切换按钮点击事件
  changeoPerate(e) {
    this.setData({
      changeUsermodal: false
    })
    console.log(e.currentTarget.dataset.type)
    var type = e.currentTarget.dataset.type
    if (type == 'x') {
      this.setData({
        changeUserOrPhone: true,
        titleText: '更换手机号',
        bindtext: '立即绑定'
      })
      // 设置变量来记录表单发送那个接口
      this.changeType = 'x'


    } else if (type == 'y') {
      this.setData({
        changeUserOrPhone: true,
        titleText: '切换账号',
        bindtext: '立即切换'
      })
      this.changeType = 'y'

    }


  },
  // 关闭弹窗切换穿久
  closeDialog() {
    clearInterval(this.interval)

    this.setData({
      changeUserOrPhone: false,
      VerificationCode: true,
      time: '获取验证码'
    })
		wx.setNavigationBarColor({
			frontColor: '#ffffff',
			backgroundColor: '#24c771'
		})
    this.captchaClick = false
  },
	// 关闭mask
	hidechangeUsermodal(){
		this.setData({
			changeUsermodal: false
		})
		wx.setNavigationBarColor({
			frontColor: '#ffffff',
			backgroundColor: '#24c771'
		})
	},
  // 切换用户头像控制窗口出现
  controlChangeUserModal() {
    this.setData({
      changeUsermodal: true
    })
		wx.setNavigationBarColor({
			frontColor: '#ffffff',
			backgroundColor: '#0e4f38'
		})
  },

  hideControlChangeUserModal() {
    this.setData({
      changeUsermodal: false
    })
		wx.setNavigationBarColor({
			frontColor: '#ffffff',
			backgroundColor: '#24c771'
		})
  }
})