import { default as ToastUIEditor } from '@toast-ui/react-image-editor';
import 'tui-image-editor/dist/tui-image-editor.css';
import myTheme from '../ui/theme/myTheme.js';
import { useLocation, useNavigate } from 'react-router-dom';
// import { useEffect, useRef, useState } from 'react';
// import Modal from '../components/ImageEditorComponent/Modal.jsx';
// import Header from '../components/ImageEditorComponent/Header';
//
// const ImageEditPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { imageUrl } = location.state || {}; // 전달된 이미지 URL을 받음
//
//   const editorRef = useRef(null);
//
//   // header state
//   const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
//   const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
//   const [editorInstance, setEditorInstance] = useState(null);
//
//   // editor 초기화
//   useEffect(() => {
//     console.log(editorRef);
//     editorRef.current.imageEditorInst._graphics._canvas.on('_onMouseDown',() => console.log('김채윤'))
//
//     if (editorRef.current) {
//       setEditorInstance(editorRef.current);
//     }
//   }, [editorRef.current]);

  import React, { useEffect, useRef, useState } from 'react';
  import 'tui-image-editor/dist/tui-image-editor.css';
  import ImageEditor from '@toast-ui/react-image-editor';
  import * as _ from "lodash";

  let editorInstance;
  function ImageEditPage() {
    const  editorRef = useRef();
    const [editor,setEditor] = useState("")
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
          console.log(editorInstance);
          console.log('김채윤',options);

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

        if(editorObjects[i].type != "path" && editorObjects[i].type != "line"){
          //Strip off not needed properties like "_", "__", canvas, mouseMoveHandler
          let filteredProp = _.pick(editorObjects[i], _.keys(modelProp));
          objectsArr.push(filteredProp);
          console.log('fil',filteredProp);
        }



      }

    }

    useEffect(() => {
      console.log(editorRef.current);
    }, []);

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
    }catch(e){
      console.log(e);
      window.location.reload()

    }
  }

//   export default Editor
//
//   return (
//     <div className="flex flex-col bg-black h-screen w-screen">
//       <div className="flex">
//         <img
//           src="/images/logo.png"
//           alt="logo"
//           className="h-11 m-5 cursor-pointer"
//           onClick={() => navigate('/')}
//         />
//         <Header
//           setIsSaveModalOpen={setIsSaveModalOpen}
//           setIsLoadModalOpen={setIsLoadModalOpen}
//           editor={editorInstance}
//         />
//       </div>
//       <div className="flex flex-grow p-4 space-x-4">
//         {imageUrl &&
//           <ToastUIEditor
//             ref={editorRef}
//             includeUI={{
//               loadImage: {
//                 path: imageUrl ?? '',
//                 name: 'Uploaded Image',
//               },
//               theme: myTheme, // 커스텀 테마 적용
//               uiSize: {
//                 width: '100%',
//                 height: '100%',
//               },
//               menuBarPosition: 'left',
//             }}
//             cssMaxHeight={500}
//             cssMaxWidth={700}
//             selectionStyle={{
//               cornerSize: 20,
//               rotatingPointOffset: 70,
//             }}
//           />
//         }
//       </div>
//
//       {
//         isSaveModalOpen &&
//         <Modal
//           text="저장하기"
//           onClose={() => setIsSaveModalOpen(false)} // 모달 닫기
//         />
//       }
//
//       {
//         isLoadModalOpen &&
//         <Modal
//           text="가져오기"
//           onClose={() => setIsLoadModalOpen(false)} // 모달 닫기
//         />
//       }
//     </div>
//   );
// };

export default ImageEditPage;
