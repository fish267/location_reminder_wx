## 配置地址
1. [高德 API](https://lbs.amap.com/api/wx/guide/get-data/get-inputtips)
2. [小程序研发文档](https://developers.weixin.qq.com/miniprogram/dev/)
3. AppID(小程序ID)	wxbc24fa3169adc414

## Change Log

## 思考

1. 一个小程序该有什么样的能力?

- 能用, 够用
- 上手简单
- 专一

2. 打算实现的功能

- 站点添加- Done
- 站点维护: 站点删除, 站点距离显示 -- Done
- 地图展示模块: 自定义站点添加, 地图点标 --Done
- 天气展示: 因为高德有数据接口, 该功能是否需要还待定  -- Done

3. 服务端需不需要

- 一期不考虑服务端, 数据存储使用手机端 localStorage
- 二期会开始玩转树莓派, 到时候开个最弱的 mongodb 接口

4. 数据 API 花费

- 个人开发者身份, 高德 API 免费调用次数有限, 如果真的有量, 可以考虑付费模式

5. 开发过程吐槽

- 截至目前, 个人认为前端最繁琐的部分是样式
- 原本打算前端 JS 功能就是 setData 与 ajax 请求, 数据逻辑让 server 处理, 现在只能干写 JS 来玩了
- 对产品理解, 交互, 视觉设计能力上, 存在明显的短板. 功能都是 YY 后, 开始动手
- 在调试代码时, 发现单词写错耽误了N久!!!

6. TODO

- 第二页, 地图回到原点
- 
- 