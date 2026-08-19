// Example starter JavaScript for disabling form submissions if there are invalid fields
console.log("SCRIPT JS LOADED");
const forms = document.querySelectorAll('.needs-validation');

console.log("FORMS FOUND:", forms.length);

Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {

        console.log("SUBMIT EVENT FIRED");

        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();

            console.log("FORM INVALID");
        } else {
            console.log("FORM VALID");
        }

        form.classList.add('was-validated');
    });
});