function getCompute(arr) {
    if (arr.length === 0) {
        return arr;
    }
    const firstItem = arr[0];
    arr.shift(); // 1 chi  qiymatni uchirmoqda.
    arr.push(firstItem); // (0) chi index qiymatni oxiridan qushsin.
    return arr;
}
const inputArray = ['h','e','l','l','o'];
let result = getCompute(inputArray);
console.log(result);