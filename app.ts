const num1 = document.getElementById('num1') as HTMLInputElement;
const num2 = document.getElementById('num2') as HTMLInputElement;
const button = document.querySelector('button');

const numResults: Array<number> = [];
const textResults: Array<string> = [];

type NumOrString = number | string;
type Result = { val: number; timestamp: Date };

interface ResultObj {
    val: number;
    timestamp: Date;
}

function add(num1: NumOrString, num2: NumOrString) {
    if (typeof num1 === 'number' && typeof num2 === 'number') {
        return num1 + num2;
    } else if (typeof num1 === 'string' && typeof num2 === 'string') {
        return num1 + ' ' + num2;
    }
    return +num1 + +num2;
}

function printResult(resultObj: ResultObj) {
    console.log(resultObj.val);
    
}

button?.addEventListener('click', () => {
    const num1Value = num1?.value;
    const num2Value = num2?.value;
    const numResult = add(+num1Value, +num2Value);
    numResults.push(numResult as number);
    const stringResult = add(num1Value, num2Value);
    textResults.push(stringResult as string);
    printResult({ val: numResult as number, timestamp: new Date() });
    console.log(numResults, textResults);
    
});

const myPromise = new Promise<string>((resolve, reject) => {
    setTimeout(() => {
        resolve('It worked!');
    }, 1000);
});

myPromise.then((result) => {
    console.log(result.split('w'));
});
