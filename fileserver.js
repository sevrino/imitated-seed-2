const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load Config
const jsonFile = fs.readFileSync("./config.json", "utf-8");
const config = JSON.parse(jsonFile);

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/upload') {
    let data = '';

    // 요청 데이터 수신
    req.on('data', (chunk) => {
      data += chunk;
    });

    // 요청 데이터 수신 완료
    req.on('end', () => {
      try {
        const postData = JSON.parse(data);

        // 필요한 데이터 추출
        const { filename, document, mimetype, file } = postData;

        // 업로드 시간을 해싱하여 이미지 파일명 생성
        const uploadTime = new Date().getTime().toString();
        const hash = crypto.createHash('md5').update(uploadTime).digest('hex');
        const name = `${hash}`; // 이미지 확장자에 따라 수정

        // base64로 인코딩된 파일 데이터를 디코딩하여 "image" 폴더에 저장
        const decodedFile = Buffer.from(file, 'base64');
        const fileExtension = path.extname(filename);
        const imageFolderPath = path.join(__dirname, 'image');
        const filePath = path.join(imageFolderPath, name);

        var imgPath = config.image_host + imageFolderPath;

        // "image" 폴더가 없으면 생성
        if (!fs.existsSync(imageFolderPath)) {
          fs.mkdirSync(imageFolderPath);
        }

        fs.writeFileSync(filePath, decodedFile);

        // 클라이언트에 응답 보내기
        const responseData = { 'file': config.image_host + ':' + config.image_port + '/' + name, 'status': 'success' };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(responseData));
        res.end();
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 'status': 'fail' }));
      }
    });
  } else if (req.method === 'GET') {
    // 이미지 파일명을 받아서 해당 이미지를 제공
    const imagePath = path.join(__dirname, 'image', req.url.slice(1));
    if (fs.existsSync(imagePath)) {
      const image = fs.readFileSync(imagePath);
      res.writeHead(200, 
        { 'Content-Type': 'image/jpeg' }); // 이미지 확장자에 따라 Content-Type을 수정하세요.
      res.end(image);
    } else {
      // 이미지가 존재하지 않는 경우
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Image not found');
    }
  } else {
    // 지원하지 않는 경로 또는 메서드로의 요청에 대한 처리
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const port = config.image_port; // 사용할 포트 번호
server.listen(port, () => {
  console.log(`서버가 ${port} 포트에서 실행 중입니다.`);
});
