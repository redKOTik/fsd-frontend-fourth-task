type Orientation = 'Vertical' | 'Horizontal';
type Mode = 'Single' | 'Multiple';

type ValueChanged = (event: CustomEvent, value: string) => void;

type Options = {
  readonly showSettings?: boolean,
  showValue?: boolean,
  showScale?: boolean,
  defaultValue?: string,
  defaultInterval?: [string, string],
  minimumValue?: string,
  maximumValue?: string,
  step?: string,
  orientation?: Orientation,
  mode?: Mode,
  onValueChanged?: ValueChanged | undefined;
  measurement?: string
}

type ViewOptions = {
  showSettings: boolean,
  showValue: boolean,
  showScale: boolean,
  defaultValue: string,
  defaultInterval: [string, string],
  minimumValue: string,
  maximumValue: string,
  step: string,
  orientation: Orientation,
  mode: Mode,
  onValueChanged: ValueChanged | undefined;
  measurement: string
}

interface Methods {
  init(object: JQuery, options: ViewOptions): void;
  update(object: JQuery, content: Options): void;
  destroy(object: JQuery): void;
  value(object: JQuery): string;
}

interface PluginFunction {
  (options?: keyof Methods | Options | boolean | string, newOptions?: Options): JQuery | string;
}

interface JQuery {
  sliderPlugin: PluginFunction;
}