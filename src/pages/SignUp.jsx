import Header from "../components/Layout/Common/Header.jsx";
import { useNavigate } from 'react-router-dom';
import useUserInfo from '../hooks/useUserInfo.jsx';
import axios from 'axios';

const SignUp = () => {
  // 컴포넌트, 리액트 쿼리로부터 data를 받아 렌더링. data가 있으면 id를 꺼내와서 oo님 반갑습니다. alert 화면 띄우기.
  const nav = useNavigate();
  const [userInfo, saveUserInfo, resetUserInfo] = useUserInfo();

  const handleSignUp = async () => {
    // 아이디와 비밀번호가 제대로 입력되었는지 확인하고 서버에 post 요청을 보냄.
    // 만약 아이디와 비밀번호가 없다면, alert.
    console.log(typeof(userInfo.id));

    try {
      const response = await axios.post('http://localhost:8080/v1/sign-up', { email: userInfo.id, password: userInfo.password });
      alert(response.data.message);

      if(response.data.code === 200) {
        nav('/login');
      }

    } catch (error) {
      console.error(error);
      alert("회원가입 실패");
    }
  };

  return(
    <div className="bg-[#1B1D20] h-screen flex flex-col items-center">
      <Header />
      <main className="m-t-center flex flex-col justify-center items-center w-[40%] h-[45%]">
        <h2 className="font-[700] text-[2rem] text-white mb-[10px]">Sign Up</h2>

        <div className="w-full">
          <label className="text-[#B8B8B8] text-[1rem] leading-[29px] mb-2">아이디 또는 이메일</label>
          <input
            type="text"
            placeholder="ID를 입력하세요"
            name="id"
            value={userInfo?.id ?? ''}
            onChange={(e) => saveUserInfo(e)}
            className={`bg-[#313131] w-full h-[4rem] mb-5 p-2`}
          />
        </div>
        <div className="w-full">
          <label className="text-[#B8B8B8] text-[1rem] leading-[29px] mb-2">비밀번호</label>
          <input
            name="password"
            type="text"
            placeholder="PW를 입력하세요"
            value={userInfo?.password ?? ''}
            onChange={(e) => saveUserInfo(e)}
            className={`bg-[#313131] w-full h-[4rem] p-2`}
          />
        </div>

        <button
          className="w-[40%] h-[17%] rounded-[60px] bg-[#9DD6E9] text-[1.5rem] font-[600] mt-8 p-3 flex justify-center items-center"
          onClick={handleSignUp}
        >
          회원가입
        </button>
      </main>
    </div>
  )
}

export default SignUp;