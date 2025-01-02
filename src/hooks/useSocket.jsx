import { createContext, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';


// context 만들기 세 단계
// 1. 소켓 컨텍스트 만들기
// 2. provider 만들기
// 3. consumer 만들기


// 1. 컨텍스트
export const WebsocketContext = createContext(false, null, () => {});
// ready, value, send

const useSocket = () => {
  const authToken = localStorage.getItem('accessToken');



  return(
    //provider로 context 공급
    <useSocket.Provider value={} >
      {children}
    </useSocket.Provider>
  )
}

