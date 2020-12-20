import EventEmmiter from '../utils/emmiter';
import { Validator } from '../utils/validator';

import {
  createSettings,
  setElementsForValues,
  initValues,
  findElements,
  setNodeValue,
  diversification
} from '../utils/view.functions';

interface ISettingsView {
  element: HTMLDivElement;
  handleSettingsViewChanged: (data: Options) => void;
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
  validator: Validator;
  constructor(public $object: JQuery, dataModel: ViewOptions, public emmiter: EventEmmiter) {
    this.element = createSettings();
    this.validator = new Validator();
    this.render($object, this.element);
    this.init(dataModel, this.element);
    this.onChangeSettings();
  }

  render($object: JQuery, view: HTMLDivElement): void {
    $object.before(view);
  }

  init(data: ViewOptions, view: HTMLDivElement): void {
    const {
      showValueInput,
      showScaleInput,
      orientationInputs,
      modeInputs,
      stepInput,
      minInput,
      maxInput,
      divWithValue } = findElements(view);
    const values: HTMLInputElement[] = setElementsForValues(divWithValue, data.mode);
    const siblings: HTMLDivElement = view.nextSibling as HTMLDivElement;

    showValueInput.checked = data.showValue;
    showScaleInput.checked = data.showScale;
    setNodeValue(diversification(orientationInputs, siblings.id), data.orientation);
    setNodeValue(diversification(modeInputs, siblings.id), data.mode);
    stepInput.value = data.step;
    minInput.value = data.minimumValue;
    maxInput.value = data.maximumValue;
    initValues(data.mode, values, data.defaultValue, data.defaultInterval);
  }

  // handler
  changeSettingsHandler: (event: Event) => void = (event: Event) => {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    switch (target.className) {
      case 'info':
        this.emmiter.dispatch('setting:info-changed', { showValue: target.checked });
        return;
      case 'scale-input':
        this.emmiter.dispatch('setting:scale-changed', { showScale: target.checked });
        return;
      case 'mode':
        this.emmiter.dispatch('setting:mode-changed', { mode: target.value });
        return;
      case 'view':
        this.emmiter.dispatch('setting:type-changed', { view: target.value });
        return; 
      case'range':
        this.emmiter.dispatch('setting:range-changed', {value: target.value, tag: `${target.name}Value` });
        return;
      case 'step':
        this.emmiter.dispatch('setting:step-changed', { step: target.value });
        return;
      case 'values':
        this.emmiter.dispatch('setting:value-changed', { value: target.value, index: target.dataset.order });
        return;      
    }
  }

  // set listener
  onChangeSettings(): void {
    this.element.addEventListener('change', this.changeSettingsHandler);
  }

  // model handler
  handleSettingsViewChanged: (data: Options) => void = (data: Options) => {
    const {
      showValueInput,
      showScaleInput,
      orientationInputs,
      modeInputs,
      stepInput,
      minInput,
      maxInput,
      divWithValue } = findElements(this.element);
    switch (Object.keys(data)[0]) {
      case 'showValue':
        showValueInput.checked = data.showValue as boolean;
        break;
      case 'showScale':
        showScaleInput.checked = data.showScale as boolean;
        break;
      case 'orientation':
        setNodeValue(orientationInputs, data.orientation as Orientation);
        break;
      case 'mode':
        setNodeValue(modeInputs, data.mode as Mode);
        initValues(data.mode as Mode, setElementsForValues(divWithValue, data.mode as Mode), data.defaultValue as string, data.defaultInterval as [string, string]);
        break;
      case 'step':
        stepInput.value = data.step as string;
        break;
      case 'minimumValue':
        minInput.value = data.minimumValue as string;
        break;
      case 'maximumValue':
        maxInput.value = data.maximumValue as string;
        break;
      case 'defaultValue':
      case 'defaultInterval':
        initValues(data.mode as Mode, setElementsForValues(divWithValue, data.mode as Mode), data.defaultValue as string, data.defaultInterval as [string, string]);
        break;         
    }
  }
}

export { SettingsView, ISettingsView };