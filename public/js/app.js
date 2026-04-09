// Client-side JavaScript for Kabwata Shopping Complex

document.addEventListener('DOMContentLoaded', function() {
    // Handle upload form submission with loading indicator
    const uploadForm = document.getElementById('uploadForm');
    const submitBtn = document.getElementById('submitBtn');
    const loadingDiv = document.getElementById('loading');

    if (uploadForm) {
        uploadForm.addEventListener('submit', function() {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            if (loadingDiv) {
                loadingDiv.classList.remove('hidden');
            }
        });
    }

    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 5000);
    });

    // File input validation
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Check file size (10MB limit)
                if (file.size > 10 * 1024 * 1024) {
                    alert('File size must be less than 10MB');
                    e.target.value = '';
                    return;
                }

                // Check file type
                if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                    alert('Only images and PDF files are allowed');
                    e.target.value = '';
                    return;
                }
            }
        });
    }

    // Amount input validation
    const amountInput = document.querySelector('input[name="amount"]');
    if (amountInput) {
        amountInput.addEventListener('input', function(e) {
            const value = parseFloat(e.target.value);
            if (value < 0) {
                e.target.value = '0';
            }
        });
    }
});