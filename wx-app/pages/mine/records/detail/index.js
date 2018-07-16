// 充电记录详情页面
const http = require('../../../../utils/http.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
		orderDetail:null,
		consumeAmount:0,
		minejump:true 			// 我的页面跳过来的没有调到首页按钮
  },
	recordId: '',
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		console.log(options)
		if (options.minejump){
			var boo = 	options.minejump == "false" ? false : '';  
			this.setData({
				minejump: boo
			})
		}	
		this.recordId = options.recordId
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
		// 调接口获取订单详情 `/charge-record/show/${this.recordId}`
		http.post({
			url: `/charge-record/show/${this.recordId}`,
			requireAuth: true,
			success: (res) => {
				if(res.statusCode === 200){
					console.log(res)	
					this.setData({
						orderDetail: res.data,
            consumeAmount: res.data.consumeAmount / 100
					}) 
				}
			}
		})
		
  },
})