// import axios from 'axios';
import error from 'eslint-plugin-react/lib/util/error.js';
import axios from 'axios';

const apiKey = import.meta.env.VITE_STABILITY_API_KEY;
const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL;

// let requestCount = 0;
//
// const logRequest = () => {
//   requestCount++;
//   console.log(`API 요청 수: ${requestCount}`);
// };
//
// axios.interceptors.request.use((config) => {
//   logRequest();
//   return config;
// });

const handleSubmit = async ({ text, style, numImages}) => {
  const engineId = 'stable-diffusion-v1-6';
  const apiHost = 'https://api.stability.ai';

  // 에러 처리
  if (!apiKey) throw new Error('Missing Stability API key.');

  const requestBody = {
    text_prompts: [{ text }],
    cfg_scale: 7,
    steps: 30,
    samples: numImages || 1, // 이미지 개수 설정
    style_preset: style || 'photographic',
  };

  const response = await axios(
    {
      url: `${apiHost}/v1/generation/${engineId}/text-to-image`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      data: JSON.stringify(requestBody),
    }
  );

  console.log(response);

  if (response.status !== 200) {
    throw new Error(`Non-200 response: ${await response.text()}`);
  }

  return response.data.artifacts.map((artifact) => `data:image/png;base64,${artifact.base64}`);
};

// 첫 번째로 실행되는 함수이자, 외부로 노출하는 유일한 services
export const requestAIImageGeneration = async ({ text, style, numImages}) => {
  try {
    const translatedText = await translatePrompt(text);
    if (translatedText) {
      console.log(translatedText);
      return await handleSubmit({ text: translatedText, style: style, numImages: numImages });
    }
  } catch (error) {
    console.error("이미지 생성 요청 오류: " , error);
  }
}

export const translatePrompt = async (prompt) => {
  try {
    const response = await axios({
      url: `${API_SERVER_URL}/image-ai/translate`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({prompt}),
    })

    console.log('translatePrompt result', response);
    return response.data.translations[0].text;
  } catch (error) {
    console.log("번역 API 요청 오류:", error);
    return null;
  }
}
const apiHost = 'https://api.stability.ai';

// Stability AI 호출 함수
export const callStabilityAI = async (translatedText) => {
  const formData = new FormData();
  formData.append('init_image', attachedFile);
  formData.append('init_image_mode', 'IMAGE_STRENGTH');
  formData.append('image_strength', 0.35);
  formData.append('text_prompts[0][text]', translatedText);
  formData.append('cfg_scale', 7);
  formData.append('samples', 1);
  formData.append('steps', 30);

  try {
    const response = await fetch(`${apiHost}/v1/generation/stable-diffusion-v1-6/image-to-image`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error(`Non-200 response: ${await response.text()}`);

    const responseJSON = await response.json();
    const generatedImages = responseJSON.artifacts.map((image) => `data:image/png;base64,${image.base64}`);

    return generatedImages;
  } catch (error) {
    console.error("Stability AI 요청 오류:", error);
  }
};

export default requestAIImageGeneration;
