#!/usr/bin/env node
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const directory = process.argv[2];
const port = process.argv[3] || 3000;

if (!directory) {
    console.error('Error: Directory path is required');
    process.exit(1);
}

const directoryPath = path.resolve(directory);

app.get('/', (req, res) => {
    fs.readdir(directoryPath, (err, filenames) => {
        if (err) {
            res.status(500).send('Error reading directory');
            return;
        }

        let html = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; display: flex; align-content: flex-start; justify-content: center; align-items: flex-start; flex-direction: row; flex-wrap: wrap; gap: 10px; }
                    div { box-sizing: border-box; border: 1px solid #e5e7eb; background-color: #1f2937; height: 200px; width: 200px; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; border-radius: 8px; padding: 10px; }
                    p { color: #FFFFFF; font-weight: bold; font-size: 24px; margin-top: 0; }
                    img { max-height: 120px; max-width: 100%; }
                </style>
            </head>
            <body>`;
                
        filenames.forEach(filename => {
            html += `<div><p>${filename}</p><img src="/file/${encodeURIComponent(filename)}" alt="${filename}"/></div>`;
        });

        html += '</body></html>';
        res.send(html);
    });
});

app.get('/file/:name', (req, res) => {
    const filePath = path.join(directoryPath, req.params.name);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    
    });
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});