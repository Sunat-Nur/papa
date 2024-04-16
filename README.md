 PortFolio 프로잭트 소개
 ---------------

바로가기 http://papays.uz:3003/resto


개발인원민 기간
---------------

1 인개발 (4 주소요)


목적
------

구현 영상
---------------

. 회원가입 로그인

. 포스트 페이지 생셍

. 댓글과 투표기능

. swiper 모듈을 이용한 터치 슬라이드

. 무한스크롤

. 유저페이지

. 이미지 업로드



적용 기술
---------------




JavaScript
---------------

. object data에 타입을 체크하기 위해 interface 사용


Nodejs
---------------

. Express

. 상태관리 context api


Ejs
---------------

. Ejs6 문법



외부
---------------

. CSS / HTML

. bcryptjs

. class-validator

. class-transformer

. dayjs

. 토근 생성을 위한 jsonwbtoken

. 환경변수 dotenv

. 밴엔드 cookie-parser

. 데이터를 가져오기 위한 swr

. 무한 스크롤 기능 useSWRinfinitie

. axios 이용하여 데이터 전송

. 재사용성 middleware

. 캐시 된 데이터를 갱신 mutate

. Multer 파일업로드



AWS
---------------

. EC2 배포

. 환경에 따른 env-cmd


MongoDB
---------------
. moongose atlas



에러 사항
---------------

. 클라이언트와 서버 응답 주소가 달라 Cors 모듈 사용하여 해결

. 유저 생성할 때 쿠키 저장을 위해 withCredentials true 기입

. 백엔드에서 red.body를 받을 때 body-parser 라이브러리가 필요했음

. 미들웨어 user.ts에서 pending 이 걸려 진행이 되지 않았다

. 이미지가 로드되지 않아 next.config.js 파일에 이미지 도메인에 이미지 경로를 추가하였다. 그래도 나오지 않아서 찾아보니 SERVER.TS에 public파일안에 image를 브라우저로 접근했을 때 제공 할 수 있게 해주기 위해 app.use(express.static(“public”)을 적어서 해결

. 메인 페이지에 접속했을 때 이미지 버그가 발생. 로그를 보니 imageurl에 경로가 아닌 urn이 나옴. topsub 핸들러에 있는 imageurl 부분을 postgres operator 를 사용하여 경로와 이름을 합쳐주어 해결


















