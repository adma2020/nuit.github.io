var base = "/admareg";

Date.prototype.format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时
    "H+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  var week = {
    "0": "/u65e5",
    "1": "/u4e00",
    "2": "/u4e8c",
    "3": "/u4e09",
    "4": "/u56db",
    "5": "/u4e94",
    "6": "/u516d"
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[this.getDay() + ""]);
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
}

/* 设置 Ajax 通用通用参数 */
$.ajaxSetup({
  complete: function (jqXHR, textStatus) {
    var ajaxStatus = jqXHR.getResponseHeader("AJAX_STATUS");
    if (ajaxStatus === "NOT_LOGIN") {
      var loginUrl = jqXHR.getResponseHeader("LOGIN_URL");
      $.zui.messager.danger("会话已过期", {
        time: 0,
        actions: [{
          name: "relogin",
          icon: "window",
          text: "点击此处重新登录",
          action: function () {
            location.href = loginUrl;
            return false;
          }
        }]
      });
    } else if (ajaxStatus === "NOT_ALLOW") {
      $.zui.messager.danger("没有访问权限");
    }
  },
  statusCode: {
    404: function () {
      $.zui.messager.danger("404: 请求的地址不存在");
    },
    500: function () {
      $.zui.messager.danger("500: 系统发生异常");
    }
  }
});

function formAjaxSubmit(form, beforeFunc, afterFunc) {
  $(form).ajaxSubmit({
    method: "POST",
    dataType: "json",
    beforeSubmit: beforeFunc,
    success: getAjaxResultFunc(afterFunc)
  });
}

function getAjaxResultFunc(customFunc) {
  return function(data) {
    if (data.code != 0) {
      $.zui.messager.danger(data.message);
      return;
    }

    if (data.autoReload) {
      location.reload();
      return;
    } else if (data.autoReloadTop) {
      top.location.reload();
      return;
    }

    if (customFunc) {
      customFunc(data);
      return;
    }

    if (data.url) {
      if (data.url.startsWith("/")) {
        location.href = "/admareg" + data.url;
      } else {
        location.href = data.url;
      }
      return;
    }

    if (data.closeModal) {
      $("#triggerModal").modal('hide');
    }
    var links = data.links;
    if (!links || links.length == 0) {
      $.zui.messager.success(data.message || "Operation Completed.");
      return;
    }
    var actions = [];
    for (var i = 0; i < links.length; i++) {
      actions[i] = (function(link, index) {
        return {
          name: 'act' + index,
          icon: link.icon || '',
          text: link.text,
          action: function() {
            if (link.url === "@reload") {
              location.reload();
            } else if (link.url === "@reloadTop") {
              top.location.reload();
            } else if (link.url.startsWith("/")) {
              location.href = "/admareg" + link.url;
            } else {
              location.href = link.url;
            }
          }
        }
      })(links[i], i);
    }
    $.zui.messager.success(data.message, {actions: actions});
  };
}

function copyContentById(id, keepSelect) {
  window.getSelection().removeAllRanges();
  var range = document.createRange();
  range.selectNode(document.getElementById(id));
  window.getSelection().addRange(range);
  document.execCommand('copy');
  if (!keepSelect) {
    window.getSelection().removeAllRanges();
  }
  $.zui.messager.success("内容已复制到剪贴板。");
}

function copyEditContentById(id, keepSelect) {
  document.getElementById(id).focus();
  document.execCommand('selectAll');
  document.execCommand('copy');
  if (!keepSelect) {
    document.execCommand('unselect');
    document.getElementById(id).blur();
  }
  $.zui.messager.success("内容已复制到剪贴板。");
}

(function ($) {
  FormValidation.Validator.condNotEmpty = {
    html5Attributes: {
      message: "message",
      field: "field",
      value: "value"
    },
    init: function (a, b, c, d) {
      var e = a.getFieldElements(c.field);
      a.onLiveChange(e, "live_" + d,
        function () {
          var allFields = a.options.fields;
          for (var i in allFields) {
            var cneField = allFields[i].validators.condNotEmpty;
            if (cneField && cneField.field === c.field) {
              if (a.getStatus(a.getFieldElements(i), d) !== a.STATUS_NOT_VALIDATED) {
                a.revalidateField(a.getFieldElements(i));
              }
            }
          }
        })
    },
    destroy: function (a, b, c, d) {
      var e = a.getFieldElements(c.field);
      a.offLiveChange(e, "live_" + d)
    },
    validate: function (validator, $field, options, d) {
      var value = validator.getFieldValue($field, d);
      var condField = validator.getFieldElements(options.field);
      if (null === condField || 0 === condField.length) {
        return true;
      }
      var condValue = validator.getFieldValue(condField, d);
      if (condValue === options.value && value === "") {
        return {
          valid: false,
          message: "请填写必填项目"
        };
      }
      //注释掉这句，应该是双向验证时才需要，否则级联验证会有问题。
      //validator.updateStatus(condField, validator.STATUS_VALID, d);
      return true;
    }
  };
}(window.jQuery));
(function ($) {
  FormValidation.Validator.compareGreaterThan = {
    html5Attributes: {
      message: "message",
      field: "field",
      inclusive: "inclusive"
    },
    init: function (a, b, c, d) {
      var e = a.getFieldElements(c.field);
      a.onLiveChange(e, "live_" + d,
        function () {
          var allFields = a.options.fields;
          for (var i in allFields) {
            var cneField = allFields[i].validators.compareGreaterThan;
            if (cneField && cneField.field === c.field) {
              if (a.getStatus(a.getFieldElements(i), d) !== a.STATUS_NOT_VALIDATED) {
                a.revalidateField(a.getFieldElements(i));
              }
            }
          }
        })
    },
    destroy: function (a, b, c, d) {
      var e = a.getFieldElements(c.field);
      a.offLiveChange(e, "live_" + d)
    },
    validate: function (validator, $field, options, d) {
      var value = validator.getFieldValue($field, d);
      var condField = validator.getFieldElements(options.field);
      if (null === condField || 0 === condField.length) {
        return true;
      }
      var condValue = validator.getFieldValue(condField, d);
      if (value !== "" && ((value < condValue) || (!options.inclusive && value === condValue)) ) {
        return {
          valid: false,
          message: options.message || 'Need greater than ...'
        };
      }
      return true;
    }
  };
}(window.jQuery));

// 代码复制支持
if (!$.zui.browser.isIE() || $.zui.browser.ie > 8) {
  var $copyCodeBtn = $('#copyCodeBtn');
  var clipboard = new window.Clipboard($copyCodeBtn.get(0));
  clipboard.on('success', function (e) {
    $copyCodeBtn.tooltip('show', '已复制');
    $('#copyCodeTip').addClass('tooltip-success');
    e.clearSelection();
  });

  clipboard.on('error', function (e) {
    $copyCodeBtn.tooltip('show', isTouchScreen ? '你的浏览器不支持直接复制，请自行选择并复制。' : '按 <strong>Ctrl+C</strong> 完成复制');
    $('#copyCodeTip').addClass('tooltip-warning');
  });

  $copyCodeBtn.on('hide.zui.tooltip', function () {
    $('#copyCodeTip').removeClass('tooltip-success tooltip-warning');
  });

  $(document).on('mouseenter', '.copyable', function () {
    var $copyable = $(this);
    var $copyableTarget = $copyable.children('code, .linenums, .copyable-target');
    if (!$copyableTarget.length) return;

    if (!$copyableTarget.attr('id')) {
      $copyableTarget.attr('id', 'code-' + $.zui.uuid())
    }
    $copyable.prepend($copyCodeBtn);
    $copyCodeBtn.attr('data-clipboard-target', '#' + $copyableTarget.attr('id'));
    $copyable.one('mouseleave', function () {
      $copyCodeBtn.detach();
    });
  });
}

/* 设定中文提示信息及边距（防止被顶部导航覆盖） */
(function ($) {

  $.fn.selectpicker.defaults = {
    noneSelectedText: '',
    /*
    noneSelectedText: '没有选中任何项',
    noneResultsText: '没有找到匹配项',
    countSelectedText: '选中 {1} 中的 {0} 项',
    maxOptionsText: ['超出限制 （最多选择 {n} 项）', '组选择超出限制（最多选择 {n} 组）'],
    multipleSeparator: '、',
    selectAllText: '全选',
    deselectAllText: '取消全选',
    */
    windowPadding: [30, 0, 0, 0]
  };

})(jQuery);

