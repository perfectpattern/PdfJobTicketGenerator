const express = require('express');
const app = express();
const jsdom = require("jsdom");
const bodyParser = require('body-parser');
const bodyParserError = require('bodyparser-json-error');
const main = require('./createHTML/main');
const testGangJobEventJSON = require('./createHTML/resources/gangJobEventJSON').get()
const puppeteer = require('puppeteer')
const logo = require('./createHTML/resources/logo').get();
const version = require('./version');

//init jQuery globally
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
global.$ = jQuery = require('jquery')(window);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParserError.beautify({ status: 500, res: { msg: 'You sent a bad JSON !' } }));// Beautify body parser json syntax error

function getPDFoption() {
    var today = new Date();
    var date = tools.twoDigits(today.getDate()) + "." + tools.twoDigits((today.getMonth() + 1)) + '.' + today.getFullYear();
    var time = tools.twoDigits(today.getHours()) + ":" + tools.twoDigits(today.getMinutes());
    var dateTime = date + ', ' + time + ' Uhr';

    var pdfOptions = {
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<p></p>',
        //footerTemplate : '<img class="logo" src="' + logo + '" style="width: 100px; margin-left: 20px; alt="logo"/><span class="pageNumber" style="width: 300px; text-align: right; font-size: 9px;"></span>',//`<span style="font-size:10px;" class="pageNumber"></span>/<span class="totalPages"></span>`,
        footerTemplate: `
      <table style="font-size:9px; width: 100%; margin: 0 23px 0 23px; border-collapse: collapse; table-layout: fixed ;">
        <tr>
          <td style="width: 43%;">
            <img class="logo" src="` + logo + `" style="width: 100px; alt="logo"/>
          </td>
          <td style="width: 23%; text-align:middle;">
            <span>erstellt </span>
            <span>` + dateTime + `</span>
          </td>
          <td style="width: 33%; text-align:right;">
            <span>Seite </span>
            <span class="pageNumber"></span>
            <span> von </span>
            <span class="totalPages"></span>
          </td>
        </tr>
      </table>`,
        format: "A4",
        margin: {
            top: "0.7cm",
            right: "0.7cm",
            bottom: "1.5cm",
            left: "0.7cm"
        }
    }

    return pdfOptions;
}

//second try
function createPDF(html, res) {

    async function printPDF(html) {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: '/usr/bin/chromium-browser'
        });
        const page = await browser.newPage();
        await page.setContent(html)
        const pdf = await page.pdf(getPDFoption());

        await browser.close();
        return pdf
    }

    printPDF(html).then(pdf => {
        res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
        res.send(pdf)
    })
}

app.get('/test/html', (req, res) => {
    main.getHTML(testGangJobEventJSON)
        .then(function (html) {
            res.send(html);
        })
});

app.get('/test/pdf', (req, res) => {
    main.getHTML(testGangJobEventJSON)
        .then(function (html) {
            createPDF(html, res);
        })
});


app.post('/', (req, res) => {
    main.getHTML(req.body)
        .then(function (html) {
            createPDF(html, res);
        })
});

app.get('/version', (req, res) => {
    res.json(version.getVersion());
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});