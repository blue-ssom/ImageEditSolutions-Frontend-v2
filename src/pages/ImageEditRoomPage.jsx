import ImageEditor from 'tui-image-editor';
import 'tui-image-editor/dist/tui-image-editor.css';
import myTheme from '../ui/theme/myTheme.js';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Modal from '../components/ImageEditorComponent/Modal.jsx';
import Header from '../components/ImageEditorComponent/Header';

import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const removeNullValues = (obj) => Object.fromEntries(Object.entries(obj).filter(([_, value]) => value != null)); // null 또는 undefined 모두 포함

const ImageEditRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [editorInstance, setEditorInstance] = useState(null);

  // header state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);

  const isRemoteChangeRef = useRef(false);

  // editor 로드 및 초기화
  useEffect(function initTuiInstance() {
    const editor = new ImageEditor(containerRef.current, {
      includeUI: {
        loadImage: {
          path: '/images/logo.png',
          name: 'SampleImage',
        },
        theme: myTheme,
        initMenu: 'draw',
        uiSize: {
          width: '100%',
          height: '100%',
        },
        menuBarPosition: 'left',
      },
      cssMaxWidth: 1000,
      cssMaxHeight: 600,
      usageStatistics: false,
    });

    editorRef.current = editor;
    console.log(editorRef.current);

    if (editor) {
      setEditorInstance(editor);
    }
  }, []);
  // webSocket 연결
  useEffect(() => {
    const authToken = localStorage.getItem('accessToken');

    // WebSocket 연결 설정
    const connectWebSocket = () => {
      const socketFactory = () => new SockJS('http://localhost:8080/ws');
      const client = Stomp.over(socketFactory);
      // socket 연결
      client.connect(
        { Authorization: `Bearer ${authToken}` },
        () => {
          setStompClient(client);
          setConnected(true);
          console.log("WebSocket connected");

          // 클라이언트가 **WebSocket을 통해 특정 topic(room/${roomId})**에서 발송되는 데이터를 구독(subscribe)하고, 해당 데이터를 수신할 때 콜백 함수를 실행하는 로직
          try{
            client.subscribe(`/topic/room/${roomId}`, (message) => {
              const data = JSON.parse(message.body);
              isRemoteChangeRef.current = true; // 원격 변경 표시
              applyRemoteEdit(data);
              isRemoteChangeRef.current = false; // 처리 후 해제
            });

            client.subscribe('user/queue/initial', function (message) {
              console.log("받은 메시지:", message.body);
            });
          } catch {
            console.error("socket 수신 실패", error)
          }

        },
        (error) => {
          console.error("socket 연결 실패", error);
          setTimeout(connectWebSocket, 1000); // 1초 후 재연결 시도
        }
      );
    };

    connectWebSocket();

    return () => {
      if (stompClient) stompClient.disconnect();
      editorInstance.destroy();
    };
  }, []);
  // 이벤트 등록
  useEffect(() => {
    if (connected && editorInstance) {
      const canvas = editorInstance._graphics.getCanvas();

      const onObjectAdded = (event) => {
        if (!isRemoteChangeRef.current && event.target.type === 'path') {
          console.log('added event 발생');
          handleObjectEvent(event, 'objectAdded');
        }
      };
      const onObjectCleared = (event) => {
        if (!isRemoteChangeRef.current) {
          console.log('selection:cleared');
          handleObjectEvent(event, 'objectModified');
        }
      };

      // canvas에 이벤트 리스너와 핸들러 등록.
      canvas.on('object:added', onObjectAdded);
      canvas.on('selection:cleared', onObjectCleared);

      // canvas에서 사용할 수 있는 이벤트 리스너
      // canvas.on('object:modified', ()=>console.log('modified'));
      // canvas.on('object:removed', ()=>console.log('removed'));
      // canvas.on('object:moving', ()=>console.log('moving'));
      // canvas.on('object:scaling', ()=>console.log('scaling'));
      // canvas.on('object:rotating', ()=>console.log('rotating'))
      // canvas.on('path:created', ()=>console.log('path:created'))
      // canvas.on('selection:created', ()=>console.log('selection:created'))
      // canvas.on('selection:updated', ()=>console.log('selection:updated'))

      // Clean up 이벤트 리스너
      return () => {
        canvas.off('object:added', onObjectAdded);
        canvas.off('object:modified', onObjectModified);
      };
    }
  }, [connected]);

  // 객체 이벤트 발생 시 WebSocket으로 전송
  const handleObjectEvent = (event, action) => {
    if (!stompClient || !connected) {
      console.warn("WebSocket client is not connected or stompClient is null");
      return;
    }
    console.log('handleObjectEvent event: ', event);

    const object = event.target || event.deselected[0];// 객체가 완성되지 않으면 해당 정보가 없음.
    console.log('현재 object 정보', object);

    if (!object || !object.type) {
      console.warn("Invalid object or type is undefined");
      return; // object 또는 type이 없으면 함수 종료 - mouse move 시 socket send 방지
    }

    const objectData = {
      type: object.type,
      left: object.left,
      top: object.top,
      width: object.width,
      height: object.height,
      fill: object.fill,
      stroke: object.stroke,
      strokeWidth: object.strokeWidth,
      angle: object.angle,
      scaleX: object.scaleX,
      scaleY: object.scaleY,
      text: object.text,
      fontSize: object.fontSize,
      fontWeight: object.fontWeight,
      fontStyle: object.fontStyle,
      textDecoration: object.textDecoration,
      rx: object.rx,
      ry: object.ry,
      pathOffset: object.pathOffset,
      lineCoords: object.lineCoords,
      path: object.type === 'path' ? object.toSVG() : null,
    };

    console.log("Object data to send:", removeNullValues(objectData));
    sendEdit(action, removeNullValues(objectData));
  };
  const sendEdit = (action, payload) => {
    console.log('sendEdit 실행');
    if (stompClient && connected) {
      try {
        stompClient.send(`/app/room/${roomId}/draw`, {}, JSON.stringify({
          action,
          objects: [payload],
        }));
        console.log("Sending edit action:", action, "Payload:", payload);
      } catch (error) {
        console.error("Error sending edit action:", error);
      }
    } else {
      console.warn("WebSocket is not connected, cannot send edit action");
    }
  };
  const applyRemoteEdit = async (data) => {
    const editor = editorRef.current;
    if (!editor || !editor._graphics) {
      console.error("Editor reference is invalid or not initialized.");
      return;
    }
    const canvas = editor._graphics.getCanvas();
    const { action, objects } = data;

    if (!objects || objects.length === 0) {
      console.warn("No objects to apply or invalid data");
      return;
    }

    const objectData = objects[0];
    console.log("Applying remote edit with data:", objectData);

    let object;

    try {
      switch (objectData.type) {
        case 'rect':
          object = editorRef.current?.addShape('rect', objectData);
          break;
        case 'circle':
          object = editorRef.current?.addShape('circle', objectData);
          break;
        case 'path':
          if (objectData.path) {
            console.log('path 그리기 실행');
            fabric.loadSVGFromString(objectData.path, (objects, options) => {
              object = fabric.util.groupSVGElements(objects, options);
              object.set({
                left: objectData.left || 0,
                top: objectData.top || 0,
                scaleX: objectData.scaleX || 1,
                scaleY: objectData.scaleY || 1,
                angle: objectData.angle || 0,
                fill: objectData.fill || 'transparent',
                stroke: objectData.stroke || null,
                strokeWidth: objectData.strokeWidth || 1,
              });
              canvas.add(object);
              canvas.renderAll();
            });
            return; // 비동기 처리를 위해 리턴
          } else {
            console.warn("Invalid path data:", objectData.path);
          }
          break;
        default:
          console.warn("Unsupported object type:", objectData.type);
      }

      // if (object && objectData.type !== 'path' && objectData.type !== 'rect') {
      //   canvas.add(object);
      //   canvas.renderAll();
      // }
    } catch (error) {
      console.error("Error applying remote edit:", error);
    }
  };

  return (
    <div className="flex flex-col bg-black h-screen w-screen">
      <div className="flex">
        <img
          src="/images/logo.png"
          alt="logo"
          className="h-11 m-5 cursor-pointer"
          onClick={() => navigate('/')}
        />
        <Header
          setIsSaveModalOpen={setIsSaveModalOpen}
          setIsLoadModalOpen={setIsLoadModalOpen}
          editor={editorInstance}
        />
      </div>
      <div className="flex flex-grow p-4 space-x-4">
        <div ref={containerRef}></div>
      </div>

      {
        isSaveModalOpen &&
        <Modal
          text="저장하기"
          onClose={() => setIsSaveModalOpen(false)} // 모달 닫기
        />
      }

      {
        isLoadModalOpen &&
        <Modal
          text="가져오기"
          onClose={() => setIsLoadModalOpen(false)} // 모달 닫기
        />
      }
      {/*<button className="text-white" onClick={() => sendEdit('김채윤','입니다.')}>저장</button>*/}
      {/*<button className="text-white" onClick={sendToInstance}>그리기</button>*/}
    </div>
  );
};

export default ImageEditRoomPage;
