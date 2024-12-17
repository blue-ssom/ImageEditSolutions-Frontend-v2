
import { useRef } from 'react';
import downloadImage from '../../utils/downloadImage.js';

const   Header = ({ setIsLoadModalOpen, setIsSaveModalOpen, editor }) => {
  const fileInputRef = useRef(null);

  const handleClickFetchImage = async (e) => {
    const file = e.target.files[0];

    // 파일이 존재하지 않으면 -> 다시 파일 열기
    if (!file) throw Error('Editor로 새로운 이미지를 가져올 수 없음');

    const uploadedImage = URL.createObjectURL(file);

    if (!editor) throw Error('Editor를 가져올 수 없음');
    await editor.imageEditorInst.loadImageFromURL(uploadedImage, 'downloadProjectImage');
  }

  const handleClickDownloadImage = () => {
    const dataURL = editor.imageEditorInst.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,  //fixme 원래 10
    });

    downloadImage(dataURL);
  }

  return (
    <header className="bg-edit-gray text-white p-4 text-center flex gap-7 m-center rounded-bl-3xl px-8 h-14">
      <button className="flex h-full gap-2" onClick={() => fileInputRef.current.click()}>
        <img className="h-full object-cover" src="/images/edit/loadEditableImg.png" alt="loadEditableImg" />
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => handleClickFetchImage(e)}
        />
        <p>편집할 이미지 가져오기</p>
      </button>
      <button className="flex h-full gap-2" onClick={handleClickDownloadImage}>
        <img className="h-full object-cover" src="/images/edit/download.png" alt="download" />
        <p>이미지 다운로드</p>
      </button>
      <button className="flex h-full gap-2" onClick={() => setIsSaveModalOpen(true)}>
        <img className="h-full object-cover" src="/images/edit/save.png" alt="save" />
        <p>프로젝트 저장하기</p>
      </button>
      <button className="flex h-full gap-2" onClick={() => {setIsLoadModalOpen(true)}}>
        <img className="h-full object-cover" src="/images/edit/loadProject.png" alt="loadProject" />
        <p>프로젝트 가져오기</p>
      </button>
    </header>
  );
};

export default Header;

  