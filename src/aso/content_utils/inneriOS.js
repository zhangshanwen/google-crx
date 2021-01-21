if (!document.body.classList.contains('ASOToolOn')) {
  document.addEventListener('click', (event) => {
    if (event.target.href) {
      window.top.document.location.href = event.target.href;
    }
  }, false);
}
