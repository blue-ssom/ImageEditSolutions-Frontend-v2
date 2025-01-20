import Header from "../components/Layout/Common/Header.jsx";
import { useNavigate } from 'react-router-dom';
import useUserInfo from '../hooks/useUserInfo.jsx';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth.jsx';

const Login = () => {
  // 컴포넌트, 리액트 쿼리로부터 data를 받아 렌더링. data가 있으면 id를 꺼내와서 oo님 반갑습니다. alert 화면 띄우기.
  const nav = useNavigate();
  const [userInfo, saveUserInfo, resetUserInfo] = useUserInfo();
  const {login} = useAuth();

  const handleLogin = async () => {
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
      </main>
    </div>
  )
}

export default Login;