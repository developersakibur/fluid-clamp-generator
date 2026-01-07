   const minVWEl = { value: 320 }; // Hidden default
    const maxVWEl = { value: 1440 }; // Hidden default
    const minSizeEl = document.getElementById("minSize");
    const maxSizeEl = document.getElementById("maxSize");
    const resultEl = document.getElementById("result");
    const radioButtons = document.querySelectorAll('input[name="propertyType"]');

    let currentClampValue = "";

    function getMobileSize(desktopPx, propertyType) {
      if (desktopPx < 10) {
        return Math.max(desktopPx - 1, 1);
      }
      
      const selectedRadio = document.querySelector(`input[name="propertyType"][value="${propertyType}"]`);
      
      if (!selectedRadio || !selectedRadio.dataset.minVp) {
        return Math.round(desktopPx * 0.75);
      }
      
      const minVP = parseInt(selectedRadio.dataset.minVp);
      const maxVP = parseInt(selectedRadio.dataset.maxVp);
      const minValue = parseInt(selectedRadio.dataset.minValue);
      const maxValue = parseInt(selectedRadio.dataset.maxValue);
      const smallSubtract = parseInt(selectedRadio.dataset.smallSubtract);
      
      if (desktopPx < minVP) {
        return Math.max(desktopPx - smallSubtract, 1);
      }
      
      const ratio = (desktopPx - minVP) / (maxVP - minVP);
      const mobileSize = minValue + ratio * (maxValue - minValue);
      
      return Math.round(mobileSize);
    }

    function updateMinSize() {
      const maxPx = +maxSizeEl.value;
      const selectedProperty = document.querySelector('input[name="propertyType"]:checked').value;

      if (maxPx && maxPx.toString().length >= 2) {
        const calculatedMin = getMobileSize(maxPx, selectedProperty);
        minSizeEl.value = calculatedMin;
        updateClamp();
      }
    }

    function updateClamp() {
      const minVW = +minVWEl.value;
      const maxVW = +maxVWEl.value;
      const minPx = +minSizeEl.value;
      const maxPx = +maxSizeEl.value;

      resultEl.classList.remove("copied");

      if (!minVW || !maxVW || !minPx || !maxPx) {
        resultEl.textContent = "Enter all values";
        currentClampValue = "";
        return;
      }

      if (minVW >= maxVW || minPx >= maxPx) {
        resultEl.innerHTML = '<span class="error-message">Min must be < Max</span>';
        currentClampValue = "";
        return;
      }

      const slope = (maxPx - minPx) / (maxVW - minVW);
      const vwVal = (slope * 100).toFixed(2);
      const interceptPx = minPx - slope * minVW;

      const minRem = (minPx / 16).toFixed(2);
      const maxRem = (maxPx / 16).toFixed(2);
      const interceptRem = (interceptPx / 16).toFixed(2);

      currentClampValue = `clamp(${minRem}rem, ${interceptRem}rem + ${vwVal}vw, ${maxRem}rem)`;
      resultEl.textContent = currentClampValue;
    }

    function copyClamp() {
      if (!currentClampValue) return;

      navigator.clipboard.writeText(currentClampValue)
        .then(() => {
          resultEl.classList.add("copied");
          setTimeout(() => {
            resultEl.classList.remove("copied");
          }, 1500);
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
        });
    }

    maxSizeEl.addEventListener("input", updateMinSize);
    minSizeEl.addEventListener("input", updateClamp);
    radioButtons.forEach((radio) => radio.addEventListener("change", updateMinSize));
    resultEl.addEventListener("click", copyClamp);

    // Mouse wheel scroll on focused inputs
    function handleWheel(e, inputEl) {
      if (document.activeElement === inputEl) {
        e.preventDefault();
        const currentValue = parseInt(inputEl.value) || 0;
        const newValue = e.deltaY < 0 ? currentValue + 1 : currentValue - 1;
        
        // Respect min/max constraints
        const min = parseInt(inputEl.min) || -Infinity;
        const max = parseInt(inputEl.max) || Infinity;
        inputEl.value = Math.max(min, Math.min(max, newValue));
        
        // Trigger input event to update calculations
        inputEl.dispatchEvent(new Event('input'));
      }
    }

    minSizeEl.addEventListener("wheel", (e) => handleWheel(e, minSizeEl));
    maxSizeEl.addEventListener("wheel", (e) => handleWheel(e, maxSizeEl));

    // Listen for messages from background
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === "COPY_AND_CLOSE") {
        if (currentClampValue) {
          navigator.clipboard.writeText(currentClampValue).then(() => {
            window.close();
          });
        }
      }

      if (message.action === "SWITCH_RADIO") {
        const radios = Array.from(document.querySelectorAll('input[name="propertyType"]'));
        if (!radios.length) return;

        let currentIndex = radios.findIndex((r) => r.checked);
        let nextIndex = (currentIndex + 1) % radios.length;
        radios[nextIndex].checked = true;
        radios[nextIndex].dispatchEvent(new Event('change'));
      }
    });

    // Keyboard shortcuts (for when popup is focused)
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+S to switch radio
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        
        const radios = Array.from(document.querySelectorAll('input[name="propertyType"]'));
        if (!radios.length) return;

        let currentIndex = radios.findIndex((r) => r.checked);
        let nextIndex = (currentIndex + 1) % radios.length;
        radios[nextIndex].checked = true;
        radios[nextIndex].dispatchEvent(new Event('change'));
      }

      // Ctrl+Shift+X to copy and close
      if (e.ctrlKey && e.shiftKey && e.key === 'X') {
        e.preventDefault();
        if (currentClampValue) {
          navigator.clipboard.writeText(currentClampValue).then(() => {
            window.close();
          });
        }
      }
    });

    // Initial render
    updateMinSize();