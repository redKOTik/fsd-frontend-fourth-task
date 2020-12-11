import { Model } from '../plugin/mvp/model';

describe('Тестирование модели: ', () => {

  let options: ViewOptions;
  let model: Model;

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

    model = new Model(options);
  });

  test('модель должна существовать и быть типом function', () => {
    expect(Model).toBeDefined();
    expect(typeof Model).toBe('function');
  });

  test('экземпляр модели должен содержать метод обновления данных: updateData, свойства: options, defaultValues, observers', () => {
    expect(model.updateData).toBeDefined();
    expect(model.options).toBeDefined();
    expect(model.defaultValues).toBeDefined();
    expect(model.observers).toBeDefined();
  });

  test('экземпляр модели должен содержать новый объект с типом ViewOptions в свойстве options, а не хранить ссылку на объект свойства defaultValues', () => {
    expect(model.options).toEqual(model.defaultValues);
    expect(model.options).not.toBe(model.defaultValues);
  });

  test('метод subscbribe должен принимать функцию и помещать ее в массив свойства observers, а возвращать объект с методом unsubscribe, который очищает массив от наблюдателя', () => {
    const fn = (data: ViewOptions, prevData:ViewOptions) => {
      return {
        data,
        prevData      
      };
    }

    expect(model.subscribe).toBeDefined();    
    
    const object = model.subscribe(fn);
    expect(model.observers).toContain(fn);

    expect(object.unsubscribe).toBeDefined();
    expect(typeof object.unsubscribe).toBe('function');

    object.unsubscribe();
    expect(model.observers).not.toContain(fn);
  });

  test('метод setData должен изменять значение свойства options по получаемому объекту типа Options и передавать в вызов функции наблюдателей старые и обновленные данные', () => {
    const newContent: Options = { maximumValue: '99'};
    const observer: (data: ViewOptions, prevData: ViewOptions) => void = jest.fn(() => {});

    model.subscribe(observer);
    model.setData(newContent);

    expect(model.options).toMatchObject(newContent);
    expect(observer).toHaveBeenCalled();
  });

  test('метод getDefaultValues должен возвращать копию объекта свойства defaultValues', () => {
    const copy: ViewOptions = model.getDefaultValues();

    expect(copy).toEqual(model.defaultValues);
    expect(copy).not.toBe(model.defaultValues);
  });

  test('метод getModelData должен возвращать новый объект, содержащий ссылки на свойства: options, defaultValues', () => {
    const data: Pick<Model, 'defaultValues' | 'options'> = model.getModelData();
    //data.defaultValues.maximumValue = "99";

    expect(model.defaultValues).toEqual(data.defaultValues);
    expect(model.defaultValues).toBe(data.defaultValues);
    expect(model.options).toEqual(data.options);
    expect(model.options).toBe(data.options);
  });

  test('метод updateData должен получать ключи типа ViewOptions со значениями и обновлять их по соотвестующим ключам объекта свойства options иначе выбрасывать ошибку', () => {
    
    const spy = jest.spyOn(model, 'setData').mockImplementation(() => {});     
    
    model.updateData('maximumValue', '99', 'test');
    expect(spy).toHaveBeenCalled();

    model.updateData(undefined, undefined, 'test');
    expect(model.updateData).toThrowError();
  });
});