import '@styles/app';
import './plugin/slider';

const $slider = $('#slider');
const $slider3 = $('#slider3');

$slider.sliderPlugin({
  step: '50',
  mode: 'Multiple',
  orientation: 'Vertical',
  defaultValue: '550',
  defaultInterval: ['150', '250'],
  minimumValue: '100',
  maximumValue: '300',
  showSettings: true,
  showValue: true,
  onValueChanged: function (_, change) {
    console.log(change);
  }
});

// console.log($slider.sliderPlugin('value'));

// $('#slider2').sliderPlugin({
//   step: '5',
//   mode: 'Single',
//   orientation: 'Horizontal',
//   defaultValue: '50',
//   onValueChanged: function (_, change) {
//     console.log(change);
//   }
// });

$slider3.sliderPlugin({
  minimumValue: '40',
  maximumValue: '60',
  step: '5',
  mode: 'Single',
  orientation: 'Horizontal',
  defaultValue: '50',
  showScale: true,
  onValueChanged: function (_, change) {
    console.log(change);
  }
});

// setTimeout(() => {
//     $('#slider').sliderPlugin('update', {
//         defaultValue: '40',
//         mode: 'Single'
//     });
// }, 5000);

// setTimeout(() => {
//     $('#slider').sliderPlugin('destroy');
// }, 9000);

// setTimeout(() => {
//   $slider.sliderPlugin('update', { showScale: true, showValue: true, defaultInterval: ['150', '250'] });
// }, 10000);

// setTimeout(() => {
//     $('#slider2').sliderPlugin('update', {
//         defaultValue: '100',
//         maximumValue: '150',
//         step: '10',
//         orientation: 'Vertical'
//     });
// }, 13000);

// setTimeout(() => {
//     $('#slider2').sliderPlugin('update', { showSettings: false });
// }, 10000);