// pages/mine/bonus/transfer/index.js
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
    type: ''
  },
  viewamount: '',
  withdrawal: '',
  drawal: '',
  cardId: '', //卡片Id
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.availablebalance = options.availablebalance
    this.cardId = options.id
		console.log(options,'+=+=+++===========')
    // 判断是转入还是转出
    this.setData({
      type: options.type,
			cardNum: options.cardNum
    })
    console.log(options)
    this.data.type == 0 ? wx.setNavigationBarTitle({
      title: '转出到余额'
    }) : wx.setNavigationBarTitle({
      title: '转入到电卡'
    })

    console.log('type类型是' + this.data.type)
    this.setData({
      Result: '可用余额' + this.availablebalance / 100 + '元'
    })

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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  // 自定义事件
  sure() { // 提现接口
    console.log(this.data.wrong, this.drawal)
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

    if (!this.data.wrong && this.drawal) {
      console.log(this.drawal)
			if(this.data.type == 0){
				wx.showModal({
					title: '确定转出到余额吗',
					content: '',
					success: (res) => {
						if (res.confirm) {
							http.post({
								url: '/card/transfer-to-wallet',
								requireAuth: true,
								data: {
									id: this.cardId,
									amount: Math.round(this.drawal * 100)
								},
								success: (res) => {
									if (res.statusCode === 200) {
										console.log(res)
										this.updateCardAmount()
										wx.showToast({
											title: '转出成功',
											icon: 'none'
										})
									}
								}
							})

						}
					}
				})
			}else{
				wx.showModal({
					title: '确定转入到卡片吗',
					content: '',
					success: (res) => {
						if (res.confirm) {
							http.post({
								url: '/wallet/transfer-to-card',
								requireAuth: true,
								data: {
									cardId: this.cardId,
									amount: Math.round(this.drawal * 100)
								},
								success: (res) => {
									if (res.statusCode === 200) {
										console.log(res)
										this.updateWalletAmount()
										wx.showToast({
											title: '转入成功',
											icon: 'none'
										})
									}
								}
							})

						}
					}
				})
			}
     
    }
  },

	// 更新卡片余额
  updateCardAmount() {
			
    this.availablebalance = this.availablebalance - Math.round(this.drawal * 100)
    this.setData({
      Result: '可用余额' + this.availablebalance / 100 + '元'
    })
    // 清空视图的值
    this.setData({
      inputbalance: ''
    })
    // 清除传给接口的值
    this.drawal = ''


  },

	// 更新钱包余额
	updateWalletAmount(){
		// 清空视图的值
		this.setData({ inputbalance: '' })
		// 清除传给接口的值
		this.drawal = ''
		http.get({
			url: '/wallet/balance',
			requireAuth: true,
			success: res => {
				if (res.statusCode === 200) {
					console.log(res)
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


    if (v < 1) {
      console.log('最小金额为1.00')
      this.setData({
        wrong: true,
        wrongResult: '!最小金额为1.00'
      })
    } else if (v > this.availablebalance / 100) {
      console.log('余额不足')
      this.setData({
        wrong: true,
        wrongResult: '!余额不足'
      })
    } else {
      console.log('可用余额')
      this.setData({
        wrong: false,
        Result: '可用余额' + this.availablebalance / 100 + '元'
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
        Result: '可用余额' + this.availablebalance / 100 + '元'
      })
    }

    this.drawal = v
    return v
  }
})