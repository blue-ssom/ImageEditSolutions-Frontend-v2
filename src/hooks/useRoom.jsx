// RoomContext.js
import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth.jsx';

const RoomContext = createContext(null);

export const RoomProvider = ({ children }) => {
  const { authToken } = useAuth();
  const [roomId, setRoomId] = useState(null);

  const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/v1',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  // 방 생성 함수
  const createRoom = async () => {
    try {
      const response = await axiosInstance.post('/room');
      const newRoomId = response.data.data;
      setRoomId(newRoomId);
      return newRoomId;
    } catch (error) {
      console.error("방 생성 실패", error);
      return null;
    }
  };

  // 방 참가 함수
  const joinRoom = async (roomId) => {
    console.log("사용자가 방 번호 ", roomId, " 참가");
  };

  return (
    <RoomContext.Provider value={{ roomId, createRoom, joinRoom }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => useContext(RoomContext);