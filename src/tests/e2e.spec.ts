// const timeout = process.env.SLOWMO ? 30000 : 10000;
const puppeteer = require('puppeteer');

const app = 'http://localhost:8081/';
let browser: any;
let page: any;

beforeAll(async () => {
    jest.setTimeout(30000);
    browser = await puppeteer.launch({
        headless: false,
        slowMo: 100,
        args: [`--window-size=${1280},${1000}`]
    }); 
    page = await browser.newPage();
    await page.goto(app);    
});

afterAll(async () => {
    await browser.close();
});

const mousemove = async (element: any, newX: number, newY: number) => {
    
     const bounding_box = await element.boundingBox(); // начальные координаты элемента

     // перемещаем указатель мыши на середину элемента (x + width/2, y + height/2)
     await page.mouse.move(bounding_box.x + bounding_box.width / 2, bounding_box.y + bounding_box.height / 2);

     await page.mouse.down(); // захватываем элемент
     await page.mouse.move(newX, newY); // перемещаем
     await page.mouse.up(); // отпускаем элемент
}

test('тестирование функции calcSpace', async () => {
    const view = await page.$('#slider3');
    const viewOffset = await page.$eval('#slider3', (node: any) => { return node['offsetWidth']});
    const thumbOffset = await view.$eval('.thumb', (node: any) => { return node['offsetWidth']});   

    //функция calcSpace должна возвращать количество пикселей пространства для перемещения ползунка
    expect(+viewOffset - +thumbOffset - 2).toBe(224);
});

test('тестирование события (mousemove, mouseup) перемещения ползунка', async () => {
    const view = await page.$('#slider');
    const example = await view.$('.thumb:first-of-type');    

    await mousemove(example, 451, 81);

    //const left = await page.$eval(example, (node: any) => { return node['style'].left});
    expect(await example.evaluate((node: HTMLButtonElement) => node['style'].top)).toEqual('-8px');    
});

test('тестирование изменения значения настроек после перемещения ползунка, а также изменения значения над ползунком', async () => { 

    const section = await page.$('#first');
    const slider = await section.$('.slider');
    const settings = await section.$('.settings');

    const thumb = await slider.$('.thumb:first-of-type');
    const label = await slider.$('.slider-label:first-of-type');    

    await mousemove(thumb, 451, 200);

    let inputValue = await settings.$('.values[data-order="0"]');
    expect(await label.evaluate((node: HTMLLabelElement) => node['textContent'])).toEqual(await inputValue.evaluate((node: HTMLInputElement) => node['value']));

    await mousemove(thumb, 451, 81);

    inputValue = await settings.$('.values[data-order="0"]');
    expect(await label.evaluate((node: HTMLLabelElement) => node['textContent'])).toEqual(await inputValue.evaluate((node: HTMLInputElement) => node['value']));  
});

test('тестирование ограничений рабочей зоны слайдера после изменения настроек минимума, максимума', async () => {
    
    const minvalue = '-50';
    const maxvalue = '400';

    const section = await page.$('#first');
    const slider = await section.$('.slider');
    const settings = await section.$('.settings');

    const thumbFisrt = await slider.$('.thumb:first-of-type');
    const thumbSecond = await slider.$('.thumb:last-of-type');
    const labelFirst = await slider.$('.slider-label:first-of-type');    
    const labelSecond = await slider.$('.slider-label:last-of-type');

    await mousemove(thumbFisrt, 451, 200);

    let inputMin = await settings.$('.range[name="minimum"]');
    let inputMax = await settings.$('.range[name="maximum"]');

    await inputMin.evaluate((node: HTMLInputElement) => node['value'] = '');
    await inputMin.type(minvalue);

    await inputMax.evaluate((node: HTMLInputElement) => node['value'] = '');    
    await inputMax.type(maxvalue);

    await page.mouse.move(500, 500); // перемещаем
    await page.mouse.click(500, 500);

    await mousemove(thumbFisrt, 451, 81);
    await mousemove(thumbSecond, 451, 560);

    let inputValueOne = await settings.$('.values[data-order="0"]');
    let inputValueTwo = await settings.$('.values[data-order="1"]');
    
    expect(await labelFirst.evaluate((node: HTMLLabelElement) => node['textContent'])).toEqual(minvalue);
    expect(await inputValueOne.evaluate((node: HTMLInputElement) => node['value'])).toEqual(minvalue);

    expect(await labelSecond.evaluate((node: HTMLLabelElement) => node['textContent'])).toEqual(maxvalue);
    expect(await inputValueTwo.evaluate((node: HTMLInputElement) => node['value'])).toEqual(maxvalue);
});