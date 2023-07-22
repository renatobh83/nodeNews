const express = require('express');
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium-min");
const app = express();

async function measureResponseTime(fn){
  const startTime = Date.now();

  try {
    const response = await fn
    

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log('Tempo de resposta:', responseTime, 'ms');
    console.log('Dados da resposta:', response);
  } catch (error) {
    console.error('Ocorreu um erro:', error);
  }
}




app.get('/screenshot', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'URL não fornecida.' });
  }
 let noticias= []
 const urls = ['https://valor.globo.com/ultimas-noticias/',
              'https://www1.folha.uol.com.br/ultimas-noticias/',
              'https://www.estadao.com.br/ultimas/'];
  try {


    
    const browser = await puppeteer.launch({
       args:[ "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote", '--window-size=1920,1080',
      ],defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(
         "https://github.com/Sparticuz/chromium/releases/download/v114.0.0/chromium-v114.0.0-pack.tar"
      ),
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
      await page.setRequestInterception(true);

    page.on('request', (request) => {
if (request.resourceType() === 'script')
         request.abort();
      else
         request.continue();
      // if(request.url().startsWith(url)) {
      //   request.continue()
      // } else {
      //   request.abort() 
      // }
    }); 
    await page.goto(url, { waitUntil: 'networkidle2' });
    const screenshot = await page.screenshot({ fullPage: true });
    
    await browser.close();
    res.setHeader('Content-Type', 'image/png');
    res.send(screenshot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro na aplicacao" });
  }
});

app.listen(process.env.PORT, () => {
  console.log('Servidor iniciado. Acesse http://localhost:3000');
});
