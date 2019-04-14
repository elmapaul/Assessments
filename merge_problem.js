var fs = require('fs')
var data;   // data from file stream
let intervalPairsResult = [];
let intervalValues = [];   // interval values as integers. The idea is to store an integer > 0
let tempObject = {};  // for storing temporary interval <start>+"-"+<end> as KEY : line read is VALUE
var inputStreamArr = [];
const MERGE_DISTANCE = process.argv[3];   // merge distance console argument
const FILENAME = process.argv[2];   // file argument

if (!MERGE_DISTANCE){
    console.log('No merge distance!');
    return;
} 

fs.readFile(FILENAME, 'utf8', function(err, data)
{
    if (err) {
        console.log('Catched Error...Perhaps there is a problem with file!');
        return -1;
    }  
    
    // Build an array identical to read lines from file
    var lineFromFile = data.split('\r\n').slice(0);
    
    lineFromFile.map(el => {
        let intervaData = el.split(/\s+/)
        let idLine = parseInt(intervaData[0]);
        let startIndex = parseInt(intervaData[1]);
        let endIndex = parseInt(intervaData[2]);
        inputStreamArr.push([idLine, startIndex, endIndex])
    })

    for (let i = 0, length = inputStreamArr.length; i < length; i++){
        // interval string name for saveing as property in object
        let formattedInterval = `${inputStreamArr[i][1]}-${inputStreamArr[i][2]}`; 

        // Remove if interval exists
        if (tempObject[formattedInterval] >=0 ){        
            // "delete" range 0f interval start -> interval end
            for (let x = inputStreamArr[i][1];  x < inputStreamArr[i][2]; x++){
                intervalValues[x]--;
            } 
            
            // Get index line of interval
            let indexLine = tempObject[formattedInterval];

            // Remove interval duplicated lines from input stream
            inputStreamArr.splice(indexLine, 1);
            inputStreamArr.splice(i-1, 1);
            // Remove from temp object
            delete tempObject[formattedInterval];
            
            // Write modified output in file
            fs.writeFile('./output.txt', inputStreamArr.join('\n'), function(){
                // console.log('REMOVED FROM FILE...')
            });

            console.log(intervalPairsResult);
        } else {
            // Save interval block in "memory" in order to not re-read from start the file and access easily through key:value
            tempObject[formattedInterval] = i;

            // add range interval start -> interval end
            for (let x = inputStreamArr[i][1];  x < inputStreamArr[i][2]; x++){
                // if (intervalValues[x]>-1) {
                if (Number.isInteger(intervalValues[x])) {
                    intervalValues[x]++;
                } else {
                    intervalValues[x] = 1;
                }
            } 

            // CHECK LEFT SIDE COLLISION
            if (!intervalValues[inputStreamArr[i][1]-1] || (intervalValues[inputStreamArr[i][1]-1] < -1)){
                for (let l = inputStreamArr[i][1]-1; l >= inputStreamArr[i][1]-1-MERGE_DISTANCE; l--){
                    if (intervalValues[l] > -1){
                        // Merge from left and break
                        let stopIndex = l;
                        for (let left_fill = inputStreamArr[i][1]-1; left_fill > stopIndex; left_fill--){
                            intervalValues[left_fill] = 1;
                        }
                        break;
                    }
                }
            }

            // CHECK RIGHT SIDE COLLISION
            if (!intervalValues[inputStreamArr[i][1]+1] || intervalValues[inputStreamArr[i][1]+1] < -1 ){
                for (let r = inputStreamArr[i][1]+1; r <= inputStreamArr[i][1]+1+MERGE_DISTANCE; r++){
                    if (intervalValues[r] > 0){
                        // Merged from right and break
                        let stopIndex = r;
                        for (let right_fill = inputStreamArr[i][1]+1; right_fill <= stopIndex; right_fill++){
                            intervalValues[right_fill]++;
                        }
                        break;
                    }
                }
            }
            
            console.log(intervalPairsResult);
        }

        let intervalDef = 0;   //  intervalDef if even is start interval,odd is end interval
        let startValue = intervalValues[0];
        intervalPairsResult = [];

        // [Start, end points] are storing in array
        for (let z = 0, intervalValuesLength = intervalValues.length; z < intervalValuesLength; z++) {
            if ((intervalValues[z] !== intervalValues[z+1]) && 
                ((intervalValues[z] > 0) || (intervalValues[z+1] > 0)) &&
                ((!intervalValues[z]) || (!intervalValues[z+1]))) {
                intervalDef++;

                if (intervalDef % 2 !== 0) {
                    intervalPairsResult.push([z+1]);
                } else {
                    if (intervalPairsResult[intervalPairsResult.length-1]){
                        intervalPairsResult[intervalPairsResult.length-1].push(z+1);
                    }
                }
            }
        }
    }

    // Expected result from example -> [10,31], [55,89]
    console.log(intervalPairsResult)    // final merge results
});


