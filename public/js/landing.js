document.addEventListener('DOMContentLoaded', () => {
    const sliderContainer = document.getElementById('heroSlider');
    const images = ['media/img/hero1.png', 'media/img/hero2.png', 'media/img/hero3.png'];
    let currentSlideIndex = 0;
    const slideDuration = 5000; // 5 seconds per slide

    // Preload images and create slide elements
    images.forEach((src, index) => {
        const slide = document.createElement('div');
        slide.classList.add('hero-slide');
        slide.style.backgroundImage = `url('${src}')`;

        // Assign a random Ken Burns animation class initially
        // Ideally we reset/change this on every show to keep it fresh, 
        // or just static assignment is fine for now. Let's do static for simplicity 
        // but rotate them: 1, 2, 3
        const animationClass = `kenBurns-${(index % 3) + 1}`;
        slide.classList.add(animationClass);

        if (index === 0) {
            slide.classList.add('active');
        }

        sliderContainer.appendChild(slide);
    });

    const slides = document.querySelectorAll('.hero-slide');

    setInterval(() => {
        // Remove active class from current
        slides[currentSlideIndex].classList.remove('active');

        // Calculate next index
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;

        // Add active class to next
        const nextSlide = slides[currentSlideIndex];
        nextSlide.classList.add('active');

        // Optional: Randomize the animation on the new slide so it feels different each time?
        // Since we defined infinite animation in CSS, it just keeps running. 
        // If we want to "restart" the pan/zoom from 0% when it appears, we'd need to reset the animation.
        // But the "active" opacity transition handles the crossfade nicely. 
        // A restart might look jerky. Let's stick to the continuous infinite animation for smoothness.

    }, slideDuration);
});
