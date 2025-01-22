import { useRoom } from '../../hooks/useRoom.jsx';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const MakeRoomContainer = () => {
  const { createRoom, joinRoom, roomId } = useRoom();
  const nav = useNavigate();

  const [isOpenJoinRoom, setIsOpenJoinRoom] = useState(false);
  const [roomNumber, setRoomNumber] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // [ 추가/작성자:YSM ] 모달 열림 여부
  const [modalMessage, setModalMessage] = useState(""); // [ 추가/작성자:YSM ] 모달에 표시될 메시지

  const handleCreateRoom = async () => {
    setIsOpenJoinRoom(false);

    const authToken = localStorage.getItem('accessToken');

    // [ 수정/작성자:YSM ]
    if(!authToken) {
      setModalMessage("로그인이 필요합니다.");
      setIsModalOpen(true);
      return;
    }

    const newRoomId = await createRoom();

  };

  const handleClickCopyLink = () => {
    navigator.clipboard
      .writeText(roomId)
      .then(() => {
        alert("방 번호가 복사되었습니다! 🎉");
      })
      .catch((err) => {
        console.error("복사 실패:", err);
        alert("복사에 실패했습니다. 😢");
      });
  }
  const handleJoinRoom = () => {
    if (roomId) {
      nav(`/image-edit/room/${roomId}`);
      return;
    }

    if (isOpenJoinRoom) {
      if (roomNumber) {
        joinRoom(roomNumber);
        nav(`/image-edit/room/${roomNumber}`);
      } else {
        alert("방 ID를 입력해주세요.");
      }
    } else {
      setIsOpenJoinRoom(true);
    }
  }

  // [ 추가/작성자:YSM ] 모달 닫기 함수
  const closeModal = () => {
    setIsModalOpen(false);
    nav('/login');
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

  return (
    <div className="w-100 mx-auto mt-20">
      <div className="flex flex-col items-center justify-center">
        {/* [ 수정/작성자:YSM ] label 글자 스타일 수정 */}
        <label className="text-xl font-bold text-white mb-4">이미지를 함께 작업해보세요</label>
        <div
          className={`w-80 h-14 rounded-lg flex items-center justify-between pr-2 box-border bg-gray-800 overflow-hidden`}
        >
          {
            isOpenJoinRoom ?
              <div
                className={`w-80 h-14 rounded-lg flex items-center justify-between box-border bg-gray-800 overflow-hidden`}
              >
                  <textarea
                    className="leading-[3.5rem] bg-gray-800 h-14 flex-1 outline-0 text-[10px] pl-2"
                    placeholder="방 번호를 입력하세요"
                    onChange={(e) => setRoomNumber(e.target.value)}
                  />
                <button
                  className="text-[#1B1D20] text-[8px] bg-[#9DD6E9] p-2 rounded-[6px] flex flex-row items-center box-border"
                  onClick={handleJoinRoom}
                >
                  <img src="/images/home/create-room.svg" alt="create-room.svg" className="w-[13px] h-[13px]" />
                </button>
              </div> :
              <>
                <div className="text-[12px] ml-3">{roomId}</div>
                <button
                  onClick={handleClickCopyLink}
                  className="text-[#1B1D20] text-[8px] bg-[#9DD6E9] p-2 rounded-[6px] flex flex-row items-center  h-5 box-border">
                  공유하기
                  <img src="/images/home/create-room.svg" alt="create-room.svg" className="w-[8px] ml-1" />
                </button>
              </>
          }
        </div>
      </div>
      <div className="flex flex-row w-80 m-center">
        <button onClick={handleCreateRoom}
                className="mx-auto mt-8 border-[#9DD6E9] rounded-3xl py-1 border-2 flex flex-row items-center px-6 text-[15px] text-[#9DD6E9]">
          <img src="/images/home/make-room.svg" alt="make-room" className="w-6 mr-1" />
          방 만들기
        </button>
        <button onClick={handleJoinRoom}
                className="mx-auto mt-8 border-[#9DD6E9] rounded-3xl py-1 border-2 flex flex-row items-center px-6 text-[15px] text-[#9DD6E9]">
          <img src="/images/home/make-room.svg" alt="make-room" className="w-6 mr-1" />
          방 입장하기
        </button>
         {/* [ 추가/작성자:YSM ] 모달 렌더링 */}
         {isModalOpen && <Modal message={modalMessage} onClose={closeModal} />}
      </div>
    </div>
  )
}

export default MakeRoomContainer;