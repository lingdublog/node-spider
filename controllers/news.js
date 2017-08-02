const iconv = require('iconv-lite');
const request = require('request');
const cheerio = require("cheerio");

const wx = {
  list: list,
  detail: detail,
  comment: comment
};

function list (req, res) {
  /**
   * @type {string}
   * 8新闻、15财经、10军事、30科技、23时尚、13历史、12文化、29旅游、
   * 28美食、24健康、25教育、43社会
   *
   */
  let type = req.query.type || '8';
  let page = req.query.page || '1';
  let url = `http://v2.sohu.com/public-api/feed?scene=CHANNEL&sceneId=${type}&page=${page}&size=20`;
  let options = {
    url: url,
    encoding: null,
    json: true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
    }
  };

  try {
    request(options, function (err, _res, body) {
      let list = [];
      body.forEach(v => {
        let _obj = {
          title: v.mobileTitle, // 标题
          author: v.authorName, // 作者
          pic: v.picUrl, // 单个图片
          images: v.images, // 多个图片，三个，罗列一行
          timestamp: v.publicTime, // 时间
          cmsId: v.cmsId, // cms的id，获取评论需要
          authorId: v.authorId, // 作者id，获取新闻内容需要
          newsId: v.id // 新闻id
        };
        list.push(_obj);
      });
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

function detail (req, res) {
  let newsId = req.query.newsId;
  let authorId = req.query.authorId;
  let url = `http://m.sohu.com/a/${newsId}_${authorId}`;
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
      let oContent1 = $('.display-content');
      let oContent2 = $('.hidden-content');
      let oContent = oContent1.html() + oContent2.html();
      oContent = oContent.split('<section class="statement">')[0];

      res.json ({
        code: 10000,
        errMsg: '',
        data: oContent
      })

    });
  }catch(e){
    res.json ({
      code: 102,
      errMsg: '请求错误'
    })
  }
}

function comment (req, res) {
  let newsId = req.query.newsId;
  let cmsId = req.query.cmsId;
  let url = `http://apiv2.sohu.com/api/topic/load?topic_source_id=${cmsId}&page_no=1&hot_size=10&media_id=${newsId}`;
  let options = {
    url: url,
    encoding: null,
    json: true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
    }
  };

  try {
    request(options, function (err, _res, body) {
      let list = [];
      if (body.jsonObject && body.jsonObject.hots){
        body.jsonObject.hots.forEach(v => {
          let _obj = {
            content: v.content,
            time: v.create_time,
            username: v.passport.nickname,
            avatar: v.passport.img_url,
            supportCount: v.support_count
          };
          list.push(_obj);
        })
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

module.exports = wx;