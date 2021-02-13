import $ from 'jquery';
import Presentor from '../plugin/mvp/presentor';

describe('Интеграционное тестирование компонентов: ', () => {
  let options: ViewOptions;
  let presentor: Presentor;
  let wrapper: HTMLDivElement;
  let modelOptions: ViewOptions;
  const event = new Event('change', { bubbles: true });

  beforeEach(() => {
    options = {
      minimumValue: '0',
      maximumValue: '100',
      defaultValue: '50',
      defaultInterval: ['25', '75'],
      showValue: false,
      showSettings: true,
      step: '5',
      orientation: 'Horizontal',
      mode: 'Single',
      onValueChanged: undefined,
      measurement: '₽',
      showScale: false
    };

    wrapper = document.createElement('div') as HTMLDivElement;
    wrapper.id = 'slider';
    document.body.insertAdjacentElement('afterbegin', wrapper);
    presentor = new Presentor($(wrapper), options);
    modelOptions = presentor.getModel().options;
  });

  test('проверить изменение данных модели после изменения настроек вида (изменение шага)', () => {
    const inputValue = '10';   
    const stepInput = presentor.settings!.element.querySelector('.step') as HTMLInputElement;
    stepInput.value = inputValue;

    expect(modelOptions.step).not.toBe(inputValue);

    stepInput.dispatchEvent(event);
    expect(modelOptions.step).toBe(inputValue);
  });

  test('проверить изменение данных модели после изменения настроек вида (изменение минимальной границы)', () => {
    const rangeValue = '15';
    const rangeInput = presentor.settings!.element.querySelector('.range:first-of-type') as HTMLInputElement;
    rangeInput.value = rangeValue;

    expect(modelOptions.minimumValue).not.toBe(rangeValue);

    rangeInput.dispatchEvent(event);
    expect(modelOptions.minimumValue).toBe(rangeValue);
  });

  test('проверить изменение данных модели после изменения настроек вида (изменение максимальной границы)', () => {
    const rangeValue = '90';
    const rangeInput = presentor.settings!.element.querySelector('.range:last-of-type') as HTMLInputElement;
    rangeInput.value = rangeValue;

    expect(modelOptions.maximumValue).not.toBe(rangeValue);

    rangeInput.dispatchEvent(event);
    expect(modelOptions.maximumValue).toBe(rangeValue);
  });

  test('проверить изменение данных модели после изменения настроек вида (изменение значения)', () => {
    const value = '80';
    const valueInput = presentor.settings!.element.querySelector('.values[data-order="0"]') as HTMLInputElement;
    valueInput.value = value;

    expect(modelOptions.defaultValue).not.toBe(value);
    expect((presentor.view?.$view.find('.thumb')[0] as HTMLButtonElement).value).not.toBe(value);

    valueInput.dispatchEvent(event);
    expect(modelOptions.defaultValue).toBe(value);
    expect((presentor.view?.$view.find('.thumb')[0] as HTMLButtonElement).value).toBe(value);
  });

  test('проверить изменение данных модели после изменения настроек вида (изменение интервала)', () => {
    const inputValue = 'Multiple';
    const modeInput = presentor.settings!.element.querySelector('.mode') as HTMLInputElement;
    modeInput.value = inputValue;
    modeInput.dispatchEvent(event);    

    const value = '90';
    const valueInput = presentor.settings!.element.querySelector('.values[data-order="1"]') as HTMLInputElement;
    valueInput.value = value;

    expect(modelOptions.defaultInterval[1]).not.toBe(value);
    expect((presentor.view?.$view.find('.thumb')[1] as HTMLButtonElement).value).not.toBe(value);

    valueInput.dispatchEvent(event);
    expect(modelOptions.defaultInterval[1]).toBe(value);
    expect((presentor.view?.$view.find('.thumb')[1] as HTMLButtonElement).value).toBe(value);
  });

  test('проверить изменение данных модели после изменения настроек вида (изменение показа шкалы)', () => {
    const inputValue = true;
    const showScaleInput = presentor.settings!.element.querySelector('.scale-input') as HTMLInputElement;
    showScaleInput.checked = inputValue;

    expect(modelOptions.showScale).not.toBe(inputValue);
    expect(presentor.view?.$view.find('.scale').length).toBe(0);

    showScaleInput.dispatchEvent(event);
    expect(modelOptions.showScale).toBe(inputValue);
    expect(presentor.view?.$view.find('.scale').length).toBe(1);
  });

  test('проверить изменение данных модели после изменения настроек вида (изменение показа значения над ползунком)', () => {
    const inputValue = true;
    const showValueInput = presentor.settings!.element.querySelector('.info') as HTMLInputElement;
    showValueInput.checked = inputValue;

    expect(modelOptions.showValue).not.toBe(inputValue);
    expect(presentor.view?.$view.find('.label').length).toBe(0);

    showValueInput.dispatchEvent(event);
    expect(modelOptions.showValue).toBe(inputValue);
    expect(presentor.view?.$view.find('.label').length).toBe(1);
  });

  test('проверить изменение данных модели после изменения настроек вида (изменение вида)', () => {
    const inputValue = 'Vertical';
    const viewInput = presentor.settings!.element.querySelector('.view') as HTMLInputElement;
    viewInput.value = inputValue;

    expect(modelOptions.orientation).not.toBe(inputValue);
    expect(presentor.view?.$view.find('.slider__vertical').length).toBe(0);

    viewInput.dispatchEvent(event);
    expect(modelOptions.orientation).toBe(inputValue);
    expect(presentor.view?.$view.find('.slider__vertical').length).toBe(1);
  });

  test('проверить изменение данных модели после изменения настроек вида (изменение режима)', () => {
    const inputValue = 'Multiple';
    const modeInput = presentor.settings!.element.querySelector('.mode') as HTMLInputElement;
    modeInput.value = inputValue;

    expect(modelOptions.mode).not.toBe(inputValue);
    expect(presentor.view?.$view.find('.thumb').length).toBe(1);

    modeInput.dispatchEvent(event);
    expect(modelOptions.mode).toBe(inputValue);
    expect(presentor.view?.$view.find('.thumb').length).toBe(2);
  });
});