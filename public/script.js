document.getElementById('qrForm').addEventListener('submit', function (e) {
  const input = document.querySelector('.textInput').value.trim();

  if (!input) {
    e.preventDefault();
    alert("Please enter a valid URL or text.");
  }
});
