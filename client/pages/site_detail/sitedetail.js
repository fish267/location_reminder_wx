var amapFile = require('../../libs/amap-wx.js');
var config = require('../../libs/config.js');
var key = config.Config.key;
var MARKERS = 'markers';
var util = require('../../libs/util.js');
var calculate_distance = util.calculate_distance;
var put_storage = util.put_storage;
var around_location = null;
var real_longitude = null;
var real_latitude = null;
var markers_max_length = 3;
Page({
    data: {
        markers: [],
        latitude: '',
        longitude: '',
        textData: {},
        tips: '',
        scale: '16',
        map_top: '30px',
    },
    // 页面显示时, 加载收藏的站点
    onLoad: function (e) {
        this.setCurrentLocation(e);
        var that = this;
        var storage_markers = wx.getStorageSync(MARKERS);
        var fe_markers = [];
        var current_location = {
            name: '',
            address: '',
        };
        // 显示设置的站点
        try {
            for (var index = 0; index < storage_markers.length; index++) {
                var temp_location = Object.assign({}, current_location);
                temp_location.id = index;
                var location = storage_markers[index].location;
                temp_location.longitude = location.split(',')[0];
                temp_location.latitude = location.split(',')[1];
                temp_location.iconPath = '../../img/star.png';
                // 设置其他属性
                temp_location.name = location.name;
                temp_location.address = location.district;
                fe_markers.push(temp_location);
            }
        } catch (error) {
            console.error(error);
        }
        // 显示周边站点
        var myAmapFun = new amapFile.AMapWX({key: key});
        var fe_markers_length = fe_markers.length;
        myAmapFun.getPoiAround({
            querykeywords: e.keywords,
            location: around_location,
            success: function (data) {
                var markersDataList = data.markers;
                for (var index = 0; index < markersDataList.length; index++) {
                    //默认返回20个
                    try {
                        var item = markersDataList[index];
                        var temp_location = Object.assign({}, current_location);

                        temp_location.id = item.id + fe_markers_length;
                        temp_location.longitude = (item.longitude);
                        temp_location.latitude = (item.latitude);
                        temp_location.iconPath = "../../img/marker.png";
                        temp_location.name = item.name;
                        temp_location.width = 35;
                        temp_location.height = 51;
                        fe_markers.push(temp_location);
                        if (index > markers_max_length) {
                            break;
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
                console.log(fe_markers);
                that.setData({
                    markers: fe_markers
                });
            },
            fail: function () {
                console.error('xxxxxx');
            },

        });
    },
    // 点击站点图标, 显示地名, 街道, 距离, 改变icon
    makertap: function (e) {
        console.log('marker点击' + JSON.stringify(e));
        var fe_markers = this.data.markers;
        var site_list = wx.getStorageSync(MARKERS) ? wx.getStorageSync(MARKERS) : [];
        var that = this;
        fe_markers.forEach(function (item, index) {
            if (e.markerId == item.id) {
                console.log('匹配到站点: ' + JSON.stringify(item));
                var site = Object.assign({}, item);
                wx.showModal({
                    title: '添加站点',
                    content: site.name,
                    success: function (res) {
                        if (res.confirm) {
                            // 设置显示名称与距离
                            var lng1 = site.longitude;
                            var lat1 = site.latitude;
                            site['site_distance'] = calculate_distance(lat1, lng1,
                                real_latitude, real_longitude);
                            site['location'] = lng1 + ',' + lat1;
                            site['width'] = '';
                            site['height'] = '';
                            site['iconPath'] = '../../img/star.png';
                            site_list.push(site);
                            // 更改图片logo
                            fe_markers[index].iconPath = '../../img/star.png';
                            fe_markers[index].width = '';
                            fe_markers[index].height = '';
                            // 将站点添加到缓存
                            put_storage(site);
                            // 图片更改后, refresh
                            that.setData({
                                markers: fe_markers
                            });
                        } else if (res.cancel) {
                            console.log('用户点击取消')
                        }
                    }
                });
            }
        });

    },
    // 设置当前经纬度地址
    setCurrentLocation: function (e) {
        if (!(e && e.location)) {
            var that = this;
            wx.getLocation({
                type: 'gcj02',
                success: function (res) {
                    var latitude = res.latitude;
                    var longitude = res.longitude;
                    that.setData({latitude: latitude, longitude: longitude});
                    around_location = longitude + "," + latitude;
                    real_latitude = latitude;
                    real_longitude = longitude;
                    console.log('当前经纬度:' + JSON.stringify(res));
                    wx.setStorage({
                        key: 'latitude',
                        data: latitude
                    });
                    wx.setStorage({
                        key: 'longitude',
                        data: longitude
                    });
                },
                fail: function (info) {
                    wx.showModal({title: info.errMsg})
                }
            });
        } else {
            var location = e.location.split(',');
            around_location = location[0] + "," + location[1];
            this.setData({
                latitude: location[1], longitude: location[0]
            });
        }
    },


    // 周报站点搜索
    bindInput: function (e) {
        var that = this;
        var keywords = e.detail.value;
        if (keywords == '') {
            this.setData({
                tips: [],
                map_top: '30px'
            })
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
                        tips: data.tips,
                        map_top: '250px'
                    });
                }
            }
        })
    },
    // 点击站点
    bindSearch: function (e) {
        var site_location = e.currentTarget.dataset.site_detail.location;
        var keywords = e.currentTarget.dataset.site_detail.name;
        var url = './sitedetail?location=' + site_location + '&keywords=' + keywords;
        console.log('站点跳转: ' + url)
        wx.reLaunch({
            url: url
        });
    },

    onHide: function () {
        console.log('页面切换, 复位');
    },
    onPullDownRefresh: function () {
        console.log('下拉刷新');
        wx.reLaunch({
            url: './sitedetail'
        });
    }
})