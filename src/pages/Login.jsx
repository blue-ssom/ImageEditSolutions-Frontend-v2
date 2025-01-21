import Header from "../components/Layout/Common/Header.jsx";
import { useNavigate } from 'react-router-dom';
import useUserInfo from '../hooks/useUserInfo.jsx';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth.jsx';
import { useState } from 'react'; // [ 추가/작성자:YSM ]

const Login = () => {
  // 컴포넌트, 리액트 쿼리로부터 data를 받아 렌더링. data가 있으면 id를 꺼내와서 oo님 반갑습니다. alert 화면 띄우기.
  const nav = useNavigate();
  const [userInfo, saveUserInfo, resetUserInfo] = useUserInfo();
  const {login} = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false); // [ 추가/작성자:YSM ] 모달 열림 여부
  const [modalMessage, setModalMessage] = useState(""); // [ 추가/작성자:YSM ] 모달에 표시될 메시지

  const handleLogin = async () => {
    if (!userInfo.id) {
      setModalMessage("아이디를 입력해주세요.");
      setIsModalOpen(true);
      return;
    }
  
    if (!userInfo.password) {
      setModalMessage("비밀번호를 입력해주세요.");
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/v1/login', { email: userInfo.id, password: userInfo.password }, {withCredentials:true});
      const authHeader = response.headers['authorization'];

      if (!authHeader) Error('authHeader is missing');

      const token = authHeader.split(' ')[1];

      if (!token) Error('token is missing');

      // localStorage에 access token 저장
      localStorage.removeItem("accessToken");
      localStorage.setItem("accessToken", token);
      login(token);

      resetUserInfo();

      nav('/');
    } catch (error) {
      // 네트워크 에러

      if (error) {
        console.error(error.response.data.message);
      }
      alert("로그인 실패");
    }
  };

    // [ 추가/작성자:YSM ] 모달 닫기 함수
    const closeModal = () => {
      setIsModalOpen(false);
    };
  
    // [ 추가/작성자:YSM ] 모달 컴포넌트
    const Modal = ({ message, onClose }) => {
      return (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-[#1F2937] rounded-lg shadow-lg w-[480px] h-[240px] p-6 flex flex-col justify-between">
            <h2 className="text-2xl text-blue-200 mb-4 text-center">알림</h2>
            <p className="text-white text-lg text-center mb-6">{message}</p>
            <button
              onClick={onClose}
              className="w-1/3 mx-auto py-2 px-4 text-white border border-white rounded hover:bg-gray-700 focus:outline-none transition duration-300"
            >
            확인
            </button>
          </div>
        </div>
      );
    };

  return(
    <div className="bg-[#1B1D20] h-screen flex flex-col items-center">
      <Header />
      <main className="m-t-center flex flex-col justify-center items-center w-[40%] h-[45%]">
        <h2 className="font-[700] text-[2rem] text-white mb-[10px]">Login</h2>

        <div className="w-full">
          <label className="text-[#B8B8B8] text-[1rem] leading-[29px] mb-2">아이디 또는 이메일</label>
          <input
            type="text"
            // placeholder="아이디 또는 이메일을 입력하세요" // [ 수정/작성자:YSM ] 플레이스홀더 주석 처리
            name="id"
            value={userInfo?.id ?? ''}
            onChange={(e) => saveUserInfo(e)}
            className={`bg-[#313131] w-full h-[4rem] mb-5 p-2 text-white`} // [ 수정/작성자:YSM ] 텍스트 색상을 흰색으로 변경
          />
        </div>
        <div className="w-full">
          <label className="text-[#B8B8B8] text-[1rem] leading-[29px] mb-2">비밀번호</label>
          <input
            name="password"
            type="text"
            // placeholder="PW를 입력하세요" // [ 수정/작성자:YSM ] 플레이스홀더 주석 처리
            value={userInfo?.password ?? ''}
            onChange={(e) => saveUserInfo(e)}
            className={`bg-[#313131] w-full h-[4rem] p-2 text-white`} // [ 수정/작성자:YSM ] 텍스트 색상을 흰색으로 변경
          />
        </div>

        <button
          className="w-[40%] h-[17%] rounded-[60px] bg-[#9DD6E9] text-[1.5rem] font-[600] mt-8 p-3 flex justify-center items-center"
          onClick={handleLogin}
        >
          로그인
        </button>
        <button
          className="text-[1rem] font-[500] text-[#B8B8B8] mt-4"
          onClick={() => nav('/signUp')}
        >
          회원가입
        </button>
        {/* [ 추가/작성자:YSM ] 모달 렌더링 */}
        {isModalOpen && <Modal message={modalMessage} onClose={closeModal} />}
      </main>
    </div>
  )
}

export default Login;