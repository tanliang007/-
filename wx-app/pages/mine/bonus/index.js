// pages/bonus/index.js
const http = require('../../../utils/http.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
		"viewamount": 0,          // 收益余额
		"viewyesterdayAmount": 0,     // 今日收益
		"viewhistoryAmount": 0    // 历史收益
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
		this.getmyBonus()
  },

	//----自定义事件----
	getmyBonus() {
		http.get({
			url: '/bonus/index',
			requireAuth: true,
			success: res => {
				console.log(res)
				if (res.statusCode === 200) {
					this.setData({
						"viewamount": res.data.amount,          // 收益余额
						"viewyesterdayAmount": res.data.yesterdayAmount,     // 今日收益
						"viewhistoryAmount": res.data.historyAmount   // 历史收益
					})
				}
			}
		});
	},
})