/**
 * config
 */

var path = require('path');

exports.config = {
  debug: true,
  name: 'ICardYou',
  description: '通过明信片交友，自由配对你志同道合的好友，并获得意外惊喜',
  version: '0.2.2',

  // site settings
  site_headers: [
    '<meta name="author" content="EDP@TAOBAO" />',
  ],
  host: 'localhost.cnodejs.org',
  // 默认的Google tracker ID，自有站点请修改，申请地址：http://www.google.com/analytics/
  google_tracker_id: 'UA-41753901-5',
  site_logo: '', // default is `name`
  site_navs: [
    // [ path, title, [target=''] ]
    [ '/about', '关于' ],
  ],
  site_static_host: '', // 静态文件存储域名
  mini_assets: false, // 静态文件的合并压缩，详见视图中的Loader
  site_enable_search_preview: false, // 开启google search preview
  site_google_search_domain:  'icardyou.com',  // google search preview中要搜索的域名

  upload_dir: path.join(__dirname, 'public', 'user_data', 'images'),

  db: 'mongodb://127.0.0.1/node_club_dev',
  session_secret: 'node_club',
  auth_cookie_name: 'node_club',
  port: 3000,

  // 话题列表显示的话题数量
  list_topic_count: 10,

  // 限制发帖时间间隔，单位：毫秒
  post_interval: 10000,

  // RSS
  rss: {
    title: 'ICardYou',
    link: 'http://www.icardyou.com',
    language: 'zh-cn',
    description: '通过明信片交友，自由配对你志同道合的好友，并获得意外惊喜',

    //最多获取的RSS Item数量
    max_rss_items: 50
  },
 
  // site links
  site_links: [
    {
      'text': '什么是ICardYou？',
      'url': 'http://nodejs.org/'
    },
    {
      'text': '新手帮助',
      'url': 'http://party.cnodejs.net/'
    }
  ],


 // sidebar ads
  side_ads: [
    {
      'url': 'http://www.icardyou.com/280_games_images/24909201311071109431.jpg',
      'image': 'http://www.icardyou.com/280_games_images/24909201311071109431.jpg',
      'text': ''
    },
    {
      'url': 'http://www.icardyou.com/280_games_images/24909201311071106211.jpg',
      'image': 'http://www.icardyou.com/280_games_images/24909201311071106211.jpg',
      'text': ''
    },
  ],

  // mail SMTP
  mail_opts: {
    host: 'smtp.gmail.com',
    port: 25,
    auth: {
      user: 'jlucser@gmail.com',
      pass: '2004541990'
    }
  },

  //weibo app key
  weibo_key: 10000000,

  // admin 可删除话题，编辑标签，设某人为达人
  admins: { admin: true },

  // [ { name: 'plugin_name', options: { ... }, ... ]
  plugins: [
    // { name: 'onehost', options: { host: 'localhost.cnodejs.org' } },
    // { name: 'wordpress_redirect', options: {} }
  ]
};
