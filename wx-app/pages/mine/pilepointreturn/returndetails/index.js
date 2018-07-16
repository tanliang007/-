// pages/mine/pilepointreturn/returndetails/index.js
const http = require('../../../../utils/http.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
	headerDetailId:'',
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		// 记录桩点详情接口需要的id
		console.log(options.id)
		this.headerDetailId = options.id
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
		this.getHeaderDetail()
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

	getHeaderDetail(){
		http.post({
			url: '/charge-pile-sponsor/show/' + this.headerDetailId,
			requireAuth: true,
			success:(res) => {
				console.log(res)
				this.setData({
					detailArray:res.data
				})
			}
		})	
	},

	navTodetaillist(){
		wx.navigateTo({
			url: '../detailslist/index?id=' + this.headerDetailId,
		})
	}
})