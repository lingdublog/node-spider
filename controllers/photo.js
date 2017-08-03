const iconv = require('iconv-lite');
const request = require('request');
const cheerio = require("cheerio");

const wx = {
  list: list,
  detail: detail,
  comment: comment,
  more: more
};

function list (req, res) {
  /**
   * @type {string}
   * 18867热门、2新闻、4娱乐、3体育、5938生活、5937奇趣、8军事、5100历史、
   * 450财经、16879文化读书、1592汽车、267科技
   *
   */
  let type = req.query.type || '18867';
  let page = req.query.page || '1';
  let url = `https://m.sohu.com/api/pl/${type}/?page=${page}`;
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
      if (body.group_list) {
        body.group_list.forEach(v => {
          let _obj = {
            cover: v.cover, // 封面，可能多张，多张并列一行
            imgCount: v.image_count, // 图片张数
            isHot: v.is_hot, // 是否热门
            title: v.title,
            timestamp: v.create_time, // 时间
            newsId: v.id // 新闻id
          };
          list.push(_obj);
        });
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

function detail (req, res) {
  let newsId = req.query.newsId;
  let url = `https://m.sohu.com/api/pic/slide/${newsId}/?webp=1`;
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
      res.json ({
        code: 10000,
        errMsg: '',
        data: body.data.images
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

function more (req, res) {
  let newsId = req.query.newsId;
  let url = `https://m.sohu.com/api/pic/more/${newsId}/`;
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

      res.json ({
        code: 10000,
        errMsg: '',
        data: body.data
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