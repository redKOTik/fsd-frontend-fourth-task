<div align="center"> 
  
  <h1>FSD Custom Slider</h1>
   
  <strong>Настраиваемый плагин для jQuery, который реализует функционал слайдера.</strong>
</div>

Добро пожаловать! Это руководство может Вам ознакомиться с проектом, а также разобраться с запуском и правильным использованием плагина.

## Что из себя представляет данный плагин?

<strong>FSD Custom Slider</strong> - плагин, написанный на [TypeScript](https://www.typescriptlang.org), с использованием сборщика проектов [webpack](https://webpack.js.org). <br/> В качестве архитектуры выбран MVP-подход, c разделением приложения на слои. <br/>
Плагин работает совместно с библиотекой [jQuery](https://jquery.com), расширяя возможности ее использования.

## Оглавление

- [Что из себя представляет данный плагин?](#что-из-себя-представляет-данный-плагин)
- [Оглавление](#оглавление)
- [Демо](#демо)
- [Приступая к работе](#приступая-к-работе)
  - [Требуемые зависимости](#требуемые-зависимости)
  - [Установка](#установка)
  - [Использование](#использование)
  - [Конфигурация](#конфигурация)
  - [Методы](#методы)
    - [Список методов](#список-методов)
  - [События](#события)
    - [Список событий](#список-событий)
- [Архитектура плагина](#архитектура-плагина)
- [UML диаграмма](#uml-диаграмма)    
- [Тесты](#тесты)
- [Автор](#автор)
- [Лицензия](#лицензия)

## Демо
См. [Демонстрацию](https://redkotik.gitlab.io/js-plugin-with-webpack/) на странице проекта.
## Приступая к работе

  ### Требуемые зависимости
  Перед использованием плагина, необходимо включить jQuery в исполняемом файле вашего проекта.
  
  ` import $ from 'jquery' `
  ### Установка
  Для установки зависимостей вам потребуется: <br/>
  - Установить [NodeJS](https://nodejs.org/en/)
  - Используя [NPM](https://www.npmjs.com/) выполнить `npm install jquery`
  - Затем выполнить установку самого плагина `npm install fsd-custom-slider`
  ### Использование
  - Импортируйте плагин `import 'fsd-custom-slider/dist/app.js'`.
  - Импортируйте стили `import 'fsd-custom-slider/dist/app.css'`.
  - Создайте div элемент на странице, который будет использован плагином для мутации.
  - Примените плагин jQuery **fsd-custom-slider** с конфигурацией следующим образом: 

  ```javascript
  $('#slider').sliderPlugin({
    step: '500',
    mode: 'Multiple',
    orientation: 'Horizontal',
    defaultInterval: ['5000', '10000'],
    maximumValue: '15000',
    showSettings: false,
    showValue: false
  });
  
  ```
  ### Конфигурация
  Объект конфигурации может содержать следующие параметры (значения по умолчанию указаны ниже):
  ```javascript
  {
    showSettings: boolean,  
    showValue: boolean,
    defaultValue: string,
    defaultInterval: [string, string],
    minimumValue: string,
    maximumValue: string,
    step: string,
    orientation: 'Vertical' | 'Horizontal',
    mode: 'Single' | 'Multiple',
    onValueChanged: Function | undefined;
    measurement: string
  } 

  ```
  - *showSettings* - это логическое свойство, определяющее, отображать или скрывать панель конфигурации слайдера.
  - *showValue* - это логическое свойство, определяющее, отображать или скрывать значение над ползунком слайдера.
  - *defaultValue* - это строка, которая задает значение слайдера по-умолчанию.
  - *defaultInterval* - это кортеж, содержащий строки, значение которых определяет установленные показатели слайдера в множественном режиме  по-умолчанию.
  - *minimumValue* - это строка, которая определяет минимально возможное значение слайдера.
  - *maximumValue* - это строка, которая определяет максимально возможное значение слайдера.
  - *step* - это строка, которая определяет значение шага (минимального изменения) слайдера в большую или меньшую сторону.
  - *orientation* - это строковый ключ, который задает ориентированность слайдера (вертикально или горизонтально).
  - *mode* - это строковый ключ, который задает режим работы слайдера (с одним или несколькими значениями).
  - *measurement* - это строка, которая будет отображаться как единица измерения значения слайдера.
  - *onValueChanged* - это функция, которая является обработчиком события, на изменение значения слайдера.

  Все параметры не являются обязательными.
  ### Методы
  Методы обеспечивают способ программного взаимодействия с плагином.
  Методы плагина можно вызвать следующим образом: 
  ```javascript 
  $('#slider').sliderPlugin('init', { mode: 'Multiple' });  
  ```
  Плагин работает как прокси для доступа к методам.
  #### Список методов
  Ниже приводится список всех доступных методов.

  **init(options)**

  Инициализирует плагин с параметрами в качестве объекта конфигурации. <br/> Не отличается от обычного использования плагина.

  **destroy()**

  Удаляет компонент представления плагина. Удаление событий, внутренних объектов и добавленных HTML-элементов.
  ```javascript 
  $('#slider').sliderPlugin('destroy');  
  ```

  **update(options)**

  Метод обновления модели плагина, c последующим изменением вида плагина.

  ```javascript 
  $('#slider').sliderPlugin('update', { defaultValue: '20' });  
  ``` 

  **value()**

  Геттер на получение текущего значения плагина.

  ```javascript 
  $('#slider').sliderPlugin('value')  
  ``` 

  ### События
  В реализации плагина предусмотрено событие, чтобы иметь возможность реагировать на изменение состояния слайдера.

  #### Список событий
  `value-change (event, value)` - изменено состояние слайдера.

  ```javascript 
  $('#slider').sliderPlugin({
    onValueChanged: function (_, change) {
      // Здесь ваша логика
    }
  });  

  ``` 
## Архитектура плагина
Как уже было указано ранее, плагин реализует Model-View-Presenter паттерн проектирования.<br/>
Приложение разделено на 3 независимых слоя. 
- **Модель** - содержит данные слайдера. Имеет сеттер на изменение данных из вне.
- **Представление** - это слой, который отвечает за визуальное отображение данных. Данный паттерн не предусматривает знание представления о модели.
- **Презентер** - организует взаимодействие между представлением и моделью.

В случае разработанного плагина, реализован MVP с двумя представлениями, презентером и моделью. 
Презентер содержит объект модели и ссылки на интерфейсы представлений, подписывается на обновление модели, а также на события изменения представлений. Представления инициализируются данными модели.

Когда пользователь инициирует событие представления, оно сообщает о нём презентеру, тот в свою очередь передает информацию модели, которая по типу события изменяет данные и вовращает их презентеру, который передает их представлению, после чего оно перерисовывается для пользователя.

Таким же образом, если программно изменить данные модели, презентер узнает об этом и получит данные, которые передаст в представление для изменения отображения.

Ниже расмотрим более детально, как происходят взаимодействия.

При инициализации в конструкторе презентера инициализируется представление `view = new View(object, this.model.getDataModel().options)`, в качестве аргументов переданы объект, где будет размещено отображение, а вторым данные модели. К созданному объекту вида, устанавливаем обработчик изменения модели `view.initHandleChangeModel(this.handleChangeModel)`. Также подписываемся на изменение модели `unsub.push(this.model.subscribe(this.handleUpdateView))`. Метод `subscribe()` возвращает объект, внутри которого есть функция для отписки от наблюдения за моделью. Объект сохраняется в свойстве класса в массиве. По действию пользователя вызывается обработчик изменения модели `changeModalHandler(option, value)` с нужным типом. Презентер обращается в модель для обновления `this.model.updateData(option, value, 'view')`. Презентер подписан на обновление модели, cрабатывает обработчик обновления вида `observer(this.options, prevOptions)` - что соответствует вызову `handleUpdateView()` в презентере. Тем самым перерисовывая представление `view.updateView(data, oldData)`.



## UML диаграмма
![UML](./Diagram.svg)

## Тесты
После клонирования репозитория, необходимо установить все зависимости из *package.json*, выполнив команду `npm install`.<br/>
После чего выполнить команду для запуска тестов `npm run test`.

Для запуска e2e тестов необходимо запустить проект `npm run start`.
После чего в отдельном терминале выполнить команду `npm test -- e2e.spec.ts`.


## Автор

- [Victor Kiselev](https://gitlab.com/redkotik)

## Лицензия

Этот проект лицензируется в соответствии с лицензией MIT — подробности см. в файле [LICENSE](./LICENSE)

