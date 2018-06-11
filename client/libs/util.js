var MARKERS = 'markers';
module.exports = {
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

    // 设置 markers, 同步更新到缓存
    set_markers: function (that, site_list) {
        that.setData({markers: site_list});
        wx.setStorage({
            key: MARKERS,
            data: site_list
        });
        // console.log('本地缓存: ' + JSON.stringify(wx.getStorageSync(MARKERS)));
    },
    // 新增单个站点到缓存
    put_storage: function (site) {
        var old_site_list = wx.getStorageSync(MARKERS);
        if (!old_site_list) {
            old_site_list = [];
        }
        old_site_list.forEach(function (item) {
            if (item.name == site.name) {
                console.log('already in storage');
                return;
            }
        });
        old_site_list.push(site);
        console.log('缓存新增:' + JSON.stringify(old_site_list));
        wx.setStorage({
            key: MARKERS,
            data: old_site_list
        });
    },
    // 生成 n->m的随机整数
    generate_random: function (n, m) {
        var c = m - n;
        return Math.floor(Math.random() * c + n);
    }
}
