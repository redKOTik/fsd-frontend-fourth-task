import $ from 'jquery';
import { SettingsView } from '../plugin/mvp/settingsView';
import EventEmmiter from '../plugin/utils/emmiter';

describe('Тестирование вида настроек: ', () => {
  let options: ViewOptions;
  let settings: SettingsView;
  let wrapper: HTMLDivElement;
  let emmiter: EventEmmiter;

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
    wrapper = document.createElement('div') as HTMLDivElement;
    wrapper.id = 'slider';
    document.body.insertAdjacentElement('afterbegin', wrapper);
    settings = new SettingsView($(wrapper), options, emmiter);
  });

  test('вид настроек должен существовать и быть типом object', () => {
    expect(settings.element).toBeDefined();
    expect(typeof settings).toBe('object');
  });

  test('экземпляр вида настроек должен содержать методы обновления вида настроек:', () => {
    expect(settings.handleSettingsViewChanged).toBeDefined();
  });

  test('вид настроек должен иметь элемент с классом settings:', () => {
    const root = settings.element.querySelector('.settings');
    expect(root).toBeDefined();
  });

});

describe('Тестирование события change вида настроек:', () => {
  let options: ViewOptions;
  let settings: SettingsView;
  let wrapper: HTMLDivElement;
  let emmiter: EventEmmiter;

  let changeSettingsHandlerSpy: jest.SpyInstance;
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

    changeSettingsHandlerSpy = jest.spyOn(SettingsView.prototype, 'changeSettingsHandler').mockImplementation((event) => {
      const target: HTMLInputElement = event.target as HTMLInputElement;
      switch (target.className) {
        case 'step':
          emmiter.dispatch('setting:step-changed', { step: target.value });
          return;
      }
    });

    emmiter = new EventEmmiter();
    wrapper = document.createElement('div') as HTMLDivElement;
    wrapper.id = 'slider';
    document.body.insertAdjacentElement('afterbegin', wrapper);
    settings = new SettingsView($(wrapper), options, emmiter);

    dispatchEmmiterSpy = jest.spyOn(emmiter, 'dispatch').mockImplementation(() => { });
  });

  test('метод changeSettingsHandler должен вызываться при возникновении события изменения настроек и отправлять событие об этом изменении', () => {
    let event = new Event('change', { bubbles: true });

    const stepInput = settings.element.querySelector('.step') as HTMLInputElement;
      stepInput.value = '10';
      stepInput.dispatchEvent(event);

    expect(dispatchEmmiterSpy).toHaveBeenCalledTimes(1);
    expect(changeSettingsHandlerSpy).toHaveBeenCalled();
  });
});