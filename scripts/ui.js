// scripts/ui.js - Enhanced UI interactions with validation

/**
 * Navigate to a specific screen
 */
function goToScreen(n) {
    // Remove active class from all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Activate target screen
    const target = document.getElementById(`screen-${n}`);
    if (!target) {
        console.error(`Screen ${n} not found`);
        return;
    }
    
    target.classList.add('active');
    
    // Update subtitle if element exists
    const subtitles = {
        1: "Let's start with some basic questions",
        2: "Select where you feel symptoms",
        3: "Rate your symptoms",
        4: "Your Results"
    };
    
    const sub = document.getElementById('header-subtitle');
    if (sub) sub.textContent = subtitles[n] || "";
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Select gender with visual feedback
 */
function selectGender(gender) {
    appState.gender = gender;
    
    document.querySelectorAll('.gender-buttons button').forEach(b => {
        b.classList.toggle('active', b.textContent.trim() === gender);
    });
}

/**
 * Answer severity/duration question
 */
function answerSevere(value, clickedButton) {
    appState.severe = value;
    
    const buttons = document.querySelectorAll('.question-buttons button');
    buttons.forEach(b => b.classList.remove('active'));
    
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
}

/**
 * Validate and proceed to body map
 */
function goToBodyMap() {
    const ageInput = document.getElementById("age");
    const age = ageInput ? ageInput.value : null;
    
    // Validation
    const errors = [];
    
    if (!age || age < 1 || age > 120) {
        errors.push("Please enter a valid age (1-120)");
    }
    
    if (!appState.gender) {
        errors.push("Please select your sex");
    }
    
    if (!appState.severe) {
        errors.push("Please indicate symptom duration");
    }
    
    // Show errors if any
    if (errors.length > 0) {
        showAlert(errors.join('\n'), 'warning');
        return;
    }
    
    // Save age and proceed
    appState.age = parseInt(age);
    goToScreen(2);
}

/**
 * Select body region with enhanced feedback
 */
function selectRegion(region, el) {
    appState.selectedRegion = region;
    
    // Clear all selections
    document.querySelectorAll('.region').forEach(r => r.classList.remove('selected'));
    document.querySelectorAll('.region-btn').forEach(b => b.classList.remove('selected'));
    
    // Add selection to clicked element
    if (el) {
        if (el.classList.contains('region')) {
            el.classList.add('selected');
        } else if (el.classList.contains('region-btn')) {
            el.classList.add('selected');
        } else {
            const parent = el.closest('.region') || el.closest('.region-btn');
            if (parent) parent.classList.add('selected');
        }
    }
    
    // Update selection display
    const disp = document.getElementById('selected-region');
    if (disp) {
        disp.textContent = `Selected: ${region}`;
        disp.style.color = 'var(--primary)';
    }
    
    // Enable and update "Add Symptoms" button
    const addBtn = document.getElementById('add-symptoms-btn');
    if (addBtn) {
        addBtn.disabled = false;
        addBtn.textContent = `Add Symptoms for ${region} →`;
        addBtn.classList.add('btn-primary');
        addBtn.classList.remove('btn-secondary');
    }
}

/**
 * Navigate to symptoms rating screen
 */
function goToSymptoms() {
    if (!appState.selectedRegion) {
        showAlert('Please select a body region first', 'warning');
        return;
    }
    
    if (typeof renderSymptomChecklist === 'function') {
        renderSymptomChecklist(appState.selectedRegion);
    } else {
        console.error('renderSymptomChecklist function not found');
    }
    
    goToScreen(3);
}

/**
 * Save symptoms for current region and return to body map
 */
function saveRegionAndReturn() {
    // Count how many symptoms were rated for this region
    const region = appState.selectedRegion;
    if (region && appState.symptomSeverities[region]) {
        const ratedCount = Object.values(appState.symptomSeverities[region])
            .filter(severity => severity > 0).length;
        
        if (ratedCount === 0) {
            if (!confirm('You haven\'t rated any symptoms for this region. Continue anyway?')) {
                return;
            }
        }
    }
    
    // Return to body map
    goToScreen(2);
    
    // Update button state
    const addBtn = document.getElementById('add-symptoms-btn');
    if (addBtn) {
        addBtn.classList.remove('btn-primary');
        addBtn.classList.add('btn-secondary');
        addBtn.textContent = "Add/Edit Symptoms for Region";
    }
    
    // Clear region selection visually (but keep in state)
    document.querySelectorAll('.region, .region-btn').forEach(el => {
        el.classList.remove('selected');
    });
}

/**
 * Trigger diagnosis with validation and loading state
 */
async function triggerDiagnosis() {
    // Validate we have symptoms
    let hasSymptoms = false;
    let totalSymptoms = 0;
    
    for (let reg in appState.symptomSeverities) {
        for (let sym in appState.symptomSeverities[reg]) {
            if (appState.symptomSeverities[reg][sym] > 0) {
                hasSymptoms = true;
                totalSymptoms++;
            }
        }
    }
    
    if (!hasSymptoms) {
        showAlert('Please add at least one symptom before getting a diagnosis.', 'warning');
        return;
    }
    
    // Show confirmation for very few symptoms
    if (totalSymptoms < 3) {
        const proceed = confirm(
            `You've only rated ${totalSymptoms} symptom${totalSymptoms > 1 ? 's' : ''}. ` +
            'For better accuracy, consider adding more symptoms. Continue anyway?'
        );
        if (!proceed) return;
    }
    
    // Show loading state
    const btn = document.getElementById('diagnose-btn');
    const oldText = btn ? btn.innerHTML : '';
    
    if (btn) {
        btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Analyzing...';
        btn.disabled = true;
    }
    
    try {
        // Get predictions from API
        const predictions = await getDiagnosis(appState);
        
        // Display results
        if (typeof displayResults === "function") {
            displayResults(predictions);
        } else {
            console.error('displayResults function not found');
        }
        
        // Update summary
        if (typeof updateSummaryDisplay === "function") {
            updateSummaryDisplay();
        } else {
            console.error('updateSummaryDisplay function not found');
        }
        
        // Navigate to results
        goToScreen(4);
        
    } catch (error) {
        console.error('Diagnosis error:', error);
        showAlert(
            'An error occurred while analyzing your symptoms. Please try again or contact support.',
            'error'
        );
    } finally {
        // Restore button state
        if (btn) {
            btn.innerHTML = oldText;
            btn.disabled = false;
        }
    }
}

/**
 * Restart the application
 */
function restart() {
    if (confirm('This will clear all your data and start over. Continue?')) {
        // Clear state
        appState.age = null;
        appState.gender = null;
        appState.severe = null;
        appState.selectedRegion = null;
        appState.symptomSeverities = {};
        
        // Reload page
        window.location.reload();
    }
}

/**
 * Show alert/notification
 */
function showAlert(message, type = 'info') {
    // Check if we're in a browser that supports alerts
    if (typeof alert === 'function') {
        alert(message);
    }
    
    // Log to console as well
    console[type === 'error' ? 'error' : 'log'](message);
}

/**
 * Initialize tooltips and UI enhancements
 */
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to body regions
    document.querySelectorAll('.region').forEach(region => {
        region.addEventListener('mouseenter', () => {
            const label = region.querySelector('.region-label');
            if (label) {
                label.style.opacity = '1';
            }
        });
        
        region.addEventListener('mouseleave', () => {
            const label = region.querySelector('.region-label');
            if (label && !region.classList.contains('selected')) {
                label.style.opacity = '0';
            }
        });
    });
    
    // Add enter key support for age input
    const ageInput = document.getElementById('age');
    if (ageInput) {
        ageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                goToBodyMap();
            }
        });
    }
    
    console.log('UI Controller initialized');
});