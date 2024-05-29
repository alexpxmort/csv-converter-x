require('dotenv').config()
const express = require('express');
const fileUpload = require('express-fileupload');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 7000;

app.use(fileUpload());

app.use(express.static('public'));


// Função para converter uma planilha para CSV com delimitador personalizado
function convertXlsxToCsv(inputFilePath, outputFilePath, delimiter = ',') {
    const workbook = xlsx.readFile(inputFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const json = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    const csvContent = json.map(row => row.join(delimiter)).join('\n');

    fs.writeFileSync(outputFilePath, csvContent, { encoding: 'utf8' });
}

// Rota para upload e conversão do arquivo
app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('Nenhum arquivo foi enviado.');
    }

    const xlsxFile = req.files.xlsxFile;
    const delimiter = req.body.delimiter || ',';

    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }

    const inputFilePath = path.join(uploadsDir, xlsxFile.name);
    const outputFilePath = path.join(uploadsDir, path.parse(xlsxFile.name).name + '.csv');

    xlsxFile.mv(inputFilePath, (err) => {
        if (err) {
            return res.status(500).send(err);
        }

        try {
            convertXlsxToCsv(inputFilePath, outputFilePath, delimiter);
            res.download(outputFilePath, (err) => {
                if (err) {
                    return res.status(500).send(err);
                }

                // Clean up files after download
                fs.unlinkSync(inputFilePath);
                fs.unlinkSync(outputFilePath);
            });
        } catch (err) {
            res.status(500).send('Erro ao converter o arquivo.');
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
