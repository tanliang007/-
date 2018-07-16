module.exports = {

		NO_CHARGING: 0,		// 没有充电
		WAIT_CHARGE: 1, 	// 等待负载
		WAIT_NOTICE: 2, 	// 等待通知（微信支付成功后设备启动通知）
		CHARGING: 3,			// 正在充电
		CHARG_SUSPEND: 4,	// 已暂停充电
		
		CHARG_FINISH: 5		// 充电完成

}