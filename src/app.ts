import '@styles/app';
import './plugin/slider';

const $slider = $('#slider');

$slider.sliderPlugin({
  step: '500',
  mode: 'Multiple',
  orientation: 'Horizontal',
  defaultInterval: ['5000', '10000'],
  maximumValue: '15000',
  showSettings: true,
  showValue: false,
  onValueChanged: function (_, change) {
    console.log(change);
  }
});

console.log($slider.sliderPlugin('value'));

$('#slider2').sliderPlugin({
  step: '5',
  mode: 'Single',
  orientation: 'Horizontal',
  defaultValue: '50',
  onValueChanged: function (_, change) {
    console.log(change);
  }
});

$('#slider3').sliderPlugin({
  step: '5',
  mode: 'Multiple',
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
//     $('#slider2').sliderPlugin('update', { showScale: false });
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