
module.exports = {

	/**
	 * func 需要防抖的方法
	 * interval 最小抖动间隔
	 * 用法：
	 * var throttleFunction = throttle(function() {
	 * 		// 需要防抖的方法体
	 * }, 2000)
	 * 
	 * 外部直接调用这个包装过的方法
	 * throttleFunction()
	 * 
	 */
	throttle: function (func, interval) {
		// 上一次执行事件时间
		var lastExeTime = 0
		// 上一次未执行事件参数
		var lastUnexeArgs = null
		// 维护一个定时器
		var timer = null
		return function () {
			let now = Date.now()
			let passTime = now - lastExeTime
			if (passTime >= interval) {
				lastExeTime = now
				func(...arguments)
			} else {
				// 如果又有新的未执行事件，则清除上一次记录的未执行事件任务
				// 以保证定时任务执行的是最后一次未执行事件
				if (timer) {
					clearTimeout(timer)
				}
				lastUnexeArgs = arguments
				timer = setTimeout(function () {
					let tnow = Date.now()
					// 还没有新的事件进入时被立即执行
					if (lastExeTime + interval <= tnow) {
						lastExeTime = tnow
						func(...lastUnexeArgs)
					}
				}, interval - passTime)
				// 
			}
		}
	},

	/**
	 * 倒计时函数
	 * 
	 */
	formatSeconds(value) {
		var secondTime = parseInt(value); // 秒
		// console.log(secondTime)
		var minuteTime = '00'; // 分
		var hourTime = '00'; // 小时
		//获取分钟，除以60取整数，得到整数分钟
		minuteTime = parseInt(secondTime / 60) < 10 ? '0' + parseInt(secondTime / 60) : parseInt(secondTime / 60);
		//获取秒数，秒数取佘，得到整数秒数
		secondTime = parseInt(secondTime % 60) < 10 ? '0' + parseInt(secondTime % 60) : parseInt(secondTime % 60);
		//如果分钟大于60，将分钟转换成小时
		if (minuteTime > 60) {
			//获取小时，获取分钟除以60，得到整数小时
			hourTime = parseInt(minuteTime / 60);
			//获取小时后取佘的分，获取分钟除以60取佘的分
			minuteTime = parseInt(minuteTime % 60) < 10 ? '0' + parseInt(minuteTime % 60) : parseInt(minuteTime % 60);
		}
		var result = secondTime;
		result = minuteTime + ":" + result;
		result = hourTime + ":" + result;
		return result;
	},

	// 正计时
	theTimeSeconds(value, pricePerHour) {
		var secondTime = parseInt(value); // 秒	
		var minuteTime = '00'; // 分
		var hourTime = '00'; // 小时
		//获取分钟，除以60取整数，得到整数分钟
		minuteTime = parseInt(secondTime / 60) < 10 ? '0' + parseInt(secondTime / 60) : parseInt(secondTime / 60);
		//获取秒数，秒数取佘，得到整数秒数
		secondTime = parseInt(secondTime % 60) < 10 ? '0' + parseInt(secondTime % 60) : parseInt(secondTime % 60);
		//如果分钟大于60，将分钟转换成小时
		if (minuteTime > 60) {
			//获取小时，获取分钟除以60，得到整数小时
			hourTime = parseInt(minuteTime / 60);
			//获取小时后取佘的分，获取分钟除以60取佘的分
			minuteTime = parseInt(minuteTime % 60) < 10 ? '0' + parseInt(minuteTime % 60) : parseInt(minuteTime % 60);
		}
		var result = secondTime;
		result = minuteTime + ":" + result;
		result = hourTime + ":" + result;
		// 价格处理
		
		if (value % 60 > 0){
			value = Math.ceil(value / 60 )
		}
		pricePerHour = pricePerHour / 100
		let moneyFen = value * (pricePerHour / 60)
		// 计算消费金额显示
		return {
			result: result,
			money: moneyFen.toFixed(2)
		}
	},

	/**
     * 近似计算地球两点间的距离
     * 当两点间的距离越小，计算的准确度越高，当两点间的经度夹角越大，计算的误差越大
     * @param long1 经度1
     * @param lati1 纬度1
     * @param long2 经度2
     * @param lati2 纬度2
     * @return 两点间的距离（单位米）
     */
	shortDistance(long1, lati1, long2, lati2) {
		// 地球半径（米）
		let EARTH_RADIUS = 6371000

		// 经度计算缩放因子（因为地球是椭球，所以需要这个因子）
		let LONGITUDE_SCALE_FACTOR = 0.868
		// 平角
		let FLAT_ANGLE = 180
		var lati = (lati1 + lati2) / 2
		var dLong = (long1 - long2) * LONGITUDE_SCALE_FACTOR
		var dLati = lati1 - lati2
		var factor = Math.sqrt(Math.pow(dLong, 2) * Math.pow(Math.cos(lati / FLAT_ANGLE), 2) +   Math.pow(dLati, 2))
		return factor * Math.PI * EARTH_RADIUS / FLAT_ANGLE
	},

	formatDate: function(date, fmt) { //author: meizz 
		var o = {
			"M+": date.getMonth() + 1, //月份 
			"d+": date.getDate(), //日 
			"h+": date.getHours(), //小时 
			"m+": date.getMinutes(), //分 
			"s+": date.getSeconds(), //秒 
			"q+": Math.floor((date.getMonth() + 3) / 3), //季度 
			"S": date.getMilliseconds() //毫秒 
		};
		if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o)
			if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	}
	
}
