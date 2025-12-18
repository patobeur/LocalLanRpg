document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('settingsForm');
    const masterVolume = document.getElementById('masterVolume');
    const masterVolumeVal = document.getElementById('masterVolumeVal');
    const quality = document.getElementById('quality');
    const saveMsg = document.getElementById('saveMessage');

    // Load Settings
    const savedSettings = JSON.parse(localStorage.getItem('littlemoba_settings') || '{}');

    if (savedSettings.masterVolume !== undefined) {
        masterVolume.value = savedSettings.masterVolume;
        masterVolumeVal.textContent = `${savedSettings.masterVolume}%`;
    }

    if (savedSettings.quality) {
        quality.value = savedSettings.quality;
    }

    // Live Update Labels
    masterVolume.addEventListener('input', (e) => {
        masterVolumeVal.textContent = `${e.target.value}%`;
    });

    // Save
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const settings = {
            masterVolume: masterVolume.value,
            quality: quality.value
        };

        localStorage.setItem('littlemoba_settings', JSON.stringify(settings));

        // Show feedback
        saveMsg.style.opacity = '1';
        setTimeout(() => {
            saveMsg.style.opacity = '0';
        }, 2000);
    });
});
