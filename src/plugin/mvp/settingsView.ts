import EventEmmiter from '../utils/emmiter';
import { Validator } from '../utils/validator';

import {
  createSettings,
  makeValuesOfMode,
  initValues,
  findElements,
  setNodeValue,
  diversification,
  findInput
} from '../utils/view.functions';

interface ISettingsView {
  element: HTMLDivElement;
  handleSettingsViewChanged: (data: Options) => void;
  changeSettingsHandler: (event: Event) => void;
}

/**
 * @class ViewSettings
 *
 * Визуальное представление настроек.
 * @param object
 * @param options
 */
class SettingsView implements ISettingsView {
  element: HTMLDivElement;
  elements: Elements;
  validator: Validator;
  constructor(public $object: JQuery, dataModel: ViewOptions, public emmiter: EventEmmiter) {
    this.element = createSettings();    
    this.render($object, this.element);
    this.elements = this.init(dataModel, this.element);
    this.onChangeSettings();

    this.validator = new Validator(this.element, [
      { tag: 'range',  validators: ['required', 'min', 'max', 'interval'] },
      { tag: 'step',  validators: ['required', 'min', 'max'] },
      { tag: 'values',  validators: ['required', 'min', 'max', 'interval'] }
    ], { max: 2000, min: -1000 });
  }

  render($object: JQuery, view: HTMLDivElement): void {
    $object.before(view);
  }
  
  init(data: ViewOptions, view: HTMLDivElement): Elements {
    const elements: Elements = findElements(view);
    makeValuesOfMode(elements.valuesInput, data.mode);
    const siblings: HTMLDivElement = view.nextSibling as HTMLDivElement;

    elements.showValueInput.checked = data.showValue;
    elements.showScaleInput.checked = data.showScale;   
    setNodeValue(diversification(elements.orientationInputs, siblings.id), data.orientation);
    setNodeValue(diversification(elements.modeInputs, siblings.id), data.mode);
    elements.stepInput.value = data.step;
    elements.minInput.value = data.minimumValue;
    elements.maxInput.value = data.maximumValue;
    initValues(data.mode, elements.valuesInput, data.defaultValue, data.defaultInterval);

    return elements;
  }

  // handler
  changeSettingsHandler(event: Event): void {
    const target: HTMLInputElement = event.target as HTMLInputElement;

    if (['range', 'step', 'values'].includes(target.className)) {
      this.validator.validate(target.className, target);
    }

    if (this.validator.formIsValid) {
      this.emmiter.dispatch('setting:info-changed', { showValue: this.elements.showValueInput.checked });
      this.emmiter.dispatch('setting:scale-changed', { showScale: this.elements.showScaleInput.checked });

      const modeInput = findInput(this.elements.modeInputs);
      if (modeInput) {
        this.emmiter.dispatch('setting:mode-changed', { mode: modeInput.value });
      }

      const typeInput = findInput(this.elements.orientationInputs);
      if (typeInput) {
        this.emmiter.dispatch('setting:type-changed', { view: typeInput.value });
      }

      this.emmiter.dispatch('setting:range-changed', {value: this.elements.maxInput.value, tag: `${this.elements.maxInput.name}Value` });
      this.emmiter.dispatch('setting:range-changed', {value: this.elements.minInput.value, tag: `${this.elements.minInput.name}Value` });

      this.emmiter.dispatch('setting:step-changed', { step: this.elements.stepInput.value });
      
      this.elements.valuesInput.forEach(input => {
        if (input.dataset.order) {
          this.emmiter.dispatch('setting:value-changed', { value: input.value, index: input.dataset.order });
        }
      });
    }
  }

  // set listener
  onChangeSettings(): void {
    this.element.addEventListener('change', this.changeSettingsHandler.bind(this));
  }

  // model handler
  handleSettingsViewChanged: (data: Options) => void = (data: Options) => {
    switch (Object.keys(data)[0]) {
      case 'showValue':
        this.elements.showValueInput.checked = data.showValue as boolean;
        break;
      case 'showScale':
        this.elements.showScaleInput.checked = data.showScale as boolean;
        break;
      case 'orientation':
        setNodeValue(this.elements.orientationInputs, data.orientation as Orientation);
        break;
      case 'mode':
        setNodeValue(this.elements.modeInputs, data.mode as Mode);
        makeValuesOfMode(this.elements.valuesInput, data.mode as Mode);
        initValues(data.mode as Mode, this.elements.valuesInput, data.defaultValue as string, data.defaultInterval as [string, string]);
        break;
      case 'step':
        this.elements.stepInput.value = data.step as string;
        break;
      case 'minimumValue':
        this.elements.minInput.value = data.minimumValue as string;
        break;
      case 'maximumValue':
        this.elements.maxInput.value = data.maximumValue as string;
        break;
      case 'defaultValue':
      case 'defaultInterval':
        initValues(data.mode as Mode, this.elements.valuesInput, data.defaultValue as string, data.defaultInterval as [string, string]);
        break;         
    }
  }
}

export { SettingsView, ISettingsView };