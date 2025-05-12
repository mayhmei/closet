const fs = require('fs');
const path = require('path');

const seasons = ['spring', 'summer', 'autumn', 'winter'];
const result = {};

seasons.forEach(season => {
    const dir = path.join(__dirname, 'images', season);
    if (fs.existsSync(dir)) {
        result[season] = fs.readdirSync(dir)
            .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
            .map(file => `images/${season}/${file}`);
    } else {
        result[season] = [];
    }
});

fs.writeFileSync(
    path.join(__dirname, 'images.json'),
    JSON.stringify(result, null, 2),
    'utf-8'
);

console.log('图片列表已生成 images.json'); 