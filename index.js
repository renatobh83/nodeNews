const express = require('express');
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium-min");
const app = express();

app.get('/screenshot', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'URL não fornecida.' });
  }

  try {
    const browser = await puppeteer.launch({
       args:chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v114.0.0/chromium-v114.0.0-pack.tar"
      ),
      headless: 'new',
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0)
    await page.goto(url);
    const screenshot = await page.screenshot({ fullPage: true });
    res.setHeader('Content-Type', 'image/png');
    res.send(screenshot);
    await browser.close();
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocorreu um erro ao capturar o screenshot.' });
  }
});

app.listen(process.env.PORT, () => {
  console.log('Servidor iniciado. Acesse http://localhost:3000');
});