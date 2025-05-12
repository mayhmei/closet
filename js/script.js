document.addEventListener('DOMContentLoaded', function () {
    // 获取导航和视图元素
    const seasonTabs = document.querySelectorAll('.season-tabs li');
    const typeTabs = document.querySelectorAll('.type-tabs li');
    const seasonView = document.getElementById('season-view');
    const typeView = document.getElementById('type-view');

    // 获取所有季节部分和类型部分
    const seasonSections = document.querySelectorAll('.season-section');
    const typeSections = document.querySelectorAll('.type-section');

    // 获取所有筛选标签
    const filterTags = document.querySelectorAll('.filter-tag');

    let allImages = {};

    // 读取 images.json
    fetch('images.json')
        .then(res => {
            console.log('Fetch response status:', res.status);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            // 尝试克隆响应以防body被消耗
            const resClone = res.clone();
            return res.json().catch(jsonError => {
                console.error('Error parsing JSON:', jsonError);
                // 如果JSON解析失败，尝试读取文本内容以供调试
                return resClone.text().then(text => {
                    console.error('Response text was:', text);
                    throw new Error('Failed to parse JSON');
                });
            });
        })
        .then(data => {
            console.log('Successfully parsed JSON data:', data);
            try {
                allImages = data;
                console.log('Assigned data to allImages.');
                initOutfits();
                console.log('initOutfits completed successfully.');
            } catch (initError) {
                console.error('Error executing initOutfits:', initError);
                // 将内部错误再次抛出，以便外层 catch 能捕获并显示UI错误
                throw initError;
            }
        })
        .catch(err => {
            // 这个 catch 会捕获 fetch 失败、json 解析失败、或 initOutfits 失败
            console.error('Final catch block triggered:', err);
            document.querySelectorAll('.outfit-grid').forEach(grid => {
                grid.innerHTML = `
                    <div class="info-card error">
                        <div class="info-content">
                            <h3>加载失败</h3>
                            <p>无法读取 images.json，请确认文件存在并刷新页面。</p>
                        </div>
                    </div>
                `;
            });
        });

    // 创建上传卡片 (占位实现)
    function createUploadCard(season) {
        const card = document.createElement('div');
        card.className = 'outfit-card upload-card'; // 添加 upload-card 类以区分
        card.innerHTML = `
            <div class="upload-icon">
                <i class="fas fa-plus"></i>
            </div>
            <div class="outfit-info">
                <h3>添加${getSeasonLabel(season)}穿搭</h3>
            </div>
        `;
        // 这里可以添加点击事件来触发文件上传
        card.addEventListener('click', () => {
            alert(`触发 ${season} 文件上传`);
            // 实际应用中应打开文件选择对话框
        });
        return card;
    }

    // 从季节文件夹加载图片
    function loadSeasonImages(season) {
        // 获取季节部分的网格
        const grid = document.querySelector(`#${season} .outfit-grid`);
        if (!grid) return;

        // 清除所有卡片
        grid.innerHTML = '';

        // 获取该季节的图片
        const images = allImages[season] || [];

        // 检查是否有图片
        if (images.length === 0) {
            // 没有图片，显示空状态信息
            const emptyInfo = document.createElement('div');
            emptyInfo.className = 'info-card';
            emptyInfo.innerHTML = `
                <div class="info-content">
                    <h3>暂无${getSeasonLabel(season)}穿搭</h3>
                    <p>可以通过下方上传按钮添加穿搭照片</p>
                </div>
            `;
            grid.appendChild(emptyInfo);
        } else {
            // 有图片，为每张图片创建卡片
            images.forEach(imagePath => {
                const fileName = imagePath.split('/').pop();
                const types = getTypesFromFileName(fileName);
                const card = createImageCard(imagePath, season, types);
                grid.appendChild(card);
            });
        }

        // 添加文件上传卡片
        const uploadCard = createUploadCard(season);
        grid.appendChild(uploadCard);
    }

    // 从类型加载图片
    function loadTypeImages(type) {
        // 获取类型部分的网格
        const grid = document.querySelector(`#${type} .outfit-grid`);
        if (!grid) return;

        // 清除所有卡片
        grid.innerHTML = '';

        // 获取所有季节中包含此类型的图片
        let typeImages = [];
        Object.entries(allImages).forEach(([season, images]) => {
            images.forEach(imagePath => {
                const fileName = imagePath.split('/').pop();
                if (getTypesFromFileName(fileName).includes(type)) {
                    typeImages.push({ path: imagePath, season });
                }
            });
        });

        // 检查是否有图片
        if (typeImages.length === 0) {
            // 没有图片，显示空状态信息
            const emptyInfo = document.createElement('div');
            emptyInfo.className = 'info-card';
            emptyInfo.innerHTML = `
                <div class="info-content">
                    <h3>暂无${getTypeLabel(type)}</h3>
                    <p>请在任意季节文件夹中添加包含${getTypeLabel(type)}关键词的图片</p>
                </div>
            `;
            grid.appendChild(emptyInfo);
        } else {
            // 有图片，为每张图片创建卡片
            typeImages.forEach(image => {
                const card = createImageCard(image.path, image.season, [type]);
                grid.appendChild(card);
            });
        }

        // 添加使用说明卡片
        const infoCard = document.createElement('div');
        infoCard.className = 'info-card';
        infoCard.innerHTML = `
            <div class="info-content">
                <h3>如何添加${getTypeLabel(type)}</h3>
                <p>将包含"${getTypeKeywords(type)}"等关键词的图片放入任意季节文件夹</p>
                <p>系统将自动识别图片类型</p>
            </div>
        `;
        grid.appendChild(infoCard);
    }

    // 为图片创建卡片
    function createImageCard(imagePath, season = null, types = []) {
        const fileName = imagePath.split('/').pop().split('.')[0];

        // 处理文件名，忽略后面的标号（如：spring_shirt_1变成spring_shirt）
        let displayName = fileName;
        // 匹配格式如 xxx_xxx_1, xxx_xxx_23 等，移除末尾的下划线加数字
        if (/^(.+)_\d+$/.test(fileName)) {
            displayName = fileName.replace(/_\d+$/, '');
        }

        const title = displayName.replace(/[-_]/g, ' ');
        const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);

        const card = document.createElement('div');
        card.className = 'outfit-card';
        card.setAttribute('data-id', uniqueId);

        // 设置类型数据属性
        if (types && types.length > 0) {
            card.setAttribute('data-types', types.join(','));
        }

        // 构建卡片内容
        card.innerHTML = `
            <div class="outfit-image">
                <img src="${imagePath}" alt="${title}">
            </div>
            <div class="outfit-info">
                <h3>${title}</h3>
                <div class="outfit-tags">
                    ${season ? `<span class="season-tag">${getSeasonLabel(season)}</span>` : ''}
                    ${types.map(t => `<span class="type-tag">${getTypeLabel(t)}</span>`).join('')}
                </div>
            </div>
        `;

        return card;
    }

    // 新增：加载所有图片到"全部类型"视图
    function loadAllImages() {
        const grid = document.querySelector('#all-types .outfit-grid');
        if (!grid) return;
        grid.innerHTML = ''; // 清空网格

        let allItems = [];
        Object.entries(allImages).forEach(([season, images]) => {
            images.forEach(imagePath => {
                const fileName = imagePath.split('/').pop();
                const types = getTypesFromFileName(fileName);
                allItems.push({ path: imagePath, season: season, types: types });
            });
        });

        if (allItems.length === 0) {
            // 显示空状态信息
            const emptyInfo = document.createElement('div');
            emptyInfo.className = 'info-card';
            emptyInfo.innerHTML = `
                <div class="info-content">
                    <h3>暂无任何衣物</h3>
                    <p>请先在季节视图中添加图片</p>
                </div>
            `;
            grid.appendChild(emptyInfo);
        } else {
            allItems.forEach(item => {
                const card = createImageCard(item.path, item.season, item.types);
                grid.appendChild(card);
            });
            addCardClickEvents(grid.querySelectorAll('.outfit-card:not(.upload-card):not(.info-card)')); // 重新绑定事件
        }
    }

    // 初始化：加载所有图片
    function initOutfits() {
        // 加载所有季节的图片
        ['spring', 'summer', 'autumn', 'winter'].forEach(season => {
            loadSeasonImages(season);
        });

        // 加载所有类型的图片
        ['shirt', 'pant', 'skirt', 'sock', 'shoe', 'accessory', 'ootd'].forEach(type => {
            loadTypeImages(type);
        });

        // 添加卡片点击事件
        addCardClickEvents(document.querySelectorAll('.outfit-card:not(.upload-card):not(.info-card)'));
    }

    // 添加穿搭卡片点击事件
    function addCardClickEvents(cards) {
        cards.forEach(card => {
            card.addEventListener('click', function () {
                // 获取图片和标题
                const img = this.querySelector('.outfit-image img')?.src;
                const title = this.querySelector('.outfit-info h3')?.textContent;
                if (img && title) {
                    console.log(`查看穿搭: ${title}, 图片: ${img}`);
                }
            });
        });
    }

    // 类型选项卡点击事件
    typeTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const type = this.getAttribute('data-type');

            // 激活类型视图容器
            typeView.classList.add('active');
            seasonView.classList.remove('active');

            // 更新激活的类型选项卡
            typeTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // 先隐藏所有类型区域 (包括新增的 #all-types)
            document.querySelectorAll('#type-view .type-section').forEach(section => section.classList.remove('active'));

            if (type === 'all') {
                // 显示 "全部衣物" 区域并加载
                const allTypesSection = document.getElementById('all-types');
                if (allTypesSection) {
                    allTypesSection.classList.add('active');
                    loadAllImages(); // 调用新函数
                }
            } else {
                // 显示特定类型区域
                const specificTypeSection = document.getElementById(type);
                if (specificTypeSection) {
                    specificTypeSection.classList.add('active');
                    // 注意：这里可能需要调用 loadTypeImages(type) 来确保内容加载，
                    // 但如果 initOutfits 已经加载过，可能不需要重复加载，取决于具体逻辑。
                    // 为确保一致性，可以调用 loadTypeImages(type) 或者依赖 initOutfits 的初始加载。
                    // 暂时保持现状，因为 initOutfits 已经加载了所有类型。
                }
            }
        });
    });

    // 季节选项卡点击事件
    seasonTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // 切换到季节视图
            seasonView.classList.add('active');
            typeView.classList.remove('active');

            // 激活当前季节选项卡
            seasonTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // 重置类型选项卡
            typeTabs.forEach(t => {
                if (t.getAttribute('data-type') === 'all') {
                    t.classList.add('active');
                } else {
                    t.classList.remove('active');
                }
            });

            // 显示对应季节部分
            const season = this.getAttribute('data-season');
            seasonSections.forEach(section => {
                if (section.id === season) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });

            // 加载该季节的图片
            loadSeasonImages(season);
        });
    });

    // 筛选标签点击事件
    filterTags.forEach(tag => {
        tag.addEventListener('click', function () {
            // 获取当前激活的部分和筛选器组
            const activeSection = this.closest('.season-section, .type-section');
            const filterGroup = this.closest('.filter-tags');

            // 更新激活状态
            filterGroup.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // 获取筛选值
            const filterValue = this.getAttribute('data-filter');

            // 获取卡片容器
            const grid = activeSection.querySelector('.outfit-grid');
            const cards = grid.querySelectorAll('.outfit-card:not(.upload-card):not(.info-card)');

            // 如果在季节视图中筛选类型
            if (activeSection.classList.contains('season-section')) {
                // 筛选类型
                cards.forEach(card => {
                    const types = card.getAttribute('data-types')?.split(',') || [];
                    if (filterValue === 'all' || types.includes(filterValue)) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }
            // 如果在类型视图中筛选季节
            else if (activeSection.classList.contains('type-section')) {
                const type = activeSection.id;
                cards.forEach(card => {
                    const seasonTag = card.querySelector('.season-tag');
                    const cardSeason = seasonTag ?
                        Object.keys(seasonMap).find(key => seasonMap[key] === seasonTag.textContent) : null;

                    if (filterValue === 'all' || cardSeason === filterValue) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }
        });
    });

    // 获取季节标签文字
    const seasonMap = {
        'spring': '春季',
        'summer': '夏季',
        'autumn': '秋季',
        'winter': '冬季'
    };

    function getSeasonLabel(season) {
        return seasonMap[season] || season;
    }

    // 获取类型标签文字
    function getTypeLabel(typeValue) {
        const typeMap = {
            'shirt': '上衣',
            'pant': '裤子',
            'skirt': '裙子',
            'sock': '袜子',
            'shoe': '鞋子',
            'accessory': '配饰',
            'ootd': 'OOTD'
        };
        return typeMap[typeValue] || typeValue;
    }

    // 获取类型的关键词提示
    function getTypeKeywords(type) {
        switch (type) {
            case 'shirt': return 'shirt, top, blouse, sweater, jacket';
            case 'pant': return 'pant, trouser, jean, shorts';
            case 'skirt': return 'skirt, dress';
            case 'sock': return 'sock, stocking, legging';
            case 'shoe': return 'shoe, boot, sneaker, sandal';
            case 'accessory': return 'accessory, hat, bag, scarf, jewelry';
            case 'ootd': return 'ootd, outfit, look, style, set, coordination';
            default: return type;
        }
    }

    function getTypesFromFileName(fileName) {
        const types = [];
        const lowerFileName = fileName.toLowerCase();
        if (lowerFileName.includes('shirt') || lowerFileName.includes('top') || lowerFileName.includes('tshirt') ||
            lowerFileName.includes('t-shirt') || lowerFileName.includes('blouse') || lowerFileName.includes('sweater') ||
            lowerFileName.includes('jacket') || lowerFileName.includes('coat')) {
            types.push('shirt');
        }
        if (lowerFileName.includes('pant') || lowerFileName.includes('trouser') || lowerFileName.includes('jean') ||
            lowerFileName.includes('bottom') || (lowerFileName.includes('short') && !lowerFileName.includes('shorts-sleeve'))) {
            types.push('pant');
        }
        if (lowerFileName.includes('skirt') || (lowerFileName.includes('dress') && !lowerFileName.includes('dresser'))) {
            types.push('skirt');
        }
        if (lowerFileName.includes('sock') || lowerFileName.includes('stocking') || lowerFileName.includes('legging')) {
            types.push('sock');
        }
        if (lowerFileName.includes('shoe') || lowerFileName.includes('boot') || lowerFileName.includes('sneaker') ||
            lowerFileName.includes('sandal') || lowerFileName.includes('footwear') || lowerFileName.includes('slipper')) {
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
});

console.log('测试页面加载情况');

// 防止未定义报错
function resetAllCache() {
    // 这里可以根据需要添加清缓存逻辑，目前为空实现
}
