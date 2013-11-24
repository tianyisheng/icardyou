/**
 * 需要管理员权限
 */
exports.adminRequired = function (req, res, next) {
  if (!req.session.user) {
    return res.render('notify/notify', {error: '你还没有登录。'});
  }
  if (!req.session.user.is_admin) {
    return res.render('notify/notify', {error: '管理员才能编辑标签。'});
  }
  next();
};

/**
 * 需要登录
 */
exports.userRequired = function (req, res, next) {
  if (!req.session || !req.session.user) {
    return res.send(403, 'forbidden!');
  }
  next();
};

/**
 * 需要登录，响应错误页面
 */
exports.signinRequired = function (req, res, next) {
  if (!req.session.user) {
    res.render('notify/notify', {error: '未登入用户不能浏览，请点击右上方按钮登录或者注册。'});
    return;
  }
  next();
};
