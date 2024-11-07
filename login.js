document.addEventListener('DOMContentLoaded', function() {
    const nicknameForm = document.getElementById('nickname-form');
    const nicknameInput = document.getElementById('nickname');
    const errorMessage = document.getElementById('error-message');

    // Check if user is already logged in
    const savedNickname = localStorage.getItem('nickname');
    if (savedNickname) {
        window.location.href = 'final.html';
    }

    nicknameForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        // Get nickname
        const nickname = nicknameInput.value.trim();

        // Validate nickname
        if (nickname.length < 3 || nickname.length > 15) {
            errorMessage.textContent = 'Nickname must be between 3 and 15 characters.';
            return;
        }

        // Save nickname to localStorage
        localStorage.setItem('nickname', nickname);

        // Redirect to the game interface
        window.location.href = 'final.html';
    });
});