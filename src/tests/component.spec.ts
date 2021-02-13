import Label from "../plugin/mvp/components/label";
import Thumb from "../plugin/mvp/components/thumb";
import ProgressBar from "../plugin/mvp/components/progress-bar";

const testComponentDestroy = (instance: Thumb | Label | ProgressBar, className: string) => {
  document.body.insertAdjacentElement('afterbegin', instance.element);
  if (instance instanceof Label)
    instance.activeLabel = true;
  let domElement = document.querySelector(className);
  expect(domElement).toBeDefined();

  instance.destroy();

  domElement = document.querySelector(className);
  expect(domElement).toBeNull();

  if (instance instanceof Label)
    expect(instance.activeLabel).toBeFalsy();
}

describe('Тестирование Label: ', () => {
  let options: ViewOptions;
  let label: Label;

  beforeEach(() => {
    options = {
      minimumValue: '0',
      maximumValue: '100',
      defaultValue: '50',
      defaultInterval: ['25', '75'],
      showValue: true,
      showSettings: true,
      step: '5',
      orientation: 'Horizontal',
      mode: 'Single',
      onValueChanged: undefined,
      measurement: '₽',
      showScale: true
    };

    label = new Label(options.orientation, options.mode);
  });

  test('компонент должен быть HTMLSpanElement', () => {
    expect(label.element instanceof HTMLSpanElement).toBeTruthy();
  });

  test('проверка метода setTextContent', () => {
    const expectValue = options.defaultValue;
    label.setTextContent(expectValue);
    expect(label.element.textContent).toEqual(expectValue);
  });

  test('проверка метода destroy', () => {
    testComponentDestroy(label, '.label');
  });
});

describe('Тестирование Thumb: ', () => {
  let options: ViewOptions;
  let thumb: Thumb;

  beforeEach(() => {
    options = {
      minimumValue: '0',
      maximumValue: '100',
      defaultValue: '50',
      defaultInterval: ['25', '75'],
      showValue: true,
      showSettings: true,
      step: '5',
      orientation: 'Horizontal',
      mode: 'Multiple',
      onValueChanged: undefined,
      measurement: '₽',
      showScale: true
    };

    thumb = new Thumb(options.orientation, options.mode);
  });

  test('компонент должен быть HTMLButtonElement', () => {
    expect(thumb.element instanceof HTMLButtonElement).toBeTruthy();
  });

  test('проверка метода setOnElementDefaultValue', () => {
    const expectValue = options.defaultValue;
    thumb.setOnElementDefaultValue(expectValue);
    expect(thumb.element.value).toEqual(expectValue);
  });

  test('проверка методов setUniqueAttr, getUniqueAttr, computeThumbIndex', () => {
    const expectValue = 'second';
    thumb.setUniqueAttr(expectValue);
    expect(thumb.getUniqueAttr()).toEqual(expectValue);
    expect(thumb.computeThumbIndex()).toEqual(1);

    thumb.setUniqueAttr('0');
    expect(thumb.computeThumbIndex()).toEqual(0);
  });

  test('проверка метода destroy', () => {
    testComponentDestroy(thumb, '.thumb');
  });
});

describe('Тестирование ProgressBar: ', () => {
  let options: ViewOptions;
  let progressBar: ProgressBar;

  beforeEach(() => {
    options = {
      minimumValue: '0',
      maximumValue: '100',
      defaultValue: '50',
      defaultInterval: ['25', '75'],
      showValue: true,
      showSettings: true,
      step: '5',
      orientation: 'Horizontal',
      mode: 'Single',
      onValueChanged: undefined,
      measurement: '₽',
      showScale: true
    };

    progressBar = new ProgressBar(options.orientation, options.mode);
  });

  test('компонент должен быть HTMLDivElement', () => {
    expect(progressBar.element instanceof HTMLDivElement).toBeTruthy();
  });

  test('проверка метода destroy', () => {
    testComponentDestroy(progressBar, '.progress-bar');
  });

});