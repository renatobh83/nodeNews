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

  try {
    const browser = await puppeteer.launch({
       args:chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath("./bin"),
      headless: 'new',
      ignoreHTTPSErrors: true,
    });
    

    const page = await browser.newPage();
    await page.goto(url)
    const screenshot = await page.screenshot({ fullPage: true });
    
    await browser.close();
    res.setHeader('Content-Type', 'image/png');
    res.send(screenshot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocorreu um erro ao capturar o screenshot.' });
  }
});

app.listen(process.env.PORT, () => {
  console.log('Servidor iniciado. Acesse http://localhost:3000');
});
