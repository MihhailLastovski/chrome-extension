const darkModeToggle = document.getElementById('darkModeToggle');
    const styleLink = document.getElementById('styleLink');

    darkModeToggle.addEventListener('change', function() {
      if (this.checked) {
        styleLink.href = 'style/darkstyle.css'; // Path to your dark mode CSS file
      } else {
        styleLink.href = 'style/styles.css'; // Path to your regular CSS file
      }
    });