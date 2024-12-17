import { useEffect, useState } from 'react';
import * as _ from "lodash";

const modelProp = {
  aCoords:null, //Text
  lineCoords:null,
  angle:null,
  fontSize:null,
  fontWeight:null,
  fill:null,
  fontStyle:null,
  height:null,
  left:null,
  originX:null,
  originY:null,
  origins:null,
  value:null,
  rotatingPointOffset:null,
  text:null,
  textLines:null,
  textDecoration:null,
  top:null,
  underline:null,
  width:null,
  hasBorders:null, //Shape
  rx:null,
  ry:null,
  type:null,
  scaleX:null,
  scaleY:null,
  startPoint:null,
  stroke:null,
  strokeWidth:null,
  path:null,
  pathOffset:null,
  position:null,
  lockSkewingX:null,
  lockSkewingY:null,
};


const useEditor = (ref) => {
  const [editorInstance, setEditorInstance] = useState(null);
  const objectsArr = [];

  const sendToInstance = () => {
    let asyncAddLayout = [];

    objectsArr.forEach(async (el)=>{
      setTimeout(async () => {
        asyncAddLayout.push( await addLayer(el))
      }, 100);
    })
  }

  const addLayer = async (layer) => {
    console.log("addLayer [START]", layer.aCoords);

    let options = {
      aCoords: layer.aCoords,
      angle: layer.angle,
      fill: layer.fill,
      fontSize: layer.fontSize,
      fontWeight: layer.fontWeight,
      fontStyle: layer.fontStyle,
      textDecoration: layer.textDecoration,
      underline: layer.underline,
      height: layer.height,
      stroke: layer.stroke,
      strokeWidth: layer.strokeWidth,
      top: layer.top,
      left: layer.left,
      rotatingPointOffset: layer.rotatingPointOffset,
      rx: layer.rx,
      ry: layer.ry,
      selected: false,
      width: layer.width,
      isRegular: layer.isRegular,
      path: layer.path,
      pathOffset: layer.pathOffset,
      lineCoords: layer.lineCoords,
      originX: layer.originX,
      originY: layer.originY,
      origins: layer.origins,
      position: layer.position,
      startPoint: layer.startPoint,
      scaleX: layer.scaleX,
      scaleY: layer.scaleY,
      styles: { //Duplicate of some properties for addText()
        angle: layer.angle,
        fontSize: layer.fontSize,
        fontWeight: layer.fontWeight,
        fontStyle: layer.fontStyle,
        textDecoration: layer.textDecoration,
        underline: layer.underline,
        fill: layer.fill,
        top: layer.top,
        left: layer.left,
        originX: "left", //layer.originX, The 'left' value is reset to 'center' when there is no change, so we force it here
        originY: "top", //layer.originY, The 'top' value is reset to 'center' when there is no change, so we force it here
        aCoords: layer.aCoords,
        position: layer.aCoords.tl,
      },
    }

    //Add layer Object based on type
    switch (layer.type) {
      case "i-text":
        console.log("addLayer [TEXT]", layer.text);
        await  editorInstance.addText(layer.text, options).then(objectProps => {
          //Assign all other saved values to the newly created layer
          layer.originX= "left";
          layer.originY= "top";
          _.assign(objectProps, layer);
          console.log("addLayer [TEXT completed]", objectProps.id, objectProps);
        });
        break;

      case "circle":
      case "triangle":
      case "rect":
        console.log("addLayer [SHAPE]", layer.type);
        await editorInstance.addShape(layer.type, options).then(objectProps => {
          //Assign all other saved values to the newly created layer
          _.assign(objectProps, layer);
          console.log("addLayer [SHAPE completed]", objectProps.id, objectProps);
        });
        break;

      case "icon":
        console.log("addLayer [ICON]", layer.type);

        await editorInstance.addIcon('arrow', options).then(objectProps => {

          //Assign all other saved values to the newly created layer
          _.assign(objectProps, layer);
          console.log("addLayer [ICON completed]", objectProps.id, objectProps);
        });
        break;

      default:
        console.error("addLayer type is not managed", layer, layer.type);
    }
  }

  const setFilteredTUIObject = () => {
    const editorObjects = editorInstance._graphics.getCanvas()._objects;

    for (let i = 0; i < editorObjects.length; i++) {
      if(editorObjects[i].type != "path" && editorObjects[i].type != "line"){
        //Strip off not needed properties like "_", "__", canvas, mouseMoveHandler
        let filteredProp = _.pick(editorObjects[i], _.keys(modelProp));
        objectsArr.push(filteredProp);
        console.log('obj',objectsArr)
      }
    }
  }

  useEffect(() => {
    console.log(ref);
    if(ref.current) setEditorInstance(ref.current);
  }, []);

  return {editorInstance, setFilteredTUIObject, addLayer, sendToInstance}
}

export default useEditor;