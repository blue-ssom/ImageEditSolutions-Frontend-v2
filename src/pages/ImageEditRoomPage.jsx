import ImageEditor from 'tui-image-editor';
import 'tui-image-editor/dist/tui-image-editor.css';
import myTheme from '../ui/theme/myTheme.js';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Modal from '../components/ImageEditorComponent/Modal.jsx';
import Header from '../components/ImageEditorComponent/Header';

import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

// [수정] removeNullValues 함수 : 객체에서 null이나 undefined 값을 제거 - 작성자: YSM
const removeNullValues = (obj) => Object.fromEntries(Object.entries(obj).filter(([_, value]) => value != null));

const ImageEditRoomPage = () => {
  const { roomId } = useParams(); // [수정] URL에서 방 ID를 추출 - 작성자: YSM
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [editorInstance, setEditorInstance] = useState(null);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);

  const isRemoteChangeRef = useRef(false);

  const [drawings, setDrawings] = useState([]); // [수정] drawings 상태와 setDrawings 함수 선언 - 작성자: YSM
  

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

    if (editor) {
      setEditorInstance(editor);
    }
  }, []);

  // [수정] WebSocket 연결 - 작성자: YSM
  useEffect(() => {
     // 이미지 URL 상태 선언
    const authToken = localStorage.getItem('accessToken');

    const connectWebSocket = () => {
      const socketFactory = () => new SockJS('http://localhost:8080/ws');
      const client = Stomp.over(socketFactory);

      // [수정] roomId 필드 추가 - 작성자: YSM
      client.connect({ Authorization: `Bearer ${authToken}`, roomId },() => {
        setStompClient(client);
        setConnected(true);
        console.log("WebSocket connected");

        // [수정] 2. 실시간 데이터 구독 - 작성자: YSM
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          try{
            const data = JSON.parse(message.body);
            console.log("실시간 데이터");
            console.log(`[WebSocket 경로: /topic/room/${roomId}] JSON으로 파싱한 데이터 : `, data); 

            isRemoteChangeRef.current = true; // 원격 변경 표시

              // data.object 또는 data.objects가 배열이 아니면 배열로 감싸기
              const objects = Array.isArray(data.object) ? data.object : data.object ? [data.object] : [];
              const objectsFromData = Array.isArray(data.objects) ? data.objects : data.objects ? [data.objects] : [];

              // 유효한 객체들만 추가
              setDrawings((prevDrawings) => [
                ...prevDrawings,
                ...objects.filter(item => item !== undefined),
                ...objectsFromData.filter(item => item !== undefined)
              ]);

            applyRemoteEdit(data); // [수정] 받은 데이터를 화면에 반영 - 작성자: YSM
            isRemoteChangeRef.current = false; // 처리 후 해제
          } catch (error) {
            console.error(`[WebSocket 경로: /topic/room/${roomId}] JSON 파싱 실패 : `, error)
          }
        });

        
        // [수정] 1. 초기 데이터 구독 - 작성자: YSM
        client.subscribe('/user/queue/initial', (message) => {
          try {
            const data = JSON.parse(message.body); // [수정] 서버에서 받은 데이터 - 작성자: YSM
            console.log("초기 데이터");
            console.log("[WebSocket 경로: /user/queue/initial] 파싱된 데이터 : ", data); 
            // [수정] 초기 상태를 저장하고 렌더링 - 작성자: YSM
            setDrawings(data); // [수정] 상태로 저장 - 작성자: YSM
            data.forEach(drawing => applyRemoteEdit(drawing)); // [수정] 데이터를 캔버스에 적용하는 로직을 추가 - 작성자: YSM
            // applyRemoteEdit(data); // [수정] 데이터를 캔버스에 적용하는 로직을 추가 - 작성자: YSM
          } catch (error) {
            console.error("[WebSocket 경로: /user/queue/initial] JSON 파싱 실패 :", error);
          }
        });
        
        // [수정] 3. 방 참여 요청 - 작성자: YSM
        client.send(`/app/room/${roomId}/join`);
        console.log('방 참여 요청 전송:', `/app/room/${roomId}/join`);
        }, (error) => {
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

  }, [roomId]);



   // [수정] 상태 변경 시 로그 출력 - 작성자: YSM
   useEffect(() => {
    console.log("현재 drawings 상태:", drawings); // 상태가 업데이트될 때마다 실행
  }, [drawings]);

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

      // const onObjectCleared = (event) => {
      //   if (!isRemoteChangeRef.current) {
      //     console.log('selection:cleared');
      //     handleObjectEvent(event, 'objectModified');
      //   }
      // };

      // 객체 수정 이벤트 처리
      const onObjectModified = (event) => {
        if (!isRemoteChangeRef.current) {
            console.log('객체 수정 이벤트 발생');
            handleObjectEvent(event, 'objectModified');
        }
    };

      // canvas에 이벤트 리스너와 핸들러 등록.
      canvas.on('object:added', onObjectAdded);
      // canvas.on('selection:cleared', onObjectCleared);
      canvas.on('object:modified', onObjectModified); // 객체 수정 이벤트


      // Clean up 이벤트 리스너
      return () => {
        canvas.off('object:added', onObjectAdded);
        canvas.off('object:modified', onObjectModified);
      };
    }
  }, [connected, editorInstance]);

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

    function generateUniqueId() {
      return Math.random().toString(36).substring(2, 8); // 6자리 고유 ID
    }

    let objectData;
    switch (action) {
      case 'objectAdded':
        // 객체 추가 시
        objectData = {
          clientId: generateUniqueId(), // 고유 식별자 생성
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
        console.log('객체 추가 데이터:', removeNullValues(objectData));
        break;

      case 'objectModified':
        // 객체 수정 시
        objectData = {
          clientId: object.clientId,
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
        console.log('객체 수정 데이터:', objectData);
        break;
    
      default:
        console.warn('지원되지 않는 액션:', action);
        return; // 처리 중단
    }

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

// [수정] 실시간 변경 사항 반영 - 작성자 : YSM
  const applyRemoteEdit = async (data) => {
    const editor = editorRef.current;
    if (!editor || !editor._graphics) {
      console.error("Editor reference is invalid or not initialized.");
      return;
    }
    const canvas = editor._graphics.getCanvas();
    console.log('Full data received:', data);

    // [수정] 데이터 구조 분해 및 기본값 설정 로직 추가 - 작성자: YSM
    const { action, objects = data.object || [] } = data;

    // [수정] 배열 여부와 길이를 검증하는 로직 추가 - 작성자: YSM
    if (!Array.isArray(objects) || objects.length === 0) {
        console.warn('No objects to apply or invalid data');
        return;
    }

    const objectData = objects[0];
    console.log('현재 처리 중인 데이터:', objectData);

    let object;

    try {
      switch (objectData.type) {
        case 'rect':
          object = editorRef.current?.addShape('rect', objectData);
          break;
        case 'circle':
          object = editorRef.current?.addShape('circle', objectData);
          console.log("Created Circle Object:", object);
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
          src={'/images/logo.png'}
          alt="logo"
          className="h-11 m-5 cursor-pointer"
          onClick={() => navigate('/')}
        />
        <Header
          setIsSaveModalOpen={setIsSaveModalOpen}
          setIsLoadModalOpen={setIsLoadModalOpen}
          editor={editorInstance}
          roomId={roomId} // [수정] roomId를 Header 컴포넌트에 전달 - 작성자 : YSM
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
