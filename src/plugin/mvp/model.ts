import EventEmmiter from "../utils/emmiter";

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

  constructor(options: ViewOptions, public emmiter: EventEmmiter) {
    this.defaultValues = options;
    this.options = { ...this.defaultValues };
  }

  setData(content: Options): void {
    console.log('update model', content);
    const prevOptions = { ...this.options };
    this.options = Object.assign({}, this.options, content);    
  }

  getModelData(): Pick<Model, 'defaultValues' | 'options'> {
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

  /////////////////////////////////////////////

  updateInfoFromSettings(value: boolean): void {
    this.options.showValue = value;
    this.emmiter.dispatch('modal:setting-updated', {'showValue': this.options.showValue});
  }

  updateScaleFromSettings(value: boolean): void {
    this.options.showScale = value;
    this.emmiter.dispatch('modal:setting-updated', {'showScale': this.options.showScale});
  }

  updateModeFromSettings(value: Mode): void {
    this.options.mode = value;
    this.emmiter.dispatch('modal:mode-updated', {'mode': this.options.mode});
  }

  updateTypeFromSettings(value: Orientation): void {
    this.options.orientation = value;
    this.emmiter.dispatch('modal:type-updated', {'view': this.options.orientation});
  }

  updateRangeFromSettings(value: string, tag: 'minimumValue' | 'maximumValue'): void {
    this.options[tag] = value;
    this.emmiter.dispatch('modal:range-updated', { [tag]: this.options[tag]});
  }

  updateValueFromScale(value: string): void {
    if (this.options.mode === 'Multiple') {
      if (this.options.defaultInterval.includes(value)) {
        throw new Error('no change required');
      }
      this.options.defaultInterval[this.defineIndexMutableValue(value)] = value;
      this.emmiter.dispatch('modal:value-changed', {'defaultInterval': this.options.defaultInterval});
    } else {
      this.options.defaultValue = value;
      this.emmiter.dispatch('modal:value-changed', {'defaultValue': this.options.defaultValue});  
    }
  }

  updateValueFromThumb(value: string, index: number): void {
    if (this.options.mode === 'Multiple') {      
      this.options.defaultInterval[index] = value;
      this.emmiter.dispatch('modal:value-changed', {'defaultInterval': this.options.defaultInterval});
    } else {
      this.options.defaultValue = value;
      this.emmiter.dispatch('modal:value-changed', {'defaultValue': this.options.defaultValue});  
    }
  }

  defineValueFromPixel(position: number, step: number): string {
    return `${Math.round(position / step * +this.options.step)}`;
  }

  defineIndexMutableValue(value: string): number {
    const delta = (+this.options.defaultInterval[1] + +this.options.defaultInterval[0]) / 2;    
    return +value >= delta ? 1 : 0; 
  }

  // view handlers

  handleThumbMoved: (data: {[key: string]: any}) => void = (data: {[key: string]: any}) => {
    this.updateValueFromThumb(this.defineValueFromPixel(data.position, data.step), data.index);
  }

  handleScaleClicked: (data: {[key: string]: any}) => void = (data: {[key: string]: any}) => {
    this.updateValueFromScale(data.value);
  }
 
  // settings handlers

  handleInfoChanged: (data: {[key: string]: any}) => void = (data: {[key: string]: any}) => {
    this.updateInfoFromSettings(data.showValue);
  }

  handleScaleChanged: (data: {[key: string]: any}) => void = (data: {[key: string]: any}) => {
    this.updateScaleFromSettings(data.showScale);
  }

  handleModeChanged: (data: {[key: string]: any}) => void = (data: {[key: string]: any}) => {
    this.updateModeFromSettings(data.mode);
  }

  handleTypeChanged: (data: {[key: string]: any}) => void = (data: {[key: string]: any}) => {
    this.updateTypeFromSettings(data.view);
  }

  handleRangeChanged: (data: {[key: string]: any}) => void = (data: {[key: string]: any}) => {
    this.updateRangeFromSettings(data.value, data.tag);
  }
}

export { Model };