import { Model } from '../plugin/mvp/model';
import EventEmmiter from '../plugin/utils/emmiter';

describe('Тестирование модели: ', () => {

  let options: ViewOptions;
  let model: Model;
  let emmiter: EventEmmiter;

  let dispatchEmmiterSpy: jest.SpyInstance; 

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

    emmiter = new EventEmmiter();

    model = new Model(options, emmiter);

    dispatchEmmiterSpy = jest.spyOn(emmiter, 'dispatch').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();     
  });

  test('модель должна существовать и быть типом function', () => {
    expect(Model).toBeDefined();
    expect(typeof Model).toBe('function');
  });

  test('экземпляр модели должен содержать свойства: options, defaultValues', () => {
    expect(model.options).toBeDefined();
    expect(model.defaultOptions).toBeDefined();
  });

  test('экземпляр модели должен содержать новый объект с типом ViewOptions в свойстве options, а не хранить ссылку на объект свойства defaultValues', () => {
    expect(model.options).toEqual(model.defaultOptions);
    expect(model.options).not.toBe(model.defaultOptions);
  });

  test('метод setData должен изменять значение свойства options по получаемому объекту типа Options и вызывать функцию определения типа событий', () => {
    const inputContent: Options = { maximumValue: '99'};
    const defineEventTypeSpy = jest.spyOn(model, 'defineEventType').mockImplementation(() => {});

    model.setData(inputContent);

    expect(model.options).toMatchObject(inputContent);
    expect(defineEventTypeSpy).toHaveBeenCalled();
  });

  test('метод getDefaultValues должен возвращать копию объекта свойства defaultValues', () => {
    const copy: ViewOptions = model.getDefaultValues();

    expect(copy).toEqual(model.defaultOptions);
    expect(copy).not.toBe(model.defaultOptions);
  });

  // Options => void
  test('метод defineEventType должен определять тип события по ключу, переданного в качестве аргумента, и отправлять ' + 
    'количество событий равное количеству ключей передаваемого объекта' , () => {
      
      const inputContent: Options = {
        minimumValue: '0',
        maximumValue: '100',
        defaultValue: '50',
        defaultInterval: ['25', '75'],
        showValue: false,
        step: '5',
        orientation: 'Horizontal',
        mode: 'Single',
        showScale: false
      };
    
      model.defineEventType(inputContent)
      expect(dispatchEmmiterSpy).toHaveBeenCalledTimes(Object.keys(inputContent).length);
  });

  // boolean => void
  test('метод updateInfoFromSettings должен обновлять опцию отображения значения и отправлять событие об этом изменении', () => {
    const inputValue = true;
    
    expect(model.options.showValue).not.toEqual(inputValue);

    model.updateInfoFromSettings(inputValue);

    expect(model.options.showValue).toEqual(inputValue);
    expect(dispatchEmmiterSpy).toHaveBeenCalledTimes(1);
  });

  // (number, number) => string
  test('метод defineValueFromPixel должен переводить шаг из значения в пискелях в целое число и возвращать в виде строки. Значение должно округляться в большую сторону', () => {
    let inputPositionValue = 200;
    let inputStepValue = 20;

    let outputValue = model.defineValueFromPixel(inputPositionValue, inputStepValue);

    expect(typeof outputValue).toEqual('string');
    expect(outputValue).toEqual('50');
    
    inputPositionValue = 200;
    inputStepValue = 80;

    outputValue = model.defineValueFromPixel(inputPositionValue, inputStepValue);
    expect(outputValue).toEqual('13');
  });

  // string => number
  test('метод defineIndexMutableValue должен определять индекс значения для изменения интервала', () => {
    const inputValue = '50';
    const outputIndex = model.defineIndexMutableValue(inputValue);

    expect(outputIndex).toEqual(1);
  });

  // string => void
  test('метод updateValueFromScale должен изменять значение слайдера и отправлять событие об этом изменении', () => {
    
    model.options.mode = 'Multiple';
    
    const inputValue = '70';
    const defineIndexMutableValueSpy = jest.spyOn(model, 'defineIndexMutableValue').mockImplementation(() => 1);

    expect(model.options.defaultInterval[1]).not.toEqual(inputValue);

    model.updateValueFromScale(inputValue);

    expect(defineIndexMutableValueSpy).toHaveBeenCalledTimes(1);
    expect(model.options.defaultInterval[1]).toEqual(inputValue);
    expect(dispatchEmmiterSpy).toHaveBeenCalledTimes(1);

    defineIndexMutableValueSpy.mockClear();
    dispatchEmmiterSpy.mockClear();

    function changeValue() {
      model.updateValueFromScale(inputValue);
    }   

    expect(defineIndexMutableValueSpy).not.toHaveBeenCalled();
    expect(changeValue).toThrowError(new Error('no change required'));
    expect(dispatchEmmiterSpy).not.toHaveBeenCalled();
 
    model.options.mode = 'Single';

    expect(model.options.defaultValue).not.toEqual(inputValue);

    model.updateValueFromScale(inputValue);

    expect(defineIndexMutableValueSpy).not.toHaveBeenCalled();
    expect(model.options.defaultValue).toEqual(inputValue);
    expect(dispatchEmmiterSpy).toHaveBeenCalledTimes(1);
  });
  
  test('метод getModelData должен возвращать новый объект, содержащий ссылки на свойства: options, defaultValues', () => {
    const outputValue: Pick<Model, 'defaultOptions' | 'options'> = model.getModelData();

    expect(model.defaultOptions).toEqual(outputValue.defaultOptions);
    expect(model.defaultOptions).toBe(outputValue.defaultOptions);
    expect(model.options).toEqual(outputValue.options);
    expect(model.options).toBe(outputValue.options);
  });
});