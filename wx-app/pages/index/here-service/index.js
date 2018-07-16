// pages/index/here-service/index.js
const helpJson = require('./helpcontent.js')
Page({

  /**
   * 页面的初始数据
   */
	data: {
		helpJson: helpJson
	},

  /**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {

	},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
	onReady: function () {

	},

  /**
   * 生命周期函数--监听页面显示
   */
	onShow: function () {

	},

  /**
   * 生命周期函数--监听页面隐藏
   */
	onHide: function () {

	},

  /**
   * 生命周期函数--监听页面卸载
   */
	onUnload: function () {

	},

	// 切换显示效果
	switchDrop(e) {
		var tapindex = e.currentTarget.dataset.index
		var helpJson = this.data.helpJson
		helpJson.forEach((v, i) => {
			
			if (i == tapindex){
				console.log(2)
				v.istap = !v.istap
			}else{
				v.istap = false
			}
		
		})
		this.setData({
			helpJson: helpJson
		})
		console.log(this.data.helpJson)
	},
	phone(){
		wx.makePhoneCall({
			phoneNumber: '4008729799' //仅为示例，并非真实的电话号码
		})
	}
})