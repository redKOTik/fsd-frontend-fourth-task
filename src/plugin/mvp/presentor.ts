import EventEmmiter from '../utils/emmiter';
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

  emmiter: EventEmmiter;
  viewUnsubscribers: Unsubables[] = [];
  settingsUnsubscribers: Unsubables[] = [];

  constructor(public $object: JQuery, public options: ViewOptions) {
    this.emmiter = new EventEmmiter();    
    this.model = new Model(this.options, this.emmiter);

    this.initSettings();
    this.initView();

    this.subscribeOnSettingsEvents();
    this.subscribeOnViewEvents();
    this.subscribeOnModalEvents();    
    this.subscribeOnCustomEvents();
  }

  private initSettings() {
    if (this.options.showSettings)
      this.settings = new SettingsView(this.$object, this.model.getDefaultValues(), this.emmiter);    
  }

  private initView() {
    this.view = new View(this.$object, this.model.getModelData().options, this.emmiter);
  }

  private subscribeOnViewEvents() {
    this.viewUnsubscribers.push(this.emmiter.subscribe('view:thumb-moved', this.model.handleThumbMoved));
    this.viewUnsubscribers.push(this.emmiter.subscribe('view:scale-clicked', this.model.handleScaleClicked));
  }

  private subscribeOnModalEvents() {
    if (this.view) {
      this.viewUnsubscribers.push(this.emmiter.subscribe('modal:value-changed', this.view.handleValueChanged));
      this.viewUnsubscribers.push(this.emmiter.subscribe('modal:setting-updated', this.view.handleViewChanged));    
    }     
  }  
  
  private subscribeOnSettingsEvents() {
    if (this.options.showSettings && this.settings)
      this.settingsUnsubscribers.push(this.emmiter.subscribe('setting:info-changed', this.model.handleInfoChanged));
      this.settingsUnsubscribers.push(this.emmiter.subscribe('setting:scale-changed', this.model.handleScaleChanged));
  }

  private subscribeOnCustomEvents() {
    if (typeof (this.options.onValueChanged) === 'function' && this.view)
      this.view.$view.on('valueChanged', this.options.onValueChanged);
  }  

  getModel(): Model {
    return this.model;
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
        case 'view__horizontal':
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
        case 'scale-input':
          option = 'showScale';
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

  destroy(): void {
    this.view?.$view.removeClass().parent().html('');
    this.viewUnsubscribers.forEach(unsubscriber => unsubscriber.unsubscribe());
    this.view?.$view.off('valueChanged');
  }
}

export default Presentor;