import { RouterProvider, createBrowserRouter } from "react-router-dom";
import MainPage from "./pages/MainPage";
import ImageEditPage from "./pages/ImageEditPage";
import AiImageGenerationPage from "./pages/AiImageGenerationPage";
import Page404 from './Page404.jsx';
import Test from './pages/Test.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import { RoomProvider } from './hooks/useRoom.jsx';
import { AuthProvider } from './hooks/useAuth.jsx';
import ImageEditRoomPage from './pages/ImageEditRoomPage.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,  // "/" 경로에선 메인 페이지 렌더링
    errorElement: <Page404 />,
  },
  {
    path: "/image-edit",
    element: <ImageEditPage />,  // "/image-edit" 경로에선 이미지 편집 페이지 렌더링
  },
  {
    path: "/image-edit/room/:roomId",
    element: <ImageEditRoomPage />,  // "/image-edit" 경로에선 이미지 편집 페이지 렌더링
  },
  {
    path: "/ai-image-generation",
    element: <AiImageGenerationPage />,  // "/ai-image-generation" 경로에선 AI 이미지 생성 페이지 렌더링
  },
  {
    path: "/test",
    element: <Test />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: '/signUp',
    element: <SignUp />,
  }
]);

function App() {
  return (
    <AuthProvider>
      <RoomProvider>
        <RouterProvider router={router} />
      </RoomProvider>
    </AuthProvider>
  )
}

export default App;

