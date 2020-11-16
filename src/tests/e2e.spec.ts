// const timeout = process.env.SLOWMO ? 30000 : 10000;
const puppeteer = require('puppeteer');

const app = 'http://localhost:8081/';
let browser: any;
let page: any;

beforeAll(async () => {
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

test('тестирование функции calcSpace', async () => {
    const view = await page.$('#slider2');
    const viewOffset = await page.$eval('#slider2', (node: any) => { return node['offsetWidth']});
    const thumbOffset = await view.$eval('.thumb', (node: any) => { return node['offsetWidth']});   

    //функция calcSpace должна возвращать количество пикселей пространства для перемещения ползунка
    expect(+viewOffset - +thumbOffset - 2).toBe(222);
});

test('тестирование события (mousemove, mouseup) перемещения ползунка', async () => {
    const example = await page.$('#slider .thumb__a');
    const bounding_box = await example.boundingBox();

    await page.mouse.move(bounding_box.x + bounding_box.width / 2, bounding_box.y + bounding_box.height / 2);
    await page.mouse.down();
    await page.mouse.move(465, 0);
    await page.mouse.up();

    const left = await page.$eval('#slider .thumb__a', (node: any) => { return node['style'].left});

    expect(left).toEqual('0px');
});