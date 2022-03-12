// Select 10 numbers randomly
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
var selectedRow = []
var cnt = 0
while (cnt < 10) {
    tmp = getRandomInt(0, 65)
    if (selectedRow.includes(tmp)) {
        continue
    }
    selectedRow.push(tmp)
    cnt++
}


