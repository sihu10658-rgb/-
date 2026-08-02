# Local JS Chatbot

간단한 로컬 모델 기반 챗봇 서버 템플릿입니다. Node.js(자바스크립트)로 작성되었고, 로컬에서 실행되는 오픈소스 모델을 사용하도록 설계되었습니다. 직접 모델 파일을 다운로드하여 로컬에서 추론할 수 있습니다.

주요 특징
- Express 기반 HTTP 서버 (/chat 엔드포인트)
- 모델 백엔드 플러그인: `llama` (llama-cpp-node, ggml 모델 파일) 또는 `xenova` (@xenova/transformers, WASM)
- 백업으로 간단한 룰 기반 에코 봇
- Dockerfile 포함

빠르게 시작하기 (권장 순서)

1) 레포 클론

   git clone https://github.com/sihu10658-rgb/-
   cd -

2) Node 의존성 설치

   npm install

3) 모델 다운로드 및 설정

 - Llama (권장): llama.cpp 기반의 ggml-quantized 모델 파일을 다운로드하여 `./models/ggml-model.bin`에 놓습니다.
   - 예: vicuna, llama2 등 커뮤니티에서 제공되는 ggml 형식 모델 (quantized) 사용
   - 환경 변수 설정: BACKEND=llama, MODEL_PATH=./models/ggml-model.bin
   - 설치 안내: `llama-cpp-node` 설치 시 빌드 도구 및 llama.cpp가 필요할 수 있습니다. 자세한 내용은 해당 패키지 문서를 참고하세요.

 - Xenova (@xenova/transformers): 순수 JS/WASM 백엔드로 작은 모델(gpt2 등)을 직접 다운로드하여 사용합니다.
   - 환경 변수: BACKEND=xenova, MODEL (예: gpt2)
   - 이 방식은 Node 환경에서 WASM/JS로 모델을 실행합니다.

4) 환경 변수 파일(.env) 예시

   BACKEND=llama
   MODEL_PATH=./models/ggml-model.bin
   PORT=3000

5) 서버 실행

   npm start

   POST http://localhost:3000/chat
   Body: { "message": "안녕" }

Docker

 - Docker 이미지를 만들려면:

   docker build -t local-js-chatbot .
   docker run -p 3000:3000 --env-file .env -v $(pwd)/models:/app/models local-js-chatbot

주의사항 및 다음 단계
- 실제 로컬 대형언어모델(LLM)을 사용하려면 강력한 CPU/GPU와 적절히 양자화된 모델 파일이 필요합니다.
- `llama-cpp-node` 또는 `@xenova/transformers` 설치/사용은 사용 환경에 따라 별도 설정(빌드 도구, WASM 런타임, GPU 드라이버 등)이 필요합니다.
- 모델 파일은 저작권 및 라이선스를 반드시 확인하세요.

원하시면 제가 직접 레포에 간단한 모델 파일 다운로드 스크립트, 예제 대화 UI(HTML), 또는 Hugging Face에서 자동으로 모델을 내려받아 변환하는 스크립트를 추가해 드리겠습니다.