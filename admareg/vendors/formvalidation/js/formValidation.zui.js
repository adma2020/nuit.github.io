(function ($) {
  FormValidation.Framework.Zui = function (element, options) {
    options = $.extend(true, {
      button: {
        selector: '[type="submit"]:not([formnovalidate])',
        disabled: 'disabled'
      },
      locale: "zh_CN",
      err: {
        clazz: 'help-block',
        parent: "^(.*)col-(xs|sm|md|lg)-(offset-){0,1}[0-9]+(.*)$"
      },
      icon: {
        valid: 'icon icon-check',
        invalid: 'icon icon-times',
        validating: 'icon icon-refresh',
        feedback: 'fv-control-feedback'
      },
      row: {
        selector: '.form-group',
        valid: 'has-success',
        invalid: 'has-error',
        feedback: 'fv-has-feedback'
      }
    }, options);

    FormValidation.Base.apply(this, [element, options]);
  };

  FormValidation.Framework.Zui.prototype = $.extend({}, FormValidation.Base.prototype, {
    /**
     * Specific framework might need to adjust the icon position
     *
     * @param {jQuery} $field The field element
     * @param {jQuery} $icon The icon element
     */
    _fixIcon: function ($field, $icon) {
      var ns = this._namespace,
        type = $field.attr('type'),
        field = $field.attr('data-' + ns + '-field'),
        $row = $field.closest(this.options.fields[field].row || this.options.row.selector),
        $parent = $field.parent();

      // Place it after the container of checkbox/radio
      // so when clicking the icon, it doesn't effect to the checkbox/radio element
      if ('checkbox' === type || 'radio' === type) {
        if ($parent.hasClass(type)) {
          $icon.insertAfter($parent);
        } else if ($parent.parent().hasClass(type)) {
          $icon.insertAfter($parent.parent());
        }
      }

      if ($row.find(".input-group").length !== 0) {
        $icon.addClass("fv-zui-icon-input-group").insertAfter($row.find(".input-group").eq(0));
      }
    },
    _createTooltip: function (a, b, c) {
      var d = this._namespace,
        e = a.data(d + ".icon");
      if (e) switch (c) {
        case "popover":
          e.css({
            cursor: "pointer",
            "pointer-events": "auto"
          }).popover("destroy").popover({
            container: "body",
            content: b,
            html: !0,
            placement: "auto top",
            trigger: "hover click"
          });
          break;
        case "tooltip":
        default:
          e.css({
            cursor: "pointer",
            "pointer-events": "auto"
          }).tooltip("destroy").tooltip({
            container: "body",
            html: !0,
            placement: "auto top",
            title: b
          }).data("zui.tooltip").tip().css("z-index", 2000)
      }
    },
    _destroyTooltip: function (a, b) {
      var c = this._namespace,
        d = a.data(c + ".icon");
      if (d) switch (b) {
        case "popover":
          d.css({
            cursor: "",
            "pointer-events": "none"
          }).popover("destroy");
          break;
        case "tooltip":
        default:
          d.css({
            cursor: "",
            "pointer-events": "none"
          }).tooltip("destroy")
      }
    },
    _hideTooltip: function (a, b) {
      var c = this._namespace,
        d = a.data(c + ".icon");
      if (d) switch (b) {
        case "popover":
          d.popover("hide");
          break;
        case "tooltip":
        default:
          d.tooltip("hide")
      }
    },
    _showTooltip: function (a, b) {
      var c = this._namespace,
        d = a.data(c + ".icon");
      if (d) switch (b) {
        case "popover":
          d.popover("show");
          break;
        case "tooltip":
        default:
          d.tooltip("show")
      }
    }
  });
}(jQuery));
