import $ from 'jquery';
import { View } from '../plugin/mvp/view';
import EventEmmiter from '../plugin/utils/emmiter';

describe('Тестирование вида слайдера: ', () => {
    let options: ViewOptions;
    let view: View;
    let wrapper: HTMLDivElement;
    let emmiter: EventEmmiter;

    let createViewSpy: jest.SpyInstance;

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

        createViewSpy = jest.spyOn(View.prototype, 'createView');

        emmiter = new EventEmmiter();
        wrapper = document.createElement('div') as HTMLDivElement;
        wrapper.id = 'slider';
        document.body.insertAdjacentElement('afterbegin', wrapper);
        view = new View($(wrapper), options, emmiter);

        ;
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
      const $slider = view?.$view.find('.slider');
      expect($slider.length > 0).toBeTruthy();
    });

    test('создание вида должно сопровождаться вызовом функции createView', () => {
      expect(createViewSpy).toHaveBeenCalled();
    });

    test('создание вида сопровождается созданием компонентов', () => {

      const progressBar = view?.$view.find('.progress-bar');
      expect(progressBar).toBeDefined();

      const $thumb = view?.$view.find('.thumb');
      expect($thumb).toBeDefined();

      if ($thumb.length > 1) {
        $thumb.each((i, v) => {
          if (v instanceof HTMLButtonElement)
            expect(v.value).toEqual(options.defaultInterval[i]);
        });          
      } else {
        expect($thumb.val()).toEqual(options.defaultValue);
      }

      options.mode === 'Single'
        ? expect($thumb.length).toEqual(1)
        : expect($thumb.length).toEqual(2);

      if (options.showScale) {
        const $scale = view?.$view.find('.scale');      
        expect($scale).toBeDefined();

        const $mark = $scale.find('.mark-content');

        $mark.each((i, v) => {
          if (i === 0)
            expect(v.textContent).toEqual(options.minimumValue);

          if (i === $mark.length - 1)
            expect(v.textContent).toEqual(options.maximumValue); 
        });        
      }

      if (options.showValue) {
        const $label = view?.$view.find('.slider-label');
        expect($label).toBeDefined();
        
        if ($label.length > 1) {
          $label.each((i, v) => {
            expect(v.textContent).toEqual(options.defaultInterval[i]);
          });          
        } else {
          expect($label.text()).toEqual(options.defaultValue);
        }

        options.mode === 'Single'
          ? expect($label.length).toEqual(1)
          : expect($label.length).toEqual(2);
      }    
    });
});