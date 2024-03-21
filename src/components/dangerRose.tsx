import React, { Component,useRef,useEffect } from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import Canvas from "react-native-canvas";
import { color } from "../../assets/colors";



export default function DangerRose(props:{dangerScore:string,}){
    const ref = useRef(null);
    const handleCanvas = (canvas:any)=>{
        if(canvas != null){
        const windowWidth = Dimensions.get('window').width;
        canvas.width = windowWidth;
        canvas.height = windowWidth;
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = windowWidth/8;
        let db: Array<number>;
        // db=[0,9,3,5,7,9,1,1,
        //     0,1,3,5,7,9,2,2,
        //     2,1,5,2,3,4,4,6];
        let dangerScores:number[];
        if(props.dangerScore){

        dangerScores = props.dangerScore.split(',').map(Number);
        }
        else{
          dangerScores = [0,0,0,0,0,0,0,0,
                          0,0,0,0,0,0,0,0,
                          0,0,0,0,9,0,0,0];
        }
        // dummy data for testing
        // dangerScores = [0,7,5,3,1,0,1,3,
        //   0,7,5,3,1,0,1,3,
        //   0,7,5,3,1,0,1,3];
        db = dangerScores;
        let colors: Array<string>;
        colors = ["","","","","","","","",
                  "","","","","","","","",
                  "","","","","","","",""];
        for(let i = 0;i<24;i++){
          if(db[i]==0){
            colors[i] = color.ExtraLightGreen;
          }
          else if (Math.floor((db[i]-1)/2)==0){
            colors[i] = color.Green;
          }
          else if (Math.floor((db[i]-1)/2)==1){
            colors[i] = color.Yellow;
          }
          else if (Math.floor((db[i]-1)/2)==2){
            colors[i] = color.Orange;
          }
          else if (Math.floor((db[i]-1)/2)==3){
            colors[i] = color.Red;
          }
          else if (Math.floor((db[i]-1)/2)==4){
            colors[i] = color.Black;
          }
        }
        

        //inner ring of danger rose
        for(let i =0;i<8;i++){
          ctx.beginPath();
          ctx.strokeStyle = colors[i];
          ctx.arc(windowWidth/2, windowWidth/2, windowWidth/16, (2*i-5)*Math.PI/8,  (2*i-3)* Math.PI/8);
          ctx.stroke();
        }

        //middle ring of danger rose
        for(let i =0;i<8;i++){

          ctx.beginPath();
          ctx.strokeStyle = colors[i+8];
          ctx.arc(windowWidth/2, windowWidth/2, 3*windowWidth/16, (2*i-5)*Math.PI/8,  (2*i-3)* Math.PI/8);
          ctx.stroke();
        }

        //outer ring of danger rose
        for(let i =0;i<8;i++){
          ctx.beginPath();
          ctx.strokeStyle = colors[i+16];
          ctx.arc(windowWidth/2,windowWidth/2, 5*windowWidth/16, (2*i-5)*Math.PI/8,  (2*i-3)* Math.PI/8);
          ctx.stroke();
        }

        //lines for ease of viewing the sectors
        const c = windowWidth/2
        const r = 3*windowWidth/8
        ctx.lineWidth=1;
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.moveTo(c+r*Math.cos(Math.PI/8), c+r*Math.sin(Math.PI/8)); 
        ctx.lineTo(c-r*Math.cos(Math.PI/8), c-r*Math.sin(Math.PI/8));
        ctx.moveTo(c+r*Math.cos(3*Math.PI/8), c+r*Math.sin(3*Math.PI/8)); 
        ctx.lineTo(c-r*Math.cos(3*Math.PI/8), c-r*Math.sin(3*Math.PI/8));
        ctx.moveTo(c+r*Math.cos(5*Math.PI/8), c+r*Math.sin(5*Math.PI/8)); 
        ctx.lineTo(c-r*Math.cos(5*Math.PI/8), c-r*Math.sin(5*Math.PI/8));
        ctx.moveTo(c+r*Math.cos(7*Math.PI/8), c+r*Math.sin(7*Math.PI/8)); 
        ctx.lineTo(c-r*Math.cos(7*Math.PI/8), c-r*Math.sin(7*Math.PI/8));
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(windowWidth/2, windowWidth/2, 3*windowWidth/8, 0,  2*Math.PI)
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(windowWidth/2, windowWidth/2,windowWidth/4, 0,  2*Math.PI)
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(windowWidth/2, windowWidth/2, windowWidth/8, 0,  2*Math.PI)
        ctx.stroke();

        //Cardinal Direction Labels
        ctx.font = "31px serif";
        ctx.fillText("N", windowWidth/2-13, 3*windowWidth/32);
        ctx.fillText("S", windowWidth/2-13, 31*windowWidth/32);
        ctx.fillText("E", 28*windowWidth/32+4, windowWidth/2+13);
        ctx.fillText("W",1*windowWidth/32+6,windowWidth/2+13)
      }
    }

  return(
    <Canvas style ={styles.container} ref={handleCanvas} />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    elevation: 1,
    borderWidth: 0,
    width: "100%",
    height: "50%",
    alignItems: "center",
  }
});
