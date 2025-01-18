import ImageEditor from 'tui-image-editor';
import 'tui-image-editor/dist/tui-image-editor.css';
import myTheme from '../ui/theme/myTheme.js';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Modal from '../components/ImageEditorComponent/Modal.jsx';
import Header from '../components/ImageEditorComponent/Header';

import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const removeNullValues = (obj) => Object.fromEntries(Object.entries(obj).filter(([_, value]) => value != null));

const ImageEditRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [editorInstance, setEditorInstance] = useState(null);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);

  const isRemoteChangeRef = useRef(false);

  const [drawings, setDrawings] = useState([]); // [ 추가/작성자:YSM ] drawings 상태와 setDrawings 함수 선언

  let oldWidth = null; // [ 추가/작성자:YSM ] 선택된 객체의 기존 width 값을 저장할 변수

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

  useEffect(() => {
    const authToken = localStorage.getItem('accessToken');

    const connectWebSocket = () => {
      const socketFactory = () => new SockJS('http://localhost:8080/ws');
      const client = Stomp.over(socketFactory);

      client.connect(
        { Authorization: `Bearer ${authToken}`, roomId },  // [ 추가/작성자:YSM ] 방 ID 추가하여 헤더로 전달
        () => {
          setStompClient(client);
          setConnected(true);
          console.log("WebSocket connected");

          // [ 수정/작성자:YSM ] 1. 초기 데이터 구독
          client.subscribe('/user/queue/initial', (message) => {
            try {
              const data = JSON.parse(message.body);
              console.log("[WebSocket 경로: /user/queue/initial] 초기 데이터 수신");

              setDrawings(data); // [ 추가/작성자:YSM ] drawings 상태 업데이트
              
              isRemoteChangeRef.current = true; // [ 추가/작성자:YSM ] 다른 사용자가 그린 그림이나 서버에서 업데이트된 데이터를 반영 중

              // [ 수정/작성자:YSM ] data 배열의 각 항목을 순회하며 원격에서 받은 각 그림 데이터를 화면에 적용
              data.forEach((drawing) => {
                applyRemoteEdit(drawing);
              });

              isRemoteChangeRef.current = false;
            } catch (error) {
              console.error("[WebSocket 경로: /user/queue/initial] JSON 파싱 실패 :", error);
            }
          });

          // [ 수정/작성자:YSM ] 2. 실시간 데이터 구독
          // [ 수정/작성자:YSM ] convertAndSendToUser 사용으로 인해 topic에서 queue로 구독 경로로 변경
          client.subscribe(`/user/queue/room/${roomId}`, (message) => {
            try{
              const data = JSON.parse(message.body);
              console.log(`[WebSocket 경로: /user/queue/room/${roomId}]로 실시간 데이터 수신`, data);

              isRemoteChangeRef.current = true;

              // [ 추가/작성자:YSM ] data.object 또는 data.objects가 배열이 아니면 배열로 감싸기
              const objects = Array.isArray(data.object) ? data.object : data.object ? [data.object] : [];
              const objectsFromData = Array.isArray(data.objects) ? data.objects : data.objects ? [data.objects] : [];

              // [ 추가/작성자:YSM ] 이전 상태(prevDrawings)와 새로운 객체들(objects 및 objectsFromData에서 undefined를 제외한 값들)을 결합하여 새로운 상태로 설정
              setDrawings((prevDrawings) => [
                ...prevDrawings,
                ...objects.filter(item => item !== undefined),
                ...objectsFromData.filter(item => item !== undefined)
              ]);

              applyRemoteEdit(data);

              isRemoteChangeRef.current = false;
            } catch (error) {
              console.error(`[WebSocket 경로: /topic/room/${roomId}] JSON 파싱 실패 : `, error)
            }
          });

          // [ 추가/작성자:YSM ] 3. 실시간 수정 데이터 구독
          client.subscribe(`/user/queue/update/room/${roomId}`,(message) => {
            try {
              const data = JSON.parse(message.body);
              console.log(`[/user/queue/update/room/${roomId}] 수정 데이터 수신:`,data);

              setDrawings(data); // [ 추가/작성자:YSM ] drawings 상태 업데이트
              
              isRemoteChangeRef.current = true; // [ 추가/작성자:YSM ] 다른 사용자가 그린 그림이나 서버에서 업데이트된 데이터를 반영 중
              
              // [ 추가/작성자:YSM ] 에디터 화면 초기화
              if (editorRef.current) {
                editorRef.current.clearObjects();
              }

              // [ 수정/작성자:YSM ] data 배열의 각 항목을 순회하며 원격에서 받은 각 그림 데이터를 화면에 적용
              data.forEach((drawing) => {
                applyRemoteEdit(drawing);
              });

              isRemoteChangeRef.current = false;
            }catch (error) {
              console.error(`[WebSocket 경로: /user/queue/update/room/${roomId}] JSON 파싱 실패 : `, error)
            }
          });

          // [ 추가/작성자:YSM ]
          client.subscribe(`/user/queue/delete/room/${roomId}`,(message) => {
            try {
              const data = JSON.parse(message.body);
              console.log(`[/user/queue/delete/room/${roomId}] 수정 데이터 수신:`,data);

              setDrawings(data); 
              
              isRemoteChangeRef.current = true; 
              
              if (editorRef.current) {
                editorRef.current.clearObjects();
              }

              data.forEach((drawing) => {
                applyRemoteEdit(drawing);
              });

              isRemoteChangeRef.current = false;
            }catch (error) {
              console.error(`[WebSocket 경로: /user/queue/delete/room/${roomId}] JSON 파싱 실패 : `, error)
            }
          });

          // [ 추가/작성자:YSM ] 5. 방 참여 요청
          client.send(`/app/room/${roomId}/join`);
          console.log(`[WebSocket 경로: /topic/room/${roomId}] 방 참여 요청 전송`);
        }, (error) => {
          console.error("WebSocket연결 실패", error);
          setTimeout(connectWebSocket, 1000);
        }
      );
    };

    connectWebSocket(); 

    return () => {
      if (stompClient) stompClient.disconnect();
      editorInstance.destroy();
    };
  }, [roomId]); // [ 추가/작성자:YSM ] roomId 변경 시에만 재연결

  // [ 추가/작성자:YSM ] drawings 상태가 변경될 때마다 새로운 상태를 콘솔에 출력
  useEffect(() => {
    console.log("현재 drawings 상태:", drawings); 
  }, [drawings]);

  let isAdding = false; // [ 추가/작성자:YSM ] 객체 추가 상태
  let isSelecting = false; // [ 추가/작성자:YSM ] 객체 선택 상태

  // [ 설명/작성자:YSM ] 이벤트 등록
  useEffect(() => {
    if (connected && editorInstance) {
      const canvas = editorInstance._graphics.getCanvas();

      const onObjectAdded = (event) => {
        if (isSelecting) return; // [ 추가/작성자:YSM ] 선택 중이라면 추가 이벤트 처리 안함

        isAdding = true;
        console.log("onObjectAdded 이벤트 발생");

        if (!isRemoteChangeRef.current && event.target.type === 'path') {
          handleObjectEvent(event, 'objectAdded');
        } else {
          console.log('onObjectAdded 이벤트 무시 - isRemoteChangeRef 조건 불만족 또는 type이 path가 아님');
        }

        isAdding = false; // [ 추가/작성자:YSM ] 추가 처리 후, 상태를 비움
      };

      // [ 추가/작성자:YSM ] 객체 선택 이벤트 핸들러
      const onObjectSelected = (event) => {
        if (isAdding) return; // 추가 중이라면 선택 이벤트 처리 안함
        
        isSelecting = true;
        console.log("onObjectSelected 이벤트 발생");
  
        if (event.target !== null) {
          console.log('클릭된 객체:', event.target);

          oldWidth = event.target.width; // 기존 Width 값
          console.log("기존 Width 값:", oldWidth);
        } else {
          console.error('클릭된 객체가 없습니다.');
        }

        isSelecting = false;  // 선택 처리 후, 상태를 비움
      }

      // [ 추가/작성자:YSM ] 객체 수정 이벤트 핸들러
      const onObjectModified = (event) => {
        console.log("onObjectModified 이벤트 발생");
        if (!isRemoteChangeRef.current && event.target.type === 'path') {
          handleObjectEvent(event, 'objectModified');
        } else {
          console.log('onObjectModified 이벤트 무시 - isRemoteChangeRef 조건 불만족 또는 type이 path가 아님');
        }
      }

      // [ 추가/작성자:YSM ]
      const onObjectRemoved = (event) => {
        if (!isRemoteChangeRef.current && event.target.type === 'path') {
          console.log("onObjectRemoved 이벤트 발생");
          handleObjectEvent(event, 'objectRemoved');
        } else {
          console.log('onObjectRemoved 이벤트 무시 - isRemoteChangeRef 조건 불만족 또는 type이 path가 아님');
        }
      }
      
      canvas.on('object:added', onObjectAdded);
      canvas.on('mouse:down', onObjectSelected); // [ 추가/작성자:YSM ] 객체 선택 시 처리하는 캔버스 이벤트 리스너 등록
      canvas.on('object:modified', onObjectModified);  // [ 추가/작성자:YSM ] 객체 수정정 시 처리하는 캔버스 이벤트 리스너 등록
      canvas.on('object:removed', onObjectRemoved); // 1/18

      return () => {
        canvas.on('object:added', onObjectAdded);
        canvas.on('mouse:down', onObjectSelected); 
        canvas.on('obejct:modified', onObjectModified);
        canvas.on('object:removed', onObjectRemoved); // 1/18
      };
    } else {
      console.log("connected가 false이거나 editorInstance가 존재하지 않음");
    }
  }, [connected, editorInstance]); // [ 추가/작성자:YSM ] connected나 editorInstance 상태가 변경될 때마다 실행

  // [ 설명/작성자:YSM ] 객체 이벤트 발생 시 WebSocket으로 전송
  const handleObjectEvent = (event, action) => {
    if (!stompClient || !connected) {
      console.warn("WebSocket client가 연결되지 않았거나 stompClient가 null");
      return;
    }

    const object = event.target || event.deselected[0];
    // console.log('현재 object 정보', object);

    if (!object || !object.type) {
      console.warn("유효하지 않은 object 또는 type이 undefined");
      return;
    }
    
    // [ 추가/작성자:YSM ] 랜덤 값을 생성하여 고유한 ID를 반환하는 함수
    function generateUniqueId() {
      const id = Math.random().toString(36).substring(2, 8);
      return id;
    }

    let objectData;
    switch (action) {
      case 'objectAdded':
        console.log("객체 추가 이벤트 처리 중...");

        objectData = {
          clientId: generateUniqueId(), // [ 추가/작성자:YSM ] 고유 식별자 생성
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
        // [ 추가/작성자:YSM ] drawing 배열이 비어있을 경우 첫 번째 그림 데이터를 추가하는 로직
        if (drawings.length === 0) {
          console.log("drawing 배열이 비어있으면 첫 번째 그림이므로 추가")
          setDrawings([removeNullValues(objectData)]);
        } 
        console.log('객체 추가 데이터:', removeNullValues(objectData));
        break;

      case 'objectModified':
        console.log("객체 수정 이벤트 처리 중...");

        objectData = {
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

        console.log('객체 수정 데이터:', removeNullValues(objectData));
        break;
      
      case 'objectRemoved':
        console.log("객체 삭제 이벤트 처리 중...");

        objectData = {
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
        console.log('객체 삭제 데이터:', removeNullValues(objectData));
        break;
    
      default:
        console.warn('지원되지 않는 액션:', action);
        return; 
    }

    sendEdit(action, removeNullValues(objectData), oldWidth); // [ 수정/작성자:YSM ] 이전 너비 값(oldWidth) 전달
  };

  // [ 설명/작성자:YSM ] 편집 작업을 서버로 전송
  const sendEdit = (action, payload, oldWidth) => {
    if (!stompClient || !connected || !action || !payload) {
      console.warn('stompClient가 없거나 연결되지 않은 경우, action 또는 payload가 없음');
      return;
    }

    try {
      // [ 수정/작성자:YSM ] action이 objectAdded일 경우
      if (action === 'objectAdded') {
        stompClient.send(`/app/room/${roomId}/draw`, {}, JSON.stringify({
          action,
          objects: [payload],
        }));
        console.log("sendEdit 작업 전송:", action, "Payload:", payload);
      } 
      // [ 추가/작성자:YSM ]action이 objectModified일 경우
      else if (action === 'objectModified') {
        stompClient.send(`/app/room/${roomId}/update`, 
        { oldWidth: oldWidth },  // oldWidth를 헤더로 추가
        JSON.stringify({ action, objects: [payload] })
      );
        console.log("sendEdit 작업 전송: objectModified", " Payload: ", payload, " oldWidth: ", oldWidth);
      }
      // 1/18
      else if (action === 'objectRemoved') {
        stompClient.send(`/app/room/${roomId}/delete`, 
          { oldWidth: oldWidth },  // oldWidth를 헤더로 추가
          JSON.stringify({ action, objects: [payload] })
        );
        console.log("sendEdit 작업 전송: objectRemoved", " Payload: ", payload, " oldWidth: ", oldWidth);
      }
    } catch (error) {
      console.error("sendEdit 작업 전송 중 오류 발생:", error);
    }
  };

  // [ 수정/작성자:YSM ] 서버에서 받은 데이터를 캔버스에 반영
  const applyRemoteEdit = async (data) => {
    const editor = editorRef.current;

    if (!editor || !editor._graphics) {
      console.error(" editor 또는 _graphics가 없음");
      return;
    }

    const canvas = editor._graphics.getCanvas();

    // [ 수정/작성자:YSM ] 데이터 구조 분해 및 기본값 설정 로직 추가
    const { action, objects = data.object || [] } = data;

    if (!Array.isArray(objects) || objects.length === 0) {
        console.warn('적용할 객체가 없거나 잘못된 데이터입니다.');
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
            return; 
          } else {
            console.warn("잘못된 path 데이터:", objectData.path);
          }
          break;
        default:
          console.warn("지원되지 않는 객체 유형:", objectData.type);
      }
    } catch (error) {
      console.error("applying remote edit 적용 중 오류 발생:", error);
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
        />
      </div>
      <div className="flex flex-grow p-4 space-x-4">
        <div ref={containerRef}></div>
      </div>

      {
        isSaveModalOpen &&
        <Modal
          text="저장하기"
          onClose={() => setIsSaveModalOpen(false)}
        />
      }

      {
        isLoadModalOpen &&
        <Modal
          text="가져오기"
          onClose={() => setIsLoadModalOpen(false)}
        />
      }
    </div>
  );
};

export default ImageEditRoomPage;
