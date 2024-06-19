"use strict";
const num1 = document.getElementById('num1');
const num2 = document.getElementById('num2');
const button = document.querySelector('button');
const numResults = [];
const textResults = [];
function add(num1, num2) {
    if (typeof num1 === 'number' && typeof num2 === 'number') {
        return num1 + num2;
    }
    else if (typeof num1 === 'string' && typeof num2 === 'string') {
        return num1 + ' ' + num2;
    }
    return +num1 + +num2;
}
function printResult(resultObj) {
    console.log(resultObj.val);
}
button === null || button === void 0 ? void 0 : button.addEventListener('click', () => {
    const num1Value = num1 === null || num1 === void 0 ? void 0 : num1.value;
    const num2Value = num2 === null || num2 === void 0 ? void 0 : num2.value;
    const numResult = add(+num1Value, +num2Value);
    numResults.push(numResult);
    const stringResult = add(num1Value, num2Value);
    textResults.push(stringResult);
    printResult({ val: numResult, timestamp: new Date() });
    console.log(numResults, textResults);
});
const myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('It worked!');
    }, 1000);
});
myPromise.then((result) => {
    console.log(result.split('w'));
});
