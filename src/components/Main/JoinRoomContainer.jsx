import { useRoom } from '../../hooks/useRoom.jsx';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

const JoinRoomContainer = (props) => {
  const { createRoom, joinRoom, roomId } = useRoom();
  const nav = useNavigate();

  const baseRoomUrl = 'http://localhost:5173/image-edit/room/';

  const handleCreateRoom = async () => {
    // const newRoomId = await createRoom();
    //
    // console.log(newRoomId);
    // if(!newRoomId) nav('/login');
    //
    // if (newRoomId) {
    //   roomIdRef.current = newRoomId;
    //   setIsOpenCreateRoom(true);
    // }
  };

  const handleClickCopyLink = () => {
    navigator.clipboard
      .writeText(baseRoomUrl + roomId.current)
      .then(() => {
        alert("링크가 복사되었습니다! 🎉");
      })
      .catch((err) => {
        console.error("복사 실패:", err);
        alert("복사에 실패했습니다. 😢");
      });
  }
  return (
    <div className="w-80 mx-auto mt-20">
      <div className="flex flex-col items-center justify-center">
        <label className="text-[14px] text-[#B8B8B8] mb-5">이미지를 함께 작업해보세요</label>
        <div
          className={`w-80 h-10 rounded-lg flex items-center justify-between pr-2 box-border bg-[#313131] overflow-hidden`}
        >
                <textarea
                          className="leading-[2.5rem] h-10 flex-1 bg-[#313131] outline-0 text-[10px] pl-2"
                          placeholder="방 번호를 입력하세요" />
          <button
            className="text-[#1B1D20] text-[8px] bg-[#9DD6E9] p-2 rounded-[6px] flex flex-row items-center  h-5 box-border"
            onClick={() => nav('image-edit/room/' + createRoomIdPorps.value)}
          >
            공유하기
            <img src="/images/home/create-room.svg" alt="create-room.svg" className="w-[8px] ml-1" />
          </button>
        </div>
      </div>
      <button onClick={() => nav('image-edit/room/' + roomId)}
              className="mx-auto mt-8 border-[#9DD6E9] rounded-3xl py-1 border-2 flex flex-row items-center px-6 text-[15px] text-[#9DD6E9]">
        <img src="/images/home/make-room.svg" alt="make-room" className="w-6 mr-1" />
        방 들어가기
      </button>
    </div>
  )
}

export default JoinRoomContainer;