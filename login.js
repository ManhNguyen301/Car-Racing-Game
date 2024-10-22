document.getElementById('nickname-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    // Get nickname
    const nickname = document.getElementById('nickname').value;

    // Optionally, save nickname to localStorage if needed for the game
    localStorage.setItem('nickname', nickname);

    // Redirect to the game interface
    window.location.href = 'final.html';
});
