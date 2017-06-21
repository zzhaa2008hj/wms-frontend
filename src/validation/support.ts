import { validationMessages, ValidationRenderer, RenderInstruction } from "aurelia-validation";

export const formValidationRenderer: ValidationRenderer = {
  render(instruction: RenderInstruction) {
    for (let { elements, result } of instruction.unrender) {
      if (result.valid) continue;
      for (let element of elements) {
        let formGroup = element.parentElement;
        let label = formGroup.querySelector(`#validation-message-${result.id}`);
        if (label) formGroup.removeChild(label);
        if (formGroup.querySelectorAll('label.error').length == 0) {
          element.classList.remove('error');
        }
      }
    }
    for (let { elements, result } of instruction.render) {
      if (result.valid) continue;
      for (let element of elements) {
        element.classList.add('error');
        const label = document.createElement('label');
        label.className = 'error';
        label.textContent = result.message;
        label.id = `validation-message-${result.id}`;
        element.parentElement.appendChild(label);
      }
    }
  }
};