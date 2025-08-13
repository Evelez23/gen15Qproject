/**
 * Validación del formulario de casos clínicos
 */

export function initFormValidation() {
  const form = document.getElementById('case-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (validateForm(form)) {
      submitForm(form);
    }
  });
}

function validateForm(form) {
  let isValid = true;
  
  // Validar nombre
  const nameInput = form.querySelector('[name="patient-name"]');
  if (!nameInput.value.trim()) {
    showError(nameInput, 'Por favor ingrese un nombre');
    isValid = false;
  }

  // Validar edad
  const ageInput = form.querySelector('[name="patient-age"]');
  if (!ageInput.value || isNaN(ageInput.value)) {
    showError(ageInput, 'Por favor ingrese una edad válida');
    isValid = false;
  }

  // Validar síntomas
  const symptomsInput = form.querySelector('[name="symptoms"]');
  if (!symptomsInput.value.trim()) {
    showError(symptomsInput, 'Por favor describa los síntomas');
    isValid = false;
  }

  return isValid;
}

function showError(input, message) {
  const errorDiv = input.nextElementSibling;
  if (errorDiv && errorDiv.classList.contains('error-message')) {
    errorDiv.textContent = message;
  } else {
    const div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = message;
    input.insertAdjacentElement('afterend', div);
  }
  
  input.classList.add('error');
  input.focus();
}

async function submitForm(form) {
  const formData = new FormData(form);
  const submitBtn = form.querySelector('[type="submit"]');
  
  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    // Aquí iría la lógica real de envío
    const response = await mockSubmit(formData);
    
    if (response.success) {
      showSuccess('Caso registrado exitosamente');
      form.reset();
    } else {
      throw new Error(response.message || 'Error al enviar el formulario');
    }
  } catch (error) {
    showError(form, error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar Caso';
  }
}

// Función de ejemplo - reemplazar con envío real
async function mockSubmit(formData) {
  console.log('Datos a enviar:', Object.fromEntries(formData));
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1500);
  });
}

function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  
  const form = document.getElementById('case-form');
  form.prepend(successDiv);
  
  setTimeout(() => {
    successDiv.remove();
  }, 5000);
}

// Inicialización automática
if (document.getElementById('case-form')) {
  initFormValidation();
}