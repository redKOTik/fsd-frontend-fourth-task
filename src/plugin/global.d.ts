type OwnSpace = {
  start: number,
  end: number
};

type HandleOptions = {
    index: 0 | 1,
    shift: number,
    ownSpace: OwnSpace
};

type HandleEvent = (options: HandleOptions, event: MouseEvent) => void;
type MouseHandler = (event: MouseEvent) => void;

type Unsubables = {
  unsubscribe: () => void 
};

type IntervalData = {
  'index': number,
  'value': string
}

type DispatchData = {
  [key: string]: string | number | Mode | Orientation | boolean | [string, string] | IntervalData;
};

type Observer = (data: DispatchData) => void;
type Emmiter = {
  [key: string]: Observer []
};

type Elements = {
  showValueInput: HTMLInputElement,
  showScaleInput: HTMLInputElement,
  orientationInputs: NodeListOf<HTMLInputElement>,
  modeInputs: NodeListOf<HTMLInputElement>,
  stepInput: HTMLInputElement,
  minInput: HTMLInputElement,
  maxInput: HTMLInputElement,
  valuesInput: HTMLInputElement[]
};

