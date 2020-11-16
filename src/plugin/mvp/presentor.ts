import { Model } from './model';
import { View, IView } from './view';
import { SettingsView, ISettingsView } from './settingsView';
/**
* @class Presentor
*
* Реализация взаимодействия между Моделью и Видом слайдера
*
* @param model
* @param view
*/
class Presentor {
   model: Model;
   view?: IView;
   settings?: ISettingsView;
   unsub: { unsubscribe: () => void }[] = [];

   constructor($object: JQuery, options: ViewOptions) {
      this.model = new Model(options);

      this.initView($object);
      this.initSettings($object, options);
      this.subOnCustomEvents(options);
   }

   private initSettings($object: JQuery, options: ViewOptions) {
      if (options.showSettings) {
         this.settings = new SettingsView($object, this.model.getDefaultValues());
         this.settings.view.addEventListener('change', this.handleChangeModelFromSettings);
         this.unsub.push(this.model.subscribe(this.handleUpdateSettingsView));
      }
   }
   private initView($object: JQuery) {
      this.view = new View($object, this.model.getDataModel().options);
      this.view.initHandleChangeModel(this.handleChangeModel);
      this.unsub.push(this.model.subscribe(this.handleUpdateView));
   }
   
   private subOnCustomEvents(options: ViewOptions) {
      if (typeof (options.onValueChanged) === 'function') {
       this.view?.$view.on('valueChanged', options.onValueChanged);
      }
   }

   destroy(): void {
      this.view?.$view.removeClass().parent().html('');
      this.unsub.forEach(o => o.unsubscribe());
      this.view?.$view.off('valueChanged');
   }

   getModel(): Model {
      return this.model;
   }

   handleChangeModel = (option: 'defaultValue' | 'interval__a' | 'interval__b',
      value: string): void => {
      this.model.updateData(option, value, 'view');
   }
   handleUpdateView = (data: ViewOptions, oldData: ViewOptions): void => {
      this.view?.updateView(data, oldData);
   }

   handleChangeModelFromSettings = (event: Event): void => {
      if (event.target) {
         const target = event.target as HTMLInputElement | HTMLSelectElement;
         let option: keyof ViewOptions | 'interval__a' | 'interval__b' | undefined;
         let value: string | boolean | Mode | Orientation | undefined;
         switch (target.className) {
            case 'step':
               option = 'step';
               value = target.value;
               break;
            case 'mode__single':
            case 'mode__multiple':
               option = 'mode';
               value = target.value;
               break;
            case 'view__gorizontal':
            case 'view__vertical':
               option = 'orientation';
               value = target.value;
               break;
            case 'info':
               option = 'showValue';
               if (target instanceof HTMLInputElement) {
                  value = target.checked;
               }
               break;
            case 'values':
               option = 'defaultValue';
               value = target.value;
               break;
            case 'interval__a':
               option = 'interval__a';
               value = target.value;
               break;
            case 'interval__b':
               option = 'interval__b';
               value = target.value;
               break;
            case 'maximum':
               option = 'maximumValue';
               value = target.value;
               break;
            case 'minimum':
               option = 'minimumValue';
               value = target.value;
               break;
         }
         this.model.updateData(option, value, 'settings'); //option: keyof ViewOptions, value: string | boolean | Mode | Orientation
      }
   }
   handleUpdateSettingsView = (data: ViewOptions, prevData: ViewOptions): void => {
      if (this.settings)
         this.settings.updateSettingsView(data, prevData);

      if (!data.showSettings) {
         this.settings = undefined;
         this.unsub.pop()?.unsubscribe();
      }
   }  
}

export { Presentor };