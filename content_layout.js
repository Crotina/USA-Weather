const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// 关闭移动端菜单当点击菜单项时
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));


const tabContainers = document.querySelectorAll('.tab');
tabContainers.forEach(container => {
    const tabButtons = container.querySelectorAll('.tablink');
    const tabContents = container.querySelectorAll('.tabcontent');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const tabName = this.dataset.tab;
            const tabContent = container.querySelector(`#${tabName}`);

            // 隐藏当前容器内所有 tabcontent
            tabContents.forEach(c => c.style.display = 'none');

            // 移除当前容器内所有 tablink 的 active
            tabButtons.forEach(b => b.classList.remove('active'));

            // 显示当前 tab
            tabContent.style.display = 'block';
            this.classList.add('active');
        });
    });

    // 自动点击第一个 tablink
    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }
});
