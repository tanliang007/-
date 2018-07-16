// pages/withdrawal/index.js
const app = getApp()
const http = require('../../../../utils/http.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wrong: false,
    wrongResult: '',
    Result: '',
    inputbalance: '', // 输入框的值
    remitFee: 0,      // 手续费
		actualtoaccount:0 // 实际到账的余额
  },
  availablebalance: 0, // 路由跳转过来的收益余额
  drawal:'', // 最终提现的金额
  minAmount: 0, // 最低提现金额
  maxAmount: 0, // 最高提现金额

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.availablebalance = options.withdrawalbalance
    this.setData({
      Result: '可用结存' + this.availablebalance / 100 + '元',
			actualtoaccount: `0元`
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // 接口查询提现信息
    http.get({
      url: '/bonus/settle-info',
      requireAuth: true,
      success: res => {
        if (res.statusCode === 200) {
          console.log(res);
          this.minAmount = res.data.minAmount / 100
          this.maxAmount = res.data.maxAmount / 100
          this.setData({
            remitFee: res.data.remitFee / 100
          })

        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  // 自定义事件
	startCharge(e) { // 提现接口
    console.log(e)
		// 请填写姓名
			
    var re = /\./g
    if (this.drawal.indexOf(".") > -1) {
      if (this.drawal.match(re).length >= 2) {
        this.setData({
          inputbalance: ''
        })
        this.drawal = ''
        wx.showToast({
          title: '金额格式不正确',
          icon: 'none'
        })
      }
			 
    }

		if (e.detail.value.realName === '') {
			wx.showToast({
				title: '请填写姓名',
				icon: 'none'
			})
			return 
		}

    if (!this.data.wrong && this.drawal) {
			console.log('开始提现了', this.data.wrong, this.drawal)
			console.log( app.getAvatarAndName().nickName)
      wx.showModal({
        title: '确定提现吗',
        content: '',
        success: (res) => {
          if (res.confirm) {
						let sendobj = {
							amount: Math.round(this.drawal * 100) ,
							realName:e.detail.value.realName,
							wxFormId: e.detail.formId,
							nickName: app.getAvatarAndName().nickName
						}
            console.log(sendobj,'提现申请的请求参数')
						http.post({
              url: '/bonus/settle',
              requireAuth: true,
							data: sendobj,
              success: (res) => {
								console.log(res)
                if (res.statusCode === 200) {
                  // 跳走
									wx.redirectTo({
										url: './applicationsuccess/index',
									})

                }
              }
            })

          }
        }
      })
    }
  },

  getmyBonus() {
    // 清空视图的值
    this.setData({
      inputbalance: ''
    })
    // 清除传给接口的值
    this.drawal = ''
    http.get({
      url: '/bonus/index',
      requireAuth: true,
      success: res => {
        if (res.statusCode === 200) {
          this.availablebalance = res.data.amount
          this.setData({
            Result: '可用余额' + this.availablebalance / 100 + '元'
          })

        }
      }
    });
  },

  // 小程序事件
  input(e) {
    var v = e.detail.value;

    if (v < this.minAmount) {
      console.log(`!最小提现金额为${this.minAmount}`)
      this.setData({
        wrong: true,
        wrongResult: `!最小提现金额为${this.minAmount}`
      })
    } else if (v > this.availablebalance / 100) {
      console.log('余额不足')
      this.setData({
        wrong: true,
        wrongResult: '!余额不足'
      })
      if (v > this.maxAmount) {
        this.setData({
          wrong: true,
					wrongResult: `最高提现金额${this.maxAmount}元`
        })
      }
    } else {
			console.log(v, this.data.remitFee)
		
			var actual = (v * 100 - this.data.remitFee * 100) / 100
			actual = Math.round(actual * 100) / 100
      this.setData({
        wrong: false,
				actualtoaccount: `${actual}元`,
				Result: '可用结存' + this.availablebalance / 100 + '元'
      })
    }


    console.log(v)

    // 替换支取小点后面2
    if (v.indexOf('.') > 0) {
      var v2 = v
      var n = (v2.split('.')).length - 1;

      if (n > 1) {
        console.log('多个点了')
        v = v.substring(0, v.indexOf('.'))
        if (this.availablebalance / 100 < v) {
          this.setData({
            wrong: true,
            wrongResult: '!余额不足'
          })
        }
      }

      var a = v.split('.')
      var b = a[1]
      if (b && b.length > 2) {
        v = v.substring(0, v.indexOf('.') + 3)
      }
    }

    if (v == '') {
      console.log('可用余额')
      this.setData({
        wrong: false,
				Result: '可用结存' + this.availablebalance / 100 + '元',
				actualtoaccount: `0元`
      })
    }

    this.drawal = v
    return v
  },

	allTurnOut(){

		// 全部提现的事件状态重置为正常
		console.log(this.availablebalance)
		
		this.setData({ inputbalance: this.availablebalance / 100 + "" })	

		if (this.data.inputbalance < this.minAmount) {
			console.log(`!最小提现金额为${this.minAmount}`)
			this.setData({
				wrong: true,
				wrongResult: `!最小提现金额为${this.minAmount}`
			})
		} else if (this.data.inputbalance > this.availablebalance / 100) {
			console.log('余额不足')
			this.setData({
				wrong: true,
				wrongResult: '!余额不足'
			})
			if (this.data.inputbalance > this.maxAmount) {
				this.setData({
					wrong: true,
					wrongResult: `最高提现金额${this.maxAmount}元`
				})
			}
		} else {
			var totalactual = (this.availablebalance - this.data.remitFee * 100) / 100
			totalactual = Math.round(totalactual * 100) / 100
       
			this.setData({
				wrong: false,
				actualtoaccount: `${totalactual}元`,
				Result: '可用结存' + this.availablebalance / 100 + '元',

			})
			this.drawal = this.data.inputbalance
		}


	}
})