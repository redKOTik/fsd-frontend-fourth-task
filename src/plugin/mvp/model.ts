interface IModel {
  readonly defaultValues: ViewOptions
  options: ViewOptions

  updateData(option: keyof ViewOptions | 'interval__a' | 'interval__b' | undefined,
    value: string | boolean | Mode | Orientation | undefined, source: string): void
}

type modelObserver = (data: ViewOptions, prevData: ViewOptions) => void;

/**
 * @class Model
 *
 * Управляет данными слайдера.
 * 
 * @param options
 */
class Model implements IModel {
  defaultValues: ViewOptions;
  options: ViewOptions;
  observers: (modelObserver)[];

  constructor(options: ViewOptions) {
    this.defaultValues = options;
    this.options = { ...this.defaultValues };

    this.observers = [];
  }

  subscribe(observer: modelObserver): { unsubscribe: () => void } {
    this.observers.push(observer);
    return {
      unsubscribe: (): void => {
        this.observers = this.observers.filter(ob => ob != observer);
      }
    };
  }

  setData(content: Options): void {
    console.log('update model', content);
    const prevOptions = { ...this.options };
    this.options = Object.assign({}, this.options, content);
    if (this.observers.length > 0) {
      this.observers.forEach(observer => observer(this.options, prevOptions));
    }
  }

  getDataModel(): Pick<Model, 'defaultValues' | 'options'> {
    const { defaultValues, options } = { ...this };
    return {
      defaultValues,
      options
    }
  }

  getDefaultValues(): ViewOptions {
    return {
      ...this.defaultValues
    }
  }

  updateData(option: keyof ViewOptions | 'interval__a' | 'interval__b' | undefined,
    value: string | boolean | Mode | Orientation | undefined, source: string): void {
    if (option === undefined || value === undefined) {
      try {
        throw new Error('bad argument');
      } catch (e) {
        console.log('error', e);
      }
    } else if (option === 'interval__a' && typeof value === 'string') {
      this.setData({
        'defaultInterval': [value, this.options.defaultInterval[1]]
      });
    } else if (option === 'interval__b' && typeof value === 'string') {
      this.setData({
        'defaultInterval': [this.options.defaultInterval[0], value]
      });
    } else {
      this.setData({
        [option]: value
      });
    }

    console.log(`update model through ${source}`, this.options);
  }
}

export { Model };