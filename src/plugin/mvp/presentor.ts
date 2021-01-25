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
    this.subscribeOnModelEvents();    
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

  private subscribeOnModelEvents() {
    if (this.view) {
      this.viewUnsubscribers.push(this.emmiter.subscribe('model:value-changed', this.view.handleValueChanged));
      this.viewUnsubscribers.push(this.emmiter.subscribe('model:setting-updated', this.view.handleViewChanged));
      this.viewUnsubscribers.push(this.emmiter.subscribe('model:mode-updated', this.view.handleModeChanged));
      this.viewUnsubscribers.push(this.emmiter.subscribe('model:type-updated', this.view.handleTypeChanged));
      this.viewUnsubscribers.push(this.emmiter.subscribe('model:range-updated', this.view.handleRangeChanged));
      this.viewUnsubscribers.push(this.emmiter.subscribe('model:step-updated', this.view.handleStepChanged));
    } 
    
    if (this.settings) {
      this.settingsUnsubscribers.push(this.emmiter.subscribe('model:value-changed', this.settings.handleSettingsViewChanged));
      this.settingsUnsubscribers.push(this.emmiter.subscribe('model:setting-updated', this.settings.handleSettingsViewChanged));
      this.settingsUnsubscribers.push(this.emmiter.subscribe('model:mode-updated', this.settings.handleSettingsViewChanged));
      this.settingsUnsubscribers.push(this.emmiter.subscribe('model:type-updated', this.settings.handleSettingsViewChanged));
      this.settingsUnsubscribers.push(this.emmiter.subscribe('model:range-updated', this.settings.handleSettingsViewChanged));
      this.settingsUnsubscribers.push(this.emmiter.subscribe('model:step-updated', this.settings.handleSettingsViewChanged));  
    }
  }  
  
  private subscribeOnSettingsEvents() {
    if (this.options.showSettings && this.settings)
      this.settingsUnsubscribers.push(this.emmiter.subscribe('setting:info-changed', this.model.handleInfoChanged));
      this.settingsUnsubscribers.push(this.emmiter.subscribe('setting:scale-changed', this.model.handleScaleChanged));
      this.settingsUnsubscribers.push(this.emmiter.subscribe('setting:mode-changed', this.model.handleModeChanged));
      this.settingsUnsubscribers.push(this.emmiter.subscribe('setting:type-changed', this.model.handleTypeChanged));
      this.settingsUnsubscribers.push(this.emmiter.subscribe('setting:range-changed', this.model.handleRangeChanged));
      this.settingsUnsubscribers.push(this.emmiter.subscribe('setting:step-changed', this.model.handleStepChanged));
      this.settingsUnsubscribers.push(this.emmiter.subscribe('setting:value-changed', this.model.handleThumbMoved));
  }

  private subscribeOnCustomEvents() {
    if (typeof (this.options.onValueChanged) === 'function' && this.view)
      this.view.$view.on('value-change', this.options.onValueChanged);
  }  

  getModel(): Model {
    return this.model;
  }

  destroy(): void {
    this.view?.$view.removeClass().parent().html('');
    this.viewUnsubscribers.forEach(unsubscriber => unsubscriber.unsubscribe());
    this.settingsUnsubscribers.forEach(unsubscriber => unsubscriber.unsubscribe());
    this.view?.$view.off('value-change');
  }
}

export default Presentor;