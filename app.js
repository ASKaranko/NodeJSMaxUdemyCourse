"use strict";
const num1 = document.getElementById('num1');
const num2 = document.getElementById('num2');
const button = document.querySelector('button');
function add(num1, num2) {
    if (typeof num1 === 'number' && typeof num2 === 'number') {
        return num1 + num2;
    }
    else if (typeof num1 === 'string' && typeof num2 === 'string') {
        return num1 + ' ' + num2;
    }
    return +num1 + +num2;
}
button === null || button === void 0 ? void 0 : button.addEventListener('click', () => {
    const num1Value = num1 === null || num1 === void 0 ? void 0 : num1.value;
    const num2Value = num2 === null || num2 === void 0 ? void 0 : num2.value;
    const result = add(num1Value, num2Value);
    console.log(result);
});
