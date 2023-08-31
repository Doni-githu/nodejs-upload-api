export default function(){
    const numbers = `${Math.random() * 100000}`
    if(numbers[0] === '0'){
        return parseInt(numbers) * 10
    }
    return parseInt(numbers)
}
