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
 for (let i = 0; i< urls.length; i ++) 
      {
   
    let url = urls[i]
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (request) => {

      if(request.url().startsWith(url)) {
        request.continue()
      } else {
        request.abort() 
      }
    }); 
    await page.goto(url, { waitUntil: 'networkidle2' });
    if(url.includes('estadao')) { 
      const noticiaJornal = await page.evaluate( () =>{
      const nodeList = document.getElementsByClassName('headline')
      const estadaoNews = [...nodeList]
      const list = estadaoNews.map(({textContent}) => ({jornal: 'Estadao', noticia: textContent}))
      return list  
    })
      noticias = noticias.concat(noticiasNumero(noticiaJornal,4))

    }
    if(url.includes('folha'))   {
      const noticiaJornal = await page.evaluate(() => {
          const nodeList = document.getElementsByClassName("c-headline__title")
          const folhaNews = [...nodeList]
          const list = folhaNews.map(({
            textContent
          }) => ({jornal: "Folha de SP", noticia: textContent}))
          return list
        })
       noticias = noticias.concat(noticiasNumero(noticiaJornal,4))
    }
    if(url.includes('valor'))   {
      const noticiaJornal = await page.evaluate(()=>{
        const nodeList = document.getElementsByClassName('feed-post-link gui-color-primary')
        const valorNews = [...nodeList]
        const list =  valorNews.map(({textContent}) => ({jornal: 'Valor', noticia: textContent}))
      return list 
    })
       noticias = noticias.concat(noticiasNumero(noticiaJornal,4))
    }
      }

  res.set('Access-Control-Allow-Origin', '*');

  if (res.req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  } else {
    res.send(noticias);
  }


  } catch (e) {

    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
    
  //   const browser = await puppeteer.launch({
  //      args:[ "--disable-setuid-sandbox",
  //     "--no-sandbox",
  //     "--single-process",
  //     "--no-zygote", '--window-size=1920,1080',
  //     ],
  //     executablePath: await chromium.executablePath(
  //        "https://github.com/Sparticuz/chromium/releases/download/v114.0.0/chromium-v114.0.0-pack.tar"
  //     ),
  //     ignoreHTTPSErrors: true,
  //   });

  //   const page = await browser.newPage();
  //     await page.setRequestInterception(true);

  //   page.on('request', (request) => {

  //     if(request.url().startsWith(url)) {
  //       request.continue()
  //     } else {
  //       request.abort() 
  //     }
  //   }); 
  //   await page.goto(url, { waitUntil: 'networkidle2' });
  //   const screenshot = await page.screenshot({ fullPage: true });
    
  //   await browser.close();
  //   res.setHeader('Content-Type', 'image/png');
  //   res.send(screenshot);
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ error: "Erro na aplicacao" });
  // }
});

app.listen(process.env.PORT, () => {
  console.log('Servidor iniciado. Acesse http://localhost:3000');
});
