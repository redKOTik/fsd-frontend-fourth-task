import EventEmmiter from '../utils/emmiter';
import { Validator } from '../utils/validator';

import {
  createSettings,
  setElementsForValues,
  initValues,
  findElements,
  setNewData,
  setNodeValue,
  diversification
} from '../utils/view.functions';

interface ISettingsView {
  element: HTMLDivElement;
  updateSettingsView(dataModel: ViewOptions, prevData: ViewOptions): void;
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
    const target: HTMLElement = event.target as HTMLElement;
    switch (target.className) {
      case 'info':
        this.emmiter.dispatch('setting:info-changed', { showValue: (<HTMLInputElement> target).checked });
        return;
      case 'scale-input':
        this.emmiter.dispatch('setting:scale-changed', { showScale: (<HTMLInputElement> target).checked });
        return; 
    }
  }

  // set listener
  onChangeSettings(): void {
    this.element.addEventListener('change', this.changeSettingsHandler);
  }

  updateSettingsView(newDataModel: ViewOptions, prevData: ViewOptions): void {
    console.log('settings update', newDataModel);
    setNewData(newDataModel, prevData, this.view, this.$object, this.validator);
  }
}

export { SettingsView, ISettingsView };