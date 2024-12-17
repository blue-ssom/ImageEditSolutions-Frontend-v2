import { default as ToastUIEditor } from '@toast-ui/react-image-editor';
import 'tui-image-editor/dist/tui-image-editor.css';
import myTheme from '../ui/theme/myTheme.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Modal from '../components/ImageEditorComponent/Modal.jsx';
import Header from '../components/ImageEditorComponent/Header';

const ImageEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { imageUrl } = location.state || {}; // 전달된 이미지 URL을 받음

  const editorRef = useRef(null);

  // header state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [editorInstance, setEditorInstance] = useState(null);

  // editor 초기화
  useEffect(() => {
    if (editorRef.current) {
      setEditorInstance(editorRef.current);
    }
  }, [editorRef.current]);

  return (
    <div className="flex flex-col bg-black h-screen w-screen">
      <div className="flex">
        <img
          src="/images/logo.png"
          alt="logo"
          className="h-11 m-5 cursor-pointer"
          onClick={() => navigate('/')}
        />
        <Header
          setIsSaveModalOpen={setIsSaveModalOpen}
          setIsLoadModalOpen={setIsLoadModalOpen}
          editor={editorInstance}
        />
      </div>
      <div className="flex flex-grow p-4 space-x-4">
        {imageUrl &&
          <ToastUIEditor
            ref={editorRef}
            includeUI={{
              loadImage: {
                path: imageUrl ?? '',
                name: 'Uploaded Image',
              },
              theme: myTheme, // 커스텀 테마 적용
              uiSize: {
                width: '100%',
                height: '100%',
              },
              menuBarPosition: 'left',
            }}
            cssMaxHeight={500}
            cssMaxWidth={700}
            selectionStyle={{
              cornerSize: 20,
              rotatingPointOffset: 70,
            }}
          />
        }
      </div>

      {
        isSaveModalOpen &&
        <Modal
          text="저장하기"
          onClose={() => setIsSaveModalOpen(false)} // 모달 닫기
        />
      }

      {
        isLoadModalOpen &&
        <Modal
          text="가져오기"
          onClose={() => setIsLoadModalOpen(false)} // 모달 닫기
        />
      }
    </div>
  );
};

export default ImageEditPage;
