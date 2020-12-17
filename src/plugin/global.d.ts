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
type Observer = (data: {[key: string]: any}) => void;
type Emmiter = {
  [key: string]: Observer []
}