import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('accessToken'));

  const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/v1',
  });

  if (authToken) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  }

  const login = (token) =>{
    setAuthToken(token)
    localStorage.setItem('authToken', token);
  };

  const logout = async () => {
    try {
      console.log(`Bearer ${authToken}`);
      await axiosInstance.post('/logout',{},{
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Authorization-refresh': `Bearer ${authToken}`,
          'Content-Type' : 'application/json'
        },
        withCredentials:true,
      });
      setAuthToken(null);
      localStorage.removeItem('authToken');
      alert("로그아웃 되었습니다.");
      window.location.replace('http://localhost:3000/');
    } catch (error) {
      console.error("로그아웃 실패", error);
      alert("로그아웃에 실패했습니다.");
    }
  };

  const isAuthenticated = !!authToken; // 로그인 상태

  useEffect(()=>{
    if(authToken){
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
    }
    else {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  },[authToken, axiosInstance.defaults.headers.common]);

  return (
    <AuthContext.Provider value={{ authToken, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);