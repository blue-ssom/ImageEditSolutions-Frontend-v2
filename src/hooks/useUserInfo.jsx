import { useState } from 'react';

export const initialUserInfo = {
  id: '',
  password: '',
};

export const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState(initialUserInfo);
  console.log(userInfo)

  const saveUserInfo = e => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const resetUserInfo = () => { setUserInfo(initialUserInfo); }

  return [userInfo, saveUserInfo, resetUserInfo];
}

export default useUserInfo;