#!/usr/bin/env node
const express = require('express');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const app = express();
const directory = process.argv[2];
const port = process.argv[3] || 3000;

if (!directory) {
    console.error('Error: Directory path is required');
    process.exit(1);
}

const directoryPath = path.resolve(directory);

function isLightColor(color) {
    let r, g, b;
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
    } else if (color.startsWith('rgb')) {
        [r, g, b] = color.match(/\d+/g).map(Number);
    } else {
        // Default to dark for unknown formats
        return false;
    }

    // Calculate luminance
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const threshold = 128; // Adjust this value as needed

    return luminance > threshold;
}

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
                    .divone { box-sizing: border-box; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; }
                    .divtwo { display: flex; justify-content: center; align-items: center; height: 215px; width: 215px; background-color: #e5e7eb; border-radius: 8px;  }
                    .dark-background { background-color: #000000; }
                    .light-background { background-color: #e5e7eb; }
                    p { color: #000000; font-size: 16px; margin-top: 8px; }
                    img { max-height: 90%; max-width: 90%; }
                </style>
            </head>
            <body>`;

        for (const filename of filenames) {
            try {
                const filePath = path.join(directoryPath, filename);
                const fileExt = path.extname(filename).toLocaleLowerCase();
                let backgroundColorClass = 'light-background';

                if (fileExt === '.svg') {
                    const svgContent = fs.readFileSync(filePath, 'utf8');
                    const $ = cheerio.load(svgContent);
                    const fill = $('path').attr('fill');

                    if (fill && isLightColor(fill)) {
                        backgroundColorClass = 'dark-background';
                    }
                }

                html += `<div class="divone"><div class="divtwo ${backgroundColorClass}"><img src="/file/${encodeURIComponent(filename)}" alt="${filename}"/></div><p>${filename}</p></div>`;
            } catch (err) {
                console.error(err);
            }
        }

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