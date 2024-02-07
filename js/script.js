const button = document.querySelector('.scroll-mode');
const activeStateClassName = 'scroll-enabled';

button.addEventListener('click', () => {
    button.classList.toggle(activeStateClassName);
    button.innerHTML = button.classList.contains(activeStateClassName) ? 'Toggle On' : 'Toggle Off';
});