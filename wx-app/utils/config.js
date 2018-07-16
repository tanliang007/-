// true为测试环境  false为正式环境
let isTest = false

const testEndpoint = {

	https: 'https://tst-api-cdz.ejlchina-app.com/ejlchina',
	wss: 'wss://tst-wss-cdz.ejlchina-app.com'    

}

const prodEndpoint = {

	https: 'https://api-cdz.ejlchina-app.com/ejlchina',
	wss: 'wss://wss-cdz.ejlchina-app.com'

}

module.exports = {

	endpoint: isTest ? testEndpoint : prodEndpoint

}