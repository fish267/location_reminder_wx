var amapFile = require('../../libs/amap-wx.js');
var config = require('../../libs/config.js');

var key = config.Config.key;
var MARKERS = 'markers';
Page({
    data: {
        markers: [],
        latitude: '',
        longitude: '',
        textData: {},
        city: '',
        site_tag: []
    },
    // 页面加载时, 获取当前地理位置
    onLoad: function (e) {
        this.setCurrentLocation();
        var storage_markers = wx.getStorageSync(MARKERS);
        if (storage_markers) {
            this.setData({
                markers: storage_markers
            });
        }
    },
    // 设置当前经纬度地址
    setCurrentLocation: function () {
        var that = this;
        wx.getLocation({
            type: 'gcj02',
            success: function (res) {
                var latitude = res.latitude
                var longitude = res.longitude
                that.setData({latitude: latitude, longitude: longitude});
                console.log('当前经纬度:' + JSON.stringify(res));
            },
            fail: function (info) {
                wx.showModal({title: info.errMsg})
            }
        });
    },
    // 设置城市
    onReady: function (e) {
        var that = this;
        var myAmapFun = new amapFile.AMapWX({key: key});
        myAmapFun.getPoiAround({
            success: function (data) {
                //成功回调
                if (data.poisData[0].cityname) {
                    that.setData({city: data.poisData[0].cityname});
                }
            },
            fail: function (info) {
                //失败回调
                console.error(info);
            }
        })
    },

    // 根据经纬度进行距离运算
    // 参考资料: https://www.zhihu.com/question/46808125
    calculate_distance: function (lat1, lng1, lat2, lng2) {
        var radLat1 = lat1 * Math.PI / 180.0;
        var radLat2 = lat2 * Math.PI / 180.0;
        var a = radLat1 - radLat2;
        var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378.137;
        s = Math.round(s * 10000) / 10000;
        // 单位为 m
        return parseInt(s * 1000, 10);
    },

    // 周报站点搜索
    bindInput: function (e) {
        var that = this;
        var keywords = e.detail.value;
        if (keywords == '') {
            return;
        }
        var myAmapFun = new amapFile.AMapWX({key: key});
        myAmapFun.getInputtips({
            keywords: keywords,
            location: that.data.longitude + ',' + that.data.latitude,
            city: that.data.city,
            datatype: 'poi',
            success: function (data) {
                if (data && data.tips) {
                    that.setData({
                        tips: data.tips
                    });
                }
            }
        })
    },
    // 点击站点, 添加到 MARKERS 与缓存
    bindSearch: function (e) {
        var site = e.currentTarget.dataset.site_detail;
        var site_list = this.data.markers;
        for (var index = 0; index < site_list.length; index++) {
            if (site_list[index].id == site.id) {
                console.log('该站点已经设置过');
                return;
            }
        }
        var that = this;
        wx.showModal({
            title: '添加站点',
            content: site.name,
            success: function (res) {
                if (res.confirm) {
                    // 设置显示名称与距离
                    var lng1 = site.location.split(',')[0];
                    var lat1 = site.location.split(',')[1];
                    site['site_distance'] = that.calculate_distance(lat1, lng1,
                        that.data.latitude, that.data.longitude);
                    site_list.push(site);
                    that.setMarkers(site_list);
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        });

    },
    showMarkerInfo: function (data, i) {
        var that = this;
        that.setData({
            textData: {
                name: data[i].name,
                desc: data[i].address
            }
        });
    },
    // 设置 markers, 同步更新到缓存
    setMarkers: function (site_list) {
        this.setData({markers: site_list});
        wx.setStorage({
            key: MARKERS,
            data: site_list
        });
        console.log('本地缓存: ' + JSON.stringify(wx.getStorageSync(MARKERS)));
    },
    delete_site_tag: function (e) {
        var that = this;
        var site_id = e.currentTarget.dataset.site_id;
        var site_name = e.currentTarget.dataset.site_name;
        wx.showModal({
            title: '删除站点',
            content: site_name,
            success: function (res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                    var site_list = that.data.markers;
                    for (var index = 0; index < site_list.length; index++) {
                        if (site_list[index].id == site_id) {
                            site_list.splice(index, index);
                            console.log('删除站点:' + site_name);
                            that.setMarkers(site_list);
                        }
                    }
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        });
    }
})