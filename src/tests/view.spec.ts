import $ from 'jquery';
import { View } from '../plugin/mvp/view';
import EventEmmiter from '../plugin/utils/emmiter';

describe('Тестирование вида слайдера: ', () => {
    let options: ViewOptions;
    let view: View;
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
        view = new View($(wrapper), options, emmiter);
    });

    test('вид должен существовать и быть объектом', () => {
      expect(view).toBeDefined();
      expect(typeof view).toBe('object');
    });

    test('экземпляр вида должен содержать методы обновления вида:', () => {
      expect(view.handleValueChanged).toBeDefined();
      expect(view.handleViewChanged).toBeDefined();
      expect(view.handleModeChanged).toBeDefined();
      expect(view.handleTypeChanged).toBeDefined();
      expect(view.handleRangeChanged).toBeDefined();
      expect(view.handleStepChanged).toBeDefined();
    });

    test('вид должен иметь элемент с классом slider:', () => {
      const slider = view?.$view.find('.slider');
      expect(slider).toBeDefined();
    });
});