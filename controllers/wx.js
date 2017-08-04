const iconv = require('iconv-lite');
const request = require('request');
const cheerio = require("cheerio");

const IMG_PREFIX = 'http://read.html5.qq.com/image?src=forum&q=5&r=0&imgflag=7&imageUrl=';

const wx = {
  list: list,
  detail: detail
};

function list (req, res) {
  /**
   * @type {string}
   * 0热门、1推荐、2段子手、3养生堂、4私房话、5八卦精、6爱生活、7财经迷、
   * 8汽车迷、9科技咖、10潮人帮、11辣妈帮、12点赞党、13旅行家、14职场人、
   * 15美食家、16古今通、17学霸族、18星座控、19体育迷
   *
   */
  let type = req.query.type || 0;
  let page = req.query.page || 0;
  let url = `http://weixin.sogou.com/wapindex/wap/0612/wap_${type}/${page}.html`;
  let options = {
    url: url,
    encoding: null,
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
    }
  };

  try {
    request(options, function (err, _res, body) {
      //先抓取页面，获取页面编码格式，然后再使用相应编码解析
      let html = iconv.decode(body,'UTF8'); // gb2312;
      try{
        let str = html.split('charset=')[1];
        let encode = str.match(/(\w+)\W/)[1].toUpperCase();
        if (encode==='UTF') {
          html = iconv.decode(body,'UTF8');
        }else{
          html = iconv.decode(body,encode);
        }
      }catch(e){
        console.log('no charset');
      }
      //获取页面为元素
      let $ = cheerio.load(html,{decodeEntities: false});
      let aArticle = $('.list-txt');
      let aPic = $('.pic');
      let len = aArticle.length;
      let list = [];
      for (let i=0;i<len;i++) {
        let oArticle = aArticle.eq(i);
        let _pic = aPic.eq(i).find('img').attr('src');
        let pic = getUrlParams(decodeURIComponent(_pic), 'url').replace(/\?.+/, '');
        let _obj = {
          title: oArticle.find('a div').text(),
          url: oArticle.find('a').attr('href'),
          author: oArticle.find('.s2').text(),
          timestamp: oArticle.find('.s3').data('lastmodified'),
          pic: IMG_PREFIX + pic
        };
        list.push(_obj);
      }

      res.json ({
        code: 10000,
        errMsg: '',
        data: list
      })

    });
  }catch(e){
    res.json ({
      code: 102,
      errMsg: '请求错误'
    })
  }

}

function getUrlParams (url, param) {
  let _temp = url.split(param + '=')[1];
  return _temp.split('&')[0];
}

function trim (str) {
  return str && str.replace(/(^\s*)|(\s*$)/g, '');
}


function detail (req, res) {
  let url = req.query.url;
  let options = {
    url: url,
    encoding: null,
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
    }
  };

  try {
    request(options, function (err, _res, body) {
      //先抓取页面，获取页面编码格式，然后再使用相应编码解析
      let html = iconv.decode(body,'UTF8'); // gb2312;
      try{
        let str = html.split('charset=')[1];
        let encode = str.match(/(\w+)\W/)[1].toUpperCase();
        if (encode==='UTF') {
          html = iconv.decode(body,'UTF8');
        }else{
          html = iconv.decode(body,encode);
        }
      }catch(e){
        console.log('no charset');
      }
      //获取页面为元素
      let $ = cheerio.load(html,{decodeEntities: false});
      /*let iframes = $('iframe');
      let len = iframes.length;
      iframes.each((i, v) => {
        console.log ($(v).data('src'))
      });*/
      let content = trim($('#js_content').html());
      let iframes = content.match(/preview.html\?vid=(.+?)&width=.+?&auto=0/g);
      if (!!iframes) {
        for (let i=0;i<iframes.length;i++) {
          let vid = getUrlParams(iframes[i], 'vid');
          console.log (vid)
          content = content.replace(iframes[i], 'player.html?vid=' + vid);
        }
      }

      let data = {
        title: trim($('.rich_media_title').text()),
        author: trim($('#post-user').text()),
        time: trim($('#post-date').text()),
        content: content
          .replace(/data-src="http:\/\/mmbiz.qpic.cn/g, `width="100%" src="${IMG_PREFIX}http://mmbiz.qpic.cn`)
          .replace(/data-src/g, 'src')
          // .replace(/!important/g, '')
          // .replace(/<iframe.+<\/iframe>/g, 'player.html?vid=')
      };
      res.json ({
        code: 10000,
        errMsg: '',
        data: data
      })

    });
  }catch(e){
    res.json ({
      code: 102,
      errMsg: '请求错误'
    })
  }

}

module.exports = wx;