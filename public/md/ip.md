## 此站点或产品所使用的 IP2Location LITE 数据来自于 <a rel="noopener" target="_blank" href="https://lite.ip2location.com">https://lite.ip2location.com</a>.

## hexo 参考 [https://www.fomal.cc/posts/d739261b.html](https://www.fomal.cc/posts/d739261b.html)

把

```javascript
$.ajax({
  type: 'get',
  url: 'https://apis.map.qq.com/ws/location/v1/ip',
  data: {
    key: '你的key',
    output: 'jsonp'
  },
  dataType: 'jsonp',
  success: function (res) {
    ipLoacation = res;
  }
});
```

替换为

```javascript
$.ajax({
  type: 'get',
  url: 'http://127.0.0.1:3000/api/ip',
  success: function (res) {
    ipLoacation = res;
  }
});
```
