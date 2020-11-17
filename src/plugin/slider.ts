import { Presentor } from '../plugin/mvp/presentor';

(function ($) {

  const pluginName = 'customslider';

  const defaultOptions: ViewOptions = {
    minimumValue: '0',
    maximumValue: '100',
    defaultValue: '50',
    defaultInterval: ['25', '75'],
    showValue: true,
    showSettings: true,
    step: '1',
    orientation: 'Vertical',
    mode: 'Multiple',
    onValueChanged: undefined,
    measurement: '₽'
  }

  const methods: Methods = {
    init: ($object: JQuery, options: ViewOptions) => {
      $object.data(pluginName, new Presentor($object, options));
    },
    update: ($object: JQuery, content: Options) => {
      const plugin: Presentor = $object.data(pluginName) as Presentor;
      plugin.getModel().setData(content);
    },
    destroy: ($object: JQuery) => {
      const plugin: Presentor = $object.data(pluginName) as Presentor;
      plugin.destroy();
      $object.removeData(pluginName);
    },
    value: ($object: JQuery) => {
      const plugin: Presentor = $object.data(pluginName) as Presentor;
      const data: ViewOptions = plugin.getModel().options;
      const value = data.mode === 'Single'
        ? data.defaultValue + data.measurement
        : data.defaultInterval[0] + data.measurement + ' - ' + data.defaultInterval[1] + data.measurement
      return value;
    }
  };

  $.fn.sliderPlugin = function (options?: keyof Methods | Options | boolean | string, args?: Options) {

    const $plugin: JQuery = this.data(pluginName) as JQuery;
    let result: JQuery | string | undefined;
    const $this: JQuery = $plugin;

    if (typeof options === 'string' && options === 'update') {
      const params = args ? args : {};
      methods[options].apply(this, [this, params]);
    } else if (typeof options === 'string' && options === 'destroy') {
      methods[options](this);
    } else if (typeof options === 'string' && options === 'value') {
      result = methods[options](this);
    } else if (typeof options === 'boolean') {
      result = $this;
    } else {
      const opts: ViewOptions = $.extend({}, defaultOptions, options);
      methods['init'].apply(this, [this, opts]);
    }
    return result || $this;
  }

})(jQuery);
