import Header from "../components/Layout/Common/Header.jsx";
import { useNavigate } from 'react-router-dom';
import useUserInfo from '../hooks/useUserInfo.jsx';
import axios from 'axios';
import { useState } from 'react';

const SignUp = () => {
  // 컴포넌트, 리액트 쿼리로부터 data를 받아 렌더링. data가 있으면 id를 꺼내와서 oo님 반갑습니다. alert 화면 띄우기.
  const nav = useNavigate();
  const [userInfo, saveUserInfo, resetUserInfo] = useUserInfo();
  const [isClicked, setIsClicked] = useState(false); // [ 추가/작성자:YSM ] 클릭 상태 관리
  const [message, setMessage] = useState(""); // [ 추가/작성자:YSM ] 결과 메시지
  const [isError, setIsError] = useState(false); // [ 추가/작성자:YSM ] 에러 여부
  const [isModalOpen, setIsModalOpen] = useState(false); // [ 추가/작성자:YSM ] 모달 열림 여부
  const [modalMessage, setModalMessage] = useState(""); // [ 추가/작성자:YSM ] 모달에 표시될 메시지

  const handleSignUp = async () => {
    // 아이디와 비밀번호가 제대로 입력되었는지 확인하고 서버에 post 요청을 보냄.
    // 만약 아이디와 비밀번호가 없다면, alert.
    console.log(typeof(userInfo.id));

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
  
    if (!isClicked) {
      setModalMessage("중복 확인을 해주세요.");
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/v1/sign-up', { email: userInfo.id, password: userInfo.password });
      alert(response.data.message);

      if(response.data.code === 200) {
        nav('/login');
      } else {
        setModalMessage("회원가입에 실패했습니다. 다시 시도해주세요.");
        setIsModalOpen(true);
      }

    } catch (error) {
      setModalMessage("의도치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setIsModalOpen(true);
      console.error(error);
    }
  };

 // [ 추가/작성자:YSM ] 
  const handleCheckEmail = async () => {
    try {
      if (!userInfo.id) {
        setMessage("아이디 또는 이메일을 입력해주세요.");
        setIsError(true); // 에러 상태로 설정
        return;
      }

      const response = await axios.post('http://localhost:8080/v1/check-email', { email: userInfo.id });
      if (response.data.code === 200) {
        setMessage("사용 가능한 이메일입니다.");
        setIsError(false); // 성공 상태로 설정
      }

      setIsClicked(true); // 버튼 상태 업데이트

    } catch(error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data.message); // 서버로부터 전달받은 메시지를 설정
        setIsError(true); // 에러 상태로 설정
      } else {
        setMessage("중복 확인 요청 실패");
        setIsError(true); // 에러 상태로 설정
      }
      console.error("중복 확인 요청 실패:", error);
    }
  }

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
        <h2 className="font-[700] text-[2rem] text-white mb-[10px]">Sign Up</h2>

        {/* [ 수정/작성자:YSM ] 아래쪽 마진(margin-bottom) 추가 */}
        <div className="w-full mb-5">
          <label className="text-[#B8B8B8] text-[1rem] leading-[29px] mb-2">아이디 또는 이메일</label>
          <input
            type="text"
            // placeholder="ID를 입력하세요" // [ 수정/작성자:YSM ] 플레이스홀더 주석 처리
            name="id"
            value={userInfo?.id ?? ''}
            onChange={(e) => saveUserInfo(e)}
            className={`bg-[#313131] w-full h-[4rem] p-2 text-white`} // [ 수정/작성자:YSM ] 텍스트 색상을 흰색으로 변경, 아래쪽 마진(margin-bottom) 제거
          />

          {/* [ 추가/작성자:YSM ] 중복확인 버튼 추가 */}
          <div className="flex items-center mt-2">
            <button
              onClick={handleCheckEmail}
              className={`w-6 h-6 flex items-center justify-center rounded-sm border-2 transition-colors duration-200 ${
                isClicked
                  ? "bg-[#9DD6E9] border-[#9DD6E9]"
                  : "bg-transparent border-gray-400"
              }`}
            >
              {isClicked && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-black" 
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={5} 
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
            <span className="text-[#B8B8B8] text-[1rem] ml-2">중복 확인</span>
            <span className={`text-sm ml-4 ${isError ? "text-red-500" : "text-green-500"}`}>{message}</span>
          </div>
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
          onClick={handleSignUp}
        >
          회원가입
        </button>

        {/* [ 추가/작성자:YSM ] 홈으로 이동하는 버튼 추가 */}
        <button
          className="text-[1rem] font-[500] text-[#B8B8B8] mt-4"
          onClick={() => nav('/')}
        >
          홈으로
        </button>
        {/* [ 추가/작성자:YSM ] 모달 렌더링 */}
        {isModalOpen && <Modal message={modalMessage} onClose={closeModal} />}
      </main>
    </div>
  )
}

export default SignUp;