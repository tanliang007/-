// pages/mine/pilepointreturn/index.js
const http = require('../../../utils/http.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
		totalAmount:''  // 收益总额
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
		this.getChargePileSponsor()
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

	// 小程序事件
	getChargePileSponsor(){
		http.post({
			url:'/charge-pile-sponsor/index',
			requireAuth: true,
			success:(res)=>{
			 console.log(res)
			 this.setData({
				 totalAmount: res.data.totalAmount,
				 list:res.data.list
			 })
			}
		})
	},

	//导航到收益桩详情
	navToreturndetails(e){
		wx.navigateTo({
			url: `./returndetails/index?id=${e.currentTarget.dataset.id}`,
		})
	}
})