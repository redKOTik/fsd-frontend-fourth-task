import EventEmmiter from "../utils/emmiter";

interface IModel {
  readonly defaultOptions: ViewOptions
  options: ViewOptions
}

/**
 * @class Model
 *
 * Управляет данными слайдера.
 * 
 * @param options
 */
class Model implements IModel {
  defaultOptions: ViewOptions;
  options: ViewOptions;

  constructor(options: ViewOptions, public emmiter: EventEmmiter) {
    this.defaultOptions = options;
    this.options = { ...this.defaultOptions };
  }

  setData(content: Options): void {
    console.log('update model', content);
    //const prevOptions = { ...this.options };
    this.options = Object.assign({}, this.options, content);
    this.defineEventType(content);    
  }

  getModelData(): Pick<Model, 'defaultOptions' | 'options'> {
    const { defaultOptions, options } = { ...this };
    return {
      defaultOptions,
      options
    }
  }

  getDefaultValues(): ViewOptions {
    return {
      ...this.defaultOptions
    }
  }  

  defineEventType(content: Options): void {
    Object.keys(content).forEach(key => {      
      switch(key) {
        case 'showValue':
          this.emmiter.dispatch('model:setting-updated', {'showValue': content.showValue as boolean});
          break;
        case 'showScale':
          this.emmiter.dispatch('model:setting-updated', {'showScale': content.showScale as boolean});
          break;
        case 'mode':
          this.emmiter.dispatch('model:mode-updated', {
            'mode': content.mode as Mode, 
            'defaultValue': this.options.defaultValue, 
            'defaultInterval': this.options.defaultInterval
          });
          break;
        case 'orientation':
          this.emmiter.dispatch('model:type-updated', {'orientation': content.orientation as Orientation});
          break;
        case 'minimumValue':
        case 'maximumValue':
          this.emmiter.dispatch('model:range-updated', { [key]: content[key] as string});
          break;
        case 'defaultValue':
        case 'defaultInterval':
          this.emmiter.dispatch('model:value-changed', {
            'mode': this.options.mode, 
            'defaultValue': this.options.defaultValue, 
            'defaultInterval': this.options.defaultInterval
          });  
          break;
        case 'step':
          this.emmiter.dispatch('model:step-updated', { step: content.step as string});
          break;
      }
    })
  }

  // methods

  updateInfoFromSettings(value: boolean): void {
    if (this.options.showValue !== value) {
      this.options.showValue = value;
      this.emmiter.dispatch('model:setting-updated', {'showValue': this.options.showValue});
    }    
  }

  updateScaleFromSettings(value: boolean): void {
    if (this.options.showScale !== value) {
      this.options.showScale = value;
      this.emmiter.dispatch('model:setting-updated', {'showScale': this.options.showScale});
    }    
  }

  updateModeFromSettings(value: Mode): void {
    if (this.options.mode !== value) {
      this.options.mode = value;
      this.emmiter.dispatch('model:mode-updated', {
        'mode': this.options.mode, 
        'defaultValue': this.options.defaultValue, 
        'defaultInterval': this.options.defaultInterval
      });
    }    
  }

  updateTypeFromSettings(value: Orientation): void {
    if (this.options.orientation !== value) {
      this.options.orientation = value;
      this.emmiter.dispatch('model:type-updated', {'view': this.options.orientation});
    }    
  }

  updateRangeFromSettings(value: string, tag: 'minimumValue' | 'maximumValue'): void {
    if (this.options[tag] !== value) {
      this.options[tag] = value;
      this.emmiter.dispatch('model:range-updated', { [tag]: this.options[tag]});
    }    
  }

  updateStepFromSettings(value: string): void {
    if (this.options.step !== value) {
      this.options.step = value;
      this.emmiter.dispatch('model:step-updated', { step: this.options.step});
    }    
  }

  updateValueFromScale(value: string): void {
    if (this.options.mode === 'Multiple') {
      if (this.options.defaultInterval.includes(value)) {
        throw new Error('no change required');
      }
      this.options.defaultInterval[this.defineIndexMutableValue(value)] = value;
      this.emmiter.dispatch('model:value-changed', {'defaultInterval': this.options.defaultInterval, 'mode': this.options.mode});
    } else {
      this.options.defaultValue = value;
      this.emmiter.dispatch('model:value-changed', {'defaultValue': this.options.defaultValue, 'mode': this.options.mode});  
    }
  }

  updateValueFromThumb(value: string, index: number): void {
    if (this.options.mode === 'Multiple') {      
      this.options.defaultInterval[index] = value;
      this.emmiter.dispatch('model:value-changed', {'defaultInterval': this.options.defaultInterval, 'mode': this.options.mode});
    } else {
      this.options.defaultValue = value;
      this.emmiter.dispatch('model:value-changed', {'defaultValue': this.options.defaultValue, 'mode': this.options.mode});  
    }
  }

  defineValueFromPixel(position: number, step: number): string {
    return `${Math.floor(position / step * +this.options.step)}`;
  }

  defineIndexMutableValue(value: string): number {
    const delta = (+this.options.defaultInterval[1] + +this.options.defaultInterval[0]) / 2;    
    return +value >= delta ? 1 : 0; 
  }

  // view handlers

  handleThumbMoved: (data: DispatchData) => void = (data: DispatchData) => {
    const value = data.value 
      ? data.value as string 
      : this.defineValueFromPixel(data.position as number, data.step as number);
    this.updateValueFromThumb(value, +data.index);
  }

  handleScaleClicked: (data: DispatchData) => void = (data: DispatchData) => {
    this.updateValueFromScale(data.value as string);
  }
 
  // settings handlers

  handleInfoChanged: (data: DispatchData) => void = (data: DispatchData) => {
    this.updateInfoFromSettings(data.showValue as boolean);
  }

  handleScaleChanged: (data: DispatchData) => void = (data: DispatchData) => {
    this.updateScaleFromSettings(data.showScale as boolean);
  }

  handleModeChanged: (data: DispatchData) => void = (data: DispatchData) => {
    this.updateModeFromSettings(data.mode as Mode);
  }

  handleTypeChanged: (data: DispatchData) => void = (data: DispatchData) => {
    this.updateTypeFromSettings(data.view as Orientation);
  }

  handleRangeChanged: (data: DispatchData) => void = (data: DispatchData) => {
    this.updateRangeFromSettings(data.value as string, data.tag as 'minimumValue' | 'maximumValue');
  }

  handleStepChanged: (data: DispatchData) => void = (data: DispatchData) => {
    this.updateStepFromSettings(data.step as string);
  }
}

export { Model };