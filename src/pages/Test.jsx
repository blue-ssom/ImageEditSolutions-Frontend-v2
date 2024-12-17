import React from 'react'
import 'tui-image-editor/dist/tui-image-editor.css';
import ImageEditor from '@toast-ui/react-image-editor';
import * as _ from "lodash";

const myTheme = {
  // Theme object to extends default dark theme.
};
let editorInstance;

function Test() {
  const  editorRef = React.createRef();
  const [editor,setEditor]=React.useState("")
  const objectsArr = []


  async function addLayer(layer){

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

  function setFilteredTUIObject(editorObjects){
    console.log('김채윤2', editorInstance._graphics.getCanvas()._objects);

    //Properties pick
    var modelProp = {
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

    for (let i = 0; i < editorObjects.length; i++) {
      console.log(editorObjects[i]);
      if(editorObjects[i].type != "path" && editorObjects[i].type != "line"){
        //Strip off not needed properties like "_", "__", canvas, mouseMoveHandler
        let filteredProp = _.pick(editorObjects[i], _.keys(modelProp));
        console.log("filteredProp", filteredProp);
        objectsArr.push(filteredProp);
      }
    }
  }

  function handleClickButton()  {
    setFilteredTUIObject(editorInstance._graphics.getCanvas()._objects);
  };

  function handleClickButton1()  {
    console.log(editorInstance._graphics.getObjectProperties(3));
  };

  function objectAdded(props){
    console.log(props)
  }

  React.useEffect(()=>{
    editorInstance = editorRef.current.getInstance();
    setEditor(editorRef.current.getInstance())
    // editorInstance.loadImageFromURL('https://image.shutterstock.com/image-photo/mountains-under-mist-morning-amazing-600w-1725825019.jpg', 'lena')
  })

  React.useEffect(()=>{
    if(editorInstance){
      editorInstance.on('redoStackChanged',(props)=>console.log(props,"redoStackChanged"))
      editorInstance.on('objectAdded',(props)=>console.log(props,"objectAdded"))
      editorInstance.on('undoStackChanged',(props)=>console.log(props,"undoStackChanged"))
      editorInstance.on('addText',(props)=>console.log(props,"addText"))
      // editorInstance.on('textEditing',(props)=>console.log(props,"addText"))
      console.log(editorInstance._initHistory())
      // editorInstance.on('objectMoved',(props)=>console.log(props,"addText"))
    }
  })
  try{
    return (
      <div>
        <ImageEditor
          ref={editorRef}
          includeUI={{
            objectAdded,
            loadImage: {
              path: 'https://image.shutterstock.com/image-photo/mountains-under-mist-morning-amazing-600w-1725825019.jpg',
              name: 'SampleImage'
            },
            theme: myTheme,
            menu: ['shape', 'filter','text','icon','crop',],
            initMenu: 'filter',
            uiSize: {
              width: '1000px',
              height: '700px',
            },
            menuBarPosition: 'bottom',
          }}
          cssMaxHeight={500}
          cssMaxWidth={700}
          selectionStyle={{
            cornerSize: 20,
            rotatingPointOffset: 70,
          }}
          usageStatistics={true}
        />
        <button onClick={handleClickButton}>Save all</button>
        <button onClick={()=>{

          let asyncAddLayout = [];

          objectsArr.forEach(async (el)=>{
            setTimeout(async () => {
              asyncAddLayout.push( await addLayer(el))
            }, 100);
          })
        }}>Re paste all</button>
      </div>
    )
  } catch(e){
    console.log(e);
    window.location.reload()
  }
}

export default Test