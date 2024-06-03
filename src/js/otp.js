
/*
Copyright (c) 2023-2024 Jeff Oliveira
OTP Input Field
Version 2.1
https://github.com/jeffoliveira977/OTP-input-system
*/

/**
 * OTPInputHandler class manages OTP (One-Time Password) input fields and provides event handling.
 * It allows for user interaction and validation of input in OTP input fields.
 */
class OTPInputHandler {
  /**
   * Constructor for the OTPInputHandler class.
   * @param selector - The CSS selector for OTP input fields.
   */
  constructor(selector) {
    if (selector) {
      this.selector = selector;
      this.inputs = document.querySelectorAll(selector);
      if (this.inputs.length) {
        this.inputIndex = 0;
        this.alphaNumericPattern = /^[a-zA-Z0-9]$/;
        this.attachEventHandlers();
      } else {
        console.error("No elements found for the provided selector!");
      }
    }
  }

  /**
   * Attaches event listeners to elements matching the specified selector.
   *
   * @param events - A string containing one or more event types separated by commas.
   * @param selector - A selector for the target elements.
   * @param callback - A function to be called when the event is triggered.
   */

  attachEvent(events, selector, callback) {
    const eventsList = events
      .split(",")
      .map((event) => event.trim())
      .filter((event) => ["keydown", "paste"].includes(event));

    // Attach event listeners for each event.
    eventsList.forEach((event) => {
      document.addEventListener(event, (e) => {
        const target = e.target;
        if (target.closest(selector)) {
          // Call the callback function, setting `this` to the target.
          callback.call(target, e);
        }
      });
    });
  }

  /**
   * Attaches event handlers for OTP input fields.
   */
  attachEventHandlers() {
    this.attachEvent("keydown", this.selector, this.handleKeyDown);
    this.attachEvent("paste", this.selector, this.handlePaste);
  }

  /**
   * Handles keydown events for OTP input fields.
   */
  handleKeyDown = (e) => {
    const keyboard = e;

    if (keyboard.ctrlKey || keyboard.metaKey) {
      // If Ctrl or Meta are pressed, return immediately.
      return;
    } else {
      // If neither Ctrl nor Meta are pressed, prevent the default behavior.
      e.preventDefault();
    }

    // Get the index of the current input field.
    this.inputIndex = this.getInputIndex(e.target);
    switch (keyboard.key) {
      case "Backspace":
        this.inputs[this.inputIndex].value = "";
        this.moveFocusLeft();
        break;
      case "Delete":
        this.inputs[this.inputIndex].value = "";
        break;
      case "ArrowLeft":
        this.moveFocusLeft();
        break;
      case "ArrowRight":
        this.moveFocusRight();
        break;
      default:
        if (
          !this.allFilled() &&
          this.alphaNumericPattern.test(keyboard.key) // Only accept alphanumeric characters.
        ) {
          if (this.isEmptyInput(this.inputIndex)) {
            this.inputs[this.inputIndex].value = keyboard.key;
          }

          // The focus can only move if the next input field is empty.
          if (this.isEmptyInput(this.inputIndex + 1)) {
            this.moveFocusRight();
          }
        }
        break;
    }
  };

  /**
   * Handles paste events for OTP input fields.
   */
  handlePaste = (e) => {
    e.preventDefault();

    // Get the index of the current input field.
    this.inputIndex = this.getInputIndex(e.target);

    const clipboardEvent = e;

    // Extracts text data from the clipboard and processes it for input.
    const pasteData = clipboardEvent.clipboardData
      .getData("text/plain")
      .slice(0, this.inputs.length - this.inputIndex) // Limits the pasted data length to the available input fields.
      .split("");

    if (pasteData) {
      // Checks if all pasted values are alphanumeric.
      if (!pasteData.every((value) => this.alphaNumericPattern.test(value))) {
        return;
      }

      // Populates the input fields with the pasted data.
      for (var i = 0; i < pasteData.length; i++) {
        this.setInputValue(this.inputIndex + i, pasteData[i]);
      }
    }
  };

  /**
   * Updates the list of input fields based on the current selector.
   * This function should be called if new input fields are added dynamically using AJAX or other means.
   */
  updateInputs() {
    this.inputs = document.querySelectorAll(this.selector);
  }

  /**
   * Checks if the input field at the specified index is empty.
   * @param inputIndex The index of the input field to check.
   * @returns TRUE if the input field is empty, otherwise FALSE.
   */
  isEmptyInput(inputIndex) {
    return (
      inputIndex < this.inputs.length && this.inputs[inputIndex].value === ""
    );
  }

  /**
   * Sets the value of the input field at the current index.
   * @param inputIndex The index of the input field to check.
   * @param value The value to set.
   */
  setInputValue(inputIndex, value) {
    if (inputIndex >= 0 && inputIndex < this.inputs.length) {
      this.inputs[inputIndex].value = value;
    }
  }

  /**
   * Moves the focus between inputs based on the direction parameter.
   * @param direction: The direction to set the focus movement. Positive value for moving to the right, negative value for moving to the left.
   */
  moveFocus = (direction) => {
    const nextIndex = this.inputIndex + direction;

    if (nextIndex >= 0 && nextIndex < this.inputs.length) {
      this.inputs[nextIndex].focus();
    }
  };

  /**
   * Moves the focus to the left input field.
   */
  moveFocusLeft = () => {
    this.moveFocus(-1);
  };

  /**
   * Moves the focus to the right input field.
   */
  moveFocusRight = () => {
    this.moveFocus(1);
  };

  /**
   * Checks if all OTP input fields have values.
   * @returns True if all fields are filled, otherwise false.
   */
  allFilled() {
    return Array.from(this.inputs).every((input) => input.value !== "");
  }

  /**
   * Gets the index of the current input field.
   * @param input - The current input field element.
   * @returns The index of the input field in the list.
   */
  getInputIndex(input) {
    return Array.from(this.inputs).indexOf(input);
  }

  /**
   * Gets the OTP value from the input fields.
   * @returns The OTP value as a string.
   */
  getOTP() {
    const otpValues = Array.from(this.inputs).map((input) => input.value);

    return otpValues.join("");
  }

  /**
   * Registers a callback to be executed on event listener (keydown and paste).
   * @param callback - Function to be called with the current OTP value.
   */
  onInputEvent(callback) {
    if (!this.selector) {
      console.error("Selector is not defined!");
      return;
    }

    this.attachEvent("keydown, paste", this.selector, (e) => {
      callback(this.getOTP());
    });
  }
}

// Example of usage.
window.onload = () => {
  const otpInput = new OTPInputHandler(".otp-input");

  otpInput.onInputEvent((otpValue) => {
    const otpElement = document.getElementById("otpCode");
    otpElement.value = otpValue;
  });
};

