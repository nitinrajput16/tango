const canvas = document.getElementById("canvas");

var r = canvas.getBoundingClientRect();
canvas.width = r.width
canvas.height = r.height
const ctx = canvas.getContext("2d");

class face {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    show() {
        ctx.beginPath();
        ctx.fillStyle = "yellow";
        ctx.arc(this.x, this.y, 20, 0, Math.PI * 2, true);
        ctx.moveTo(this.x + 10, this.y);
        ctx.arc(this.x, this.y, 12, 0, Math.PI, false);
        ctx.moveTo(this.x - 10, this.y - 10);
        ctx.arc(this.x - 8, this.y - 10, 2, 0, Math.PI * 2, true);
        ctx.moveTo(this.x + 7, this.y - 10);
        ctx.arc(this.x + 5, this.y - 10, 2, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();
    }
    locate() {
        return { x: this.x, y: this.y };
    }
    destroy() {
        ctx.clearRect(this.x - 21, this.y - 21, 42, 42);
        this.x = null;
        this.y = null;
    }
}
class star{
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    show() {
        ctx.beginPath();
        ctx.fillStyle = "blue";
        ctx.moveTo(this.x, this.y - 20);
        ctx.lineTo(this.x + 20, this.y + 20);
        ctx.lineTo(this.x - 20, this.y);
        ctx.lineTo(this.x + 20, this.y);
        ctx.lineTo(this.x - 20, this.y + 20);
        ctx.lineTo(this.x, this.y - 20);
        ctx.fill();
        ctx.stroke();
    }
    locate() {
        return { x: this.x, y: this.y };
    }
    destroy() {
        ctx.clearRect(this.x - 21, this.y - 21, 42, 42);
        this.x = null;
        this.y = null;
    }
}
let rows, cols;
var faces = [];
var stars = [];
rows =document.getElementById("rows");

cols =document.getElementById("rows");
document.getElementById("create").addEventListener("click", function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rows = parseInt(rows.value);
    cols = parseInt(cols.value);
    faces = Array.from({ length: rows }, () => new Array(cols).fill(null));
    stars = Array.from({ length: rows }, () => new Array(cols).fill(null));
    draw();
});

document.getElementById("reset").addEventListener("click", function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rows =document.getElementById("rows");
    cols =document.getElementById("rows");
    faces = Array.from({ length: rows }, () => new Array(cols).fill(null));
    stars = Array.from({ length: rows }, () => new Array(cols).fill(null));
    draw();
});













// var levels = [];
// var lockedGrid = [];

// function createlevel() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     canvas.addEventListener("click", function (e) {
//         var x = e.clientX - r.left;
//         var y = e.clientY - r.top;
        
//         for (let i = 0; i < rows; i++) {
//             for (let j = 0; j < cols; j++) {
//                 let cellX = startX + i * gridSize;
//                 let cellY = startY + j * gridSize;

//                 if (x > cellX && x < cellX + gridSize && y > cellY && y < cellY + gridSize) {
//                     if (!faces[i][j] && !stars[i][j]) {
//                         faces[i][j] = new face(cellX + gridSize / 2, cellY + gridSize / 2);
//                         faces[i][j].show();
//                         lockedGrid.push({ i, j, type: "face" });
//                     } else if (faces[i][j]) {
//                         faces[i][j].destroy();
//                         faces[i][j] = null;
//                         stars[i][j] = new star(cellX + gridSize / 2, cellY + gridSize / 2);
//                         stars[i][j].show();
//                         lockedGrid.push({ i, j, type: "star" });
//                     } else if (stars[i][j]) {
//                         stars[i][j].destroy();
//                         stars[i][j] = null;
//                         lockedGrid = lockedGrid.filter(item => item.i !== i || item.j !== j);
//                     }
//                 }
//             }
//         }
//     });
// }

// document.getElementById("fixed").addEventListener("click", function() {
//     lockedGrid = [];
//     createlevel();
// });

// document.getElementById("save").addEventListener("click", function() {
//     if (lockedGrid.length === 0) {
//         alert("No locked elements to save.");
//         return;
//     }

//     let newLevel = {
//         rows: rows,
//         cols: cols,
//         lockedGrid: [...lockedGrid]
//     };

//     levels.push(newLevel);
//     console.log("Level saved:", newLevel);
// });

// document.getElementById("loadLevel").addEventListener("click", function() {
//     if (levels.length === 0) {
//         alert("No levels saved.");
//         return;
//     }

//     let levelIndex = prompt("Enter level number (0 to " + (levels.length - 1) + "):");
//     levelIndex = parseInt(levelIndex);

//     if (levelIndex < 0 || levelIndex >= levels.length || isNaN(levelIndex)) {
//         alert("Invalid level number.");
//         return;
//     }

//     let selectedLevel = levels[levelIndex];
//     rows = selectedLevel.rows;
//     cols = selectedLevel.cols;
//     lockedGrid = [...selectedLevel.lockedGrid];

//     faces = Array.from({ length: rows }, () => new Array(cols).fill(null));
//     stars = Array.from({ length: rows }, () => new Array(cols).fill(null));

//     lockedGrid.forEach(({ i, j, type }) => {
//         let cellX = startX + i * gridSize;
//         let cellY = startY + j * gridSize;

//         if (type === "face") {
//             faces[i][j] = new face(cellX + 25, cellY + 25);
//             faces[i][j].show();
//         } else if (type === "star") {
//             stars[i][j] = new star(cellX + 25, cellY + 25);
//             stars[i][j].show();
//         }
//     });

//     console.log("Level loaded:", selectedLevel);
// });

// canvas.addEventListener("click", function (e) {
//     var x = e.clientX - r.left;
//     var y = e.clientY - r.top;

//     for (let i = 0; i < rows; i++) {
//         for (let j = 0; j < cols; j++) {
//             let cellX = startX + i * gridSize;
//             let cellY = startY + j * gridSize;

//             if (lockedGrid.some(item => item.i === i && item.j === j)) {
//                 console.log("This cell is locked by the admin.");
//                 return;
//             }

//             if (!faces[i][j] && !stars[i][j]) {
//                 faces[i][j] = new face(cellX + gridSize / 2, cellY + gridSize / 2);
//                 faces[i][j].show();
//             } else if (faces[i][j]) {
//                 faces[i][j].destroy();
//                 faces[i][j] = null;
//                 stars[i][j] = new star(cellX + gridSize / 2, cellY + gridSize / 2);
//                 stars[i][j].show();
//             } else if (stars[i][j]) {
//                 stars[i][j].destroy();
//                 stars[i][j] = null;
//             }
//         }
//     }
// });
















function makeGrid() {
    var grid = [];
    for (let i = 0; i < rows; i++) {
        {
            grid[i] = [];
            for (let j = 0; j < cols; j++) {
                grid[i][j] = { x: 200 + i * 50, 
                    y: 200 + j * 50, 
                    occ: { have: faces[i][j]!==null?true:stars[i][j]!==null, shape: faces[i][j]!==null?faces[i][j]:stars[i][j] } 
                };
                ctx.strokeRect(grid[i][j].x, grid[i][j].y, 50, 50);
            }
        }
    }
    if(checkvalid()){
        ctx.font = "20px Arial";
        ctx.fillStyle = "red";
        ctx.fillText("Invalid", 100, 100);
    }
    if(victory()){
        ctx.font = "20px Arial";
        ctx.fillStyle = "green";
        ctx.fillText("Victory", 100, 100);
    }
}
function drawFaces(){
    
    makeGrid();
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if(faces[i][j])faces[i][j].show();
        }
    }
}
function drawStars(){
    
    makeGrid();
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if(stars[i][j])stars[i][j].show();
        }
    }
}
function shape(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawFaces();
    drawStars();
}

canvas.addEventListener('click', function (e) {
    var x = e.clientX - r.left;
    var y = e.clientY - r.top;
    const gridSize = 50;
    const gridlength = rows;
    const startX = 200;
    const startY = 200;
    // console.log(faces,stars);
    for (let i = 0; i < gridlength; i++) {
        for (let j = 0; j < gridlength; j++) {
            let cellX = startX + i * gridSize;
            let cellY = startY + j * gridSize;
            if (lockedGrid.some(item => item.i === i && item.j === j)) {
                console.log("This cell is locked by the admin.");
                return;
            }
            if (x > cellX && x < cellX + gridSize && y > cellY && y < cellY + gridSize) {
                if (!faces[i][j] && !stars[i][j]) {
                    faces[i][j] = new face(cellX + gridSize / 2, cellY + gridSize / 2);
                    faces[i][j].show();
                }
                else if(faces[i][j] && !stars[i][j]){
                    faces[i][j].destroy();
                    faces[i][j] = null;
                    stars[i][j] = new star(cellX + gridSize / 2, cellY + gridSize / 2);
                    stars[i][j].show();
                }
                else if(stars[i][j]){
                    stars[i][j].destroy();
                    stars[i][j] = null;
                }
            }
            shape();
        }
    }
});
function exceed(){
    let cnts=0,cntf=0;
    for (let i = 0; i < rows; i++) {
        cntf=0;
        cnts=0;
        for (let j = 0; j < cols; j++) {
            if(faces[i][j]!==null)cntf++;
            if(stars[i][j]!==null)cnts++;
            if(cntf>rows/2||cnts>cols/2){
                return true;
            }
        }
    }
    for(let j=0;j<cols;j++){
        cntf=0;
        cnts=0;
        for(let i=0;i<rows;i++){
            if(faces[i][j]!==null)cntf++;
            if(stars[i][j]!==null)cnts++;
            if(cntf>rows/2||cnts>cols/2){
                return true;
            }
        }
    }
    return false;
}
function victory(){
    let cnts=0;
    for(let i=0;i<rows;i++){
        for(let j=0;j<cols;j++){
            if(faces[i][j]!==null || stars[i][j]!=null)cnts++;
        }
    }
    if(cnts==rows*cols){
        return true;
    }


    return false;
}

function checkvalid() {
    for (let i = 0; i < rows; i++) {
        let cntr = 0, scntr = 0;
        for (let j = 0; j < cols-1; j++) {
            if (faces[i][j] !== null && faces[i][j + 1] !== null) {
                cntr++;
                if (cntr == Math.floor((rows-1)/2)) return true;
            } else {
                cntr = 0;
            }
            
            if (stars[i][j] !== null && stars[i][j + 1] !== null) {
                scntr++;
                if (scntr == Math.floor((rows-1)/2)) return true;
            } else {
                scntr = 0;
            }
        }
    }

    for (let j = 0; j < cols; j++) {
        let cntc = 0, scntc = 0;
        for (let i = 0; i < rows-1; i++) {
            if (faces[i][j] !== null && faces[i + 1][j] !== null) {
                cntc++;
                if (cntc == Math.floor((cols-1)/2)) return true;
            } else {
                cntc = 0;
            }

            if (stars[i][j] !== null && stars[i + 1][j] !== null) {
                scntc++;
                if (scntc == Math.floor((cols-1)/2)) return true;
            } else {
                scntc = 0;
            }
        }
    }
    return exceed();
}


function draw() {
    shape();
}
draw();