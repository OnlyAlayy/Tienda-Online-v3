document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector(".wrapper");
  const loginLink = document.querySelector(".login-link");
  const registerLink = document.querySelector(".register-link");
  const btnPopup = document.querySelector(".btnLogin-popup");
  const iconClose = document.querySelector(".icon-close");

  // Check que wrapper existe para no fallar si no está en la página
  if (!wrapper) {
    console.error('No se encontró .wrapper');
    return;
  }

  // Mostrar registro si ?show=register está en URL
  const params = new URLSearchParams(window.location.search);
  if (params.get('show') === 'register') {
    wrapper.classList.add('active');
  }

  // Eventos para flip
  registerLink?.addEventListener("click", e => {
    e.preventDefault();
    wrapper.classList.add("active");
  });

  loginLink?.addEventListener("click", e => {
    e.preventDefault();
    wrapper.classList.remove("active");
  });

  // Botón popup (si lo usas)
  if (btnPopup) {
    btnPopup.addEventListener('click', () => {
      wrapper.classList.add('active-popup');
    });
  }
  if (iconClose) {
    iconClose.addEventListener('click', () => {
      wrapper.classList.remove('active-popup');
    });
  }

  // Video fondo
  const videos = ['videos/olas5.mp4'];
  let index = 0;
  const videoElement = document.querySelector('.background-video');
  function playNextVideo() {
    if (!videoElement) return;
    videoElement.src = videos[index];
    videoElement.play().catch(() => {});
    index = (index + 1) % videos.length;
  }
  if (videoElement) {
    videoElement.addEventListener('ended', playNextVideo);
    playNextVideo();
  }

  // Inputs con efecto "filled"
  document.querySelectorAll('.input-box input').forEach(input => {
    input.addEventListener('input', () => {
      if (input.value.trim() !== '') {
        input.classList.add('filled');
      } else {
        input.classList.remove('filled');
      }
    });
    if (input.value.trim() !== '') {
      input.classList.add('filled');
    }
  });

});
