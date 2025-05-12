// 这是一个可以在未来实现的扩展功能
// 用于添加新穿搭的脚本

document.addEventListener('DOMContentLoaded', function () {
    // 此功能尚未实现，这里提供了基本框架

    // 创建添加按钮
    function createAddButton() {
        const addButton = document.createElement('button');
        addButton.className = 'add-outfit-button';
        addButton.innerHTML = '<i class="fas fa-plus"></i> 添加新穿搭';
        addButton.addEventListener('click', showAddOutfitForm);

        // 将按钮添加到每个季节部分和类型部分
        document.querySelectorAll('.season-section, .type-section').forEach(section => {
            const clone = addButton.cloneNode(true);
            clone.addEventListener('click', function () {
                // 如果是在类型视图中添加，需要先获取当前活跃的类型
                if (section.classList.contains('type-section')) {
                    showAddOutfitForm(section.id);
                } else {
                    showAddOutfitForm();
                }
            });
            section.insertBefore(clone, section.querySelector('.outfit-grid'));
        });
    }

    // 显示添加穿搭表单
    function showAddOutfitForm(preSelectedType = '') {
        // 获取当前活跃的季节部分
        const activeSection = document.querySelector('.season-section.active');
        const season = activeSection ? activeSection.id : 'spring'; // 默认春季

        // 可选的类型列表
        const typeOptions = [
            { value: 'shirts', label: '上衣' },
            { value: 'pants', label: '裤子' },
            { value: 'dresses', label: '连衣裙' },
            { value: 'shoes', label: '鞋子' },
            { value: 'accessories', label: '配饰' }
        ];

        // 创建类型选择HTML
        const typeOptionsHTML = typeOptions.map(type =>
            `<div class="type-option">
                <input type="checkbox" id="type-${type.value}" name="outfitTypes" value="${type.value}" ${preSelectedType === type.value ? 'checked' : ''}>
                <label for="type-${type.value}">${type.label}</label>
            </div>`
        ).join('');

        // 创建表单HTML
        const formHTML = `
            <div class="add-outfit-form">
                <h3>添加新穿搭</h3>
                <form id="outfitForm">
                    <div class="form-group">
                        <label for="outfitTitle">标题</label>
                        <input type="text" id="outfitTitle" required>
                    </div>
                    <div class="form-group">
                        <label for="outfitDescription">描述</label>
                        <textarea id="outfitDescription" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="outfitImage">图片</label>
                        <input type="file" id="outfitImage" accept="image/*" required>
                    </div>
                    <div class="form-group">
                        <label>季节</label>
                        <div class="season-options">
                            <div class="season-option">
                                <input type="radio" id="season-spring" name="outfitSeason" value="spring" ${season === 'spring' ? 'checked' : ''}>
                                <label for="season-spring">春季</label>
                            </div>
                            <div class="season-option">
                                <input type="radio" id="season-summer" name="outfitSeason" value="summer" ${season === 'summer' ? 'checked' : ''}>
                                <label for="season-summer">夏季</label>
                            </div>
                            <div class="season-option">
                                <input type="radio" id="season-autumn" name="outfitSeason" value="autumn" ${season === 'autumn' ? 'checked' : ''}>
                                <label for="season-autumn">秋季</label>
                            </div>
                            <div class="season-option">
                                <input type="radio" id="season-winter" name="outfitSeason" value="winter" ${season === 'winter' ? 'checked' : ''}>
                                <label for="season-winter">冬季</label>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>类型</label>
                        <div class="type-options">
                            ${typeOptionsHTML}
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="outfitTags">标签（用逗号分隔）</label>
                        <input type="text" id="outfitTags">
                    </div>
                    <div class="form-actions">
                        <button type="button" id="cancelButton">取消</button>
                        <button type="submit">保存</button>
                    </div>
                </form>
            </div>
        `;

        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = formHTML;
        document.body.appendChild(modal);

        // 设置取消按钮事件
        document.getElementById('cancelButton').addEventListener('click', function () {
            document.body.removeChild(modal);
        });

        // 设置表单提交事件
        document.getElementById('outfitForm').addEventListener('submit', function (e) {
            e.preventDefault();

            // 获取表单数据
            const title = document.getElementById('outfitTitle').value;
            const description = document.getElementById('outfitDescription').value;
            const imageFile = document.getElementById('outfitImage').files[0];
            const tags = document.getElementById('outfitTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

            // 获取选择的季节
            const seasonRadios = document.getElementsByName('outfitSeason');
            let selectedSeason;
            for (const radio of seasonRadios) {
                if (radio.checked) {
                    selectedSeason = radio.value;
                    break;
                }
            }

            // 获取选择的类型
            const typeCheckboxes = document.getElementsByName('outfitTypes');
            const selectedTypes = [];
            for (const checkbox of typeCheckboxes) {
                if (checkbox.checked) {
                    selectedTypes.push(checkbox.value);
                }
            }

            // 至少需要选择一个类型
            if (selectedTypes.length === 0) {
                alert('请至少选择一个衣物类型');
                return;
            }

            // 处理图片（这里仅模拟，实际需要使用FileReader读取图片）
            const imageSrc = URL.createObjectURL(imageFile);

            // 添加穿搭
            if (typeof window.addNewOutfit === 'function') {
                // 使用主脚本的函数
                window.addNewOutfit(selectedSeason, title, description, imageSrc, tags, selectedTypes);
            } else {
                // 使用本地函数
                addNewOutfit(selectedSeason, title, description, imageSrc, tags, selectedTypes);
            }

            // 关闭模态框
            document.body.removeChild(modal);
        });
    }

    // 添加新穿搭到页面
    function addNewOutfit(season, title, description, imageSrc, tags, types) {
        // 获取对应季节的grid
        const seasonGrid = document.querySelector(`#${season} .outfit-grid`);
        if (!seasonGrid) return;

        // 创建穿搭卡片HTML
        const outfitHTML = `
            <div class="outfit-card" data-types="${types.join(',')}">
                <div class="outfit-image">
                    <img src="${imageSrc}" alt="${title}">
                </div>
                <div class="outfit-info">
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <div class="outfit-tags">
                        ${tags.map(tag => `<span>${tag}</span>`).join('')}
                        ${types.map(type => {
            const typeLabel = getTypeLabel(type);
            return `<span class="type-tag">${typeLabel}</span>`;
        }).join('')}
                    </div>
                </div>
            </div>
        `;

        // 创建DOM元素
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = outfitHTML.trim();
        const outfitCard = tempDiv.firstChild;

        // 添加到网格中
        seasonGrid.appendChild(outfitCard);

        // 保存到本地存储
        saveOutfit(season, {
            title,
            description,
            imageSrc,
            tags,
            types
        });

        // 刷新页面以更新所有视图
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

    // 获取类型标签文字
    function getTypeLabel(typeValue) {
        const typeMap = {
            'shirts': '上衣',
            'pants': '裤子',
            'dresses': '连衣裙',
            'shoes': '鞋子',
            'accessories': '配饰'
        };
        return typeMap[typeValue] || typeValue;
    }

    // 保存穿搭到本地存储
    function saveOutfit(season, outfitData) {
        // 获取已有数据
        const outfits = getOutfitsFromLocalStorage();

        // 添加新穿搭
        if (!outfits[season]) {
            outfits[season] = [];
        }
        outfits[season].push(outfitData);

        // 保存回本地存储
        localStorage.setItem('myOutfits', JSON.stringify(outfits));
    }

    // 从本地存储获取穿搭数据
    function getOutfitsFromLocalStorage() {
        const outfits = localStorage.getItem('myOutfits');
        return outfits ? JSON.parse(outfits) : {};
    }

    // 创建添加按钮
    createAddButton();
}); 