const express=require("express")
const app=express()
const PORT=3000

app.use(express.static("public"))

app.get("/",(req,res)=>{

})


app.listen(PORT,()=>{
    console.log("port is : ",PORT)
})