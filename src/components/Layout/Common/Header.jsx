import LogoImage from '/images/logo.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../../hooks/useAuth";

export default function Header() {
  const nav = useNavigate();
  const { authToken, logout } = useAuth();

  return (
    <header
      className="w-full h-[136px] bg-black flex items-center justify-between px-8"
      style={{ padding: "0 200px" }} // [ 수정/작성자:YSM ] px 단위로 고정
    >

      {/* 로고와 텍스트 부분 */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => nav('/')}>
          <img src={LogoImage} alt="Logo" className="h-10" />
          <span className="text-white text-2xl font-bold">PicShare</span>
      </div>

      <nav className="flex items-center gap-10 text-white">
        <a href="#소개" className="hover:text-gray-400">
          소개
        </a>
        <a href="#자주묻는질문" className="hover:text-gray-400">
          자주묻는 질문
        </a>
        <a href="#문의" className="hover:text-gray-400">
          문의
        </a>
        
        {/* [ 수정/작성자:YSM ] */}
        {/* <a
          href="/login"
          className="border border-white rounded-full px-4 py-2 hover:bg-white hover:text-black transition"
        >
          로그인
        </a> */}
        {authToken ? (
          <button
            onClick={logout}
            className="border border-white rounded-full px-4 py-2 hover:bg-white hover:text-black transition"
          >
            로그아웃
          </button>
        ) : (
          <a
            href="/login"
            className="border border-white rounded-full px-4 py-2 hover:bg-white hover:text-black transition"
          >
            로그인
          </a>
        )}
      </nav>
    </header>
  );
}
