const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 启用 CORS
app.use(cors());

// 静态文件服务
app.use(express.static('.'));

// 获取所有图片列表的 API
app.get('/api/images', (req, res) => {
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const images = {};

    seasons.forEach(season => {
        const seasonPath = path.join(__dirname, 'images', season);
        images[season] = [];

        try {
            if (fs.existsSync(seasonPath)) {
                const files = fs.readdirSync(seasonPath);
                images[season] = files
                    .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
                    .map(file => ({
                        path: `images/${season}/${file}`,
                        name: file.split('.')[0],
                        type: getTypeFromFileName(file)
                    }));
            }
        } catch (error) {
            console.error(`Error reading ${season} directory:`, error);
        }
    });

    res.json(images);
});

// 从文件名获取类型
function getTypeFromFileName(fileName) {
    const types = [];
    const lowerFileName = fileName.toLowerCase();

    if (lowerFileName.includes('shirt') || lowerFileName.includes('top') ||
        lowerFileName.includes('tshirt') || lowerFileName.includes('t-shirt') ||
        lowerFileName.includes('blouse') || lowerFileName.includes('sweater') ||
        lowerFileName.includes('jacket') || lowerFileName.includes('coat')) {
        types.push('shirt');
    }

    if (lowerFileName.includes('pant') || lowerFileName.includes('trouser') ||
        lowerFileName.includes('jean') || lowerFileName.includes('bottom') ||
        (lowerFileName.includes('short') && !lowerFileName.includes('shorts-sleeve'))) {
        types.push('pant');
    }

    if (lowerFileName.includes('skirt') ||
        (lowerFileName.includes('dress') && !lowerFileName.includes('dresser'))) {
        types.push('skirt');
    }

    if (lowerFileName.includes('sock') || lowerFileName.includes('stocking') ||
        lowerFileName.includes('legging')) {
        types.push('sock');
    }

    if (lowerFileName.includes('shoe') || lowerFileName.includes('boot') ||
        lowerFileName.includes('sneaker') || lowerFileName.includes('sandal') ||
        lowerFileName.includes('footwear') || lowerFileName.includes('slipper')) {
        types.push('shoe');
    }

    if (lowerFileName.includes('accessory') || lowerFileName.includes('accessories') ||
        lowerFileName.includes('hat') || lowerFileName.includes('bag') ||
        lowerFileName.includes('scarf') || lowerFileName.includes('jewelry') ||
        lowerFileName.includes('watch') || lowerFileName.includes('belt') ||
        lowerFileName.includes('purse') || lowerFileName.includes('wallet') ||
        lowerFileName.includes('glasses') || lowerFileName.includes('sunglasses')) {
        types.push('accessory');
    }

    if (lowerFileName.includes('ootd') || lowerFileName.includes('outfit') ||
        lowerFileName.includes('look') || lowerFileName.includes('style') ||
        lowerFileName.includes('set') || lowerFileName.includes('coordination') ||
        lowerFileName.includes('combination')) {
        types.push('ootd');
    }

    return types;
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 