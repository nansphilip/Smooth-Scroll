/**
 * Creates a smooth scrolling effects on a desktop web page with a cubic Bezier curve
 * for speed variation. Some default settings can be overridden by passing options to
 * the constructor. More details can be found at the GitHub repository.
 * @param {Object} options
 * @link github.com/link
 */
class SmoothScroll {
    constructor(options = {}) {
        // Default settings
        this.settings = {
            // Smooth scroll settings
            durationIncreaseFactor: 1.1,
            scrollSpeedMultiplier: 12,
            scrollDuration: 700,
            limitDuration: 2500,
            enableLimitDuration: true,

            // Toggle class button settings
            toggleButtonSelector: '.scroll-mode',
            activeStateClassName: 'scroll-enabled',

            // Override default settings
            ...options
        };

        // Initialize state variables
        this.stepTime = null;
        this.currentTime = null;
        this.scrollActive = null;
        this.scrollDirection = null;
        this.growingDuration = null;
        this.cumulativeScrollQuantity = null;
        this.toggleButtonEl = document.querySelector(this.settings.toggleButtonSelector);

        // Frame rate management variables
        this.frameRate = null;
        this.frameRateValues = [];
        this.finalFrameRate = null;
        this.isTabActive = null;

        // MutationObserver to detect changes in the scroll mode button's state
        this.buttonObserver = new MutationObserver((mutations) => {
            mutations.forEach(() => {
                const isActive = this.toggleButtonEl.classList.contains(this.settings.activeStateClassName);
                if (isActive) this.scrollModeToggle('enable');
                else this.scrollModeToggle('disable');
            });
        });

        // Bind class methods to ensure 'this' context is maintained when they are called as event handlers
        this.handleTabVisibilityChange = this.handleTabVisibilityChange.bind(this);
        this.performSmoothScrolling = this.performSmoothScrolling.bind(this);
        this.preventDefaultScroll = this.preventDefaultScroll.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.scrollModeToggle = this.scrollModeToggle.bind(this);
        this.handleWheelEvent = this.handleWheelEvent.bind(this);

        // Initialize the class by setting up event listeners
        this.initialize();
    }

    /**
     * Calculates the derivative of a cubic Bezier curve at a given parameter value.
     * @param {number} t - The parameter value, between 0 and 1, indicating the position on the Bezier curve.
     * @param {number[]} p - An array of four control points for the cubic Bezier curve.
     * @returns {number} The derivative of the Bezier curve at the given parameter value.
     * @example https://docs.google.com/spreadsheets/d/1ibPaIQ9RE21qWZQgq-hNFB6nZNP1OUcuEgKzeDj_Pw0/edit?usp=sharing    
     */
    calculateBezierDerivative(t, p) {
        return 3 * Math.pow(1 - t, 2) * (p[1] - p[0])
            + 6 * (1 - t) * t * (p[2] - p[1])
            + 3 * Math.pow(t, 2) * (p[3] - p[2]);
    }

    /**
     * Calculates the speed variation based on the current time and Bezier curve.
     * @returns {number} The calculated speed variation, rounded to four decimal places.
     */
    calculateSpeedVariation() {
        let t = this.currentTime / this.growingDuration;
        const Px = [0, 1, 1, 3],
            Py = [1, 1, 0, 0];
        const derivativePx = this.calculateBezierDerivative(t, Px),
            derivativePy = this.calculateBezierDerivative(t, Py);
        return -Math.round((derivativePy / derivativePx) * 10000) / 10000;
    }

    /**
     * Executes the smooth scrolling animation based on the calculated speed variation.
     */
    performSmoothScrolling() {
        this.scrollActive = true;
        const smoothing = this.calculateSpeedVariation();
        const scrollQuantity = Math.round(smoothing * this.settings.scrollSpeedMultiplier * this.scrollDirection * 10) / 10;
        window.scrollBy({ top: scrollQuantity, left: 0, behavior: 'instant' });
        this.currentTime += this.stepTime;
        if (this.currentTime > this.growingDuration) this.scrollActive = false;
        if (this.scrollActive) window.requestAnimationFrame(this.performSmoothScrolling);
    }

    /**
     * Handles the wheel event to initiate or adjust the smooth scrolling animation.
     * @param {Event} event - The wheel event triggered by the user's scroll action.
     */
    handleWheelEvent(event) {
        if (this.scrollDirection === undefined) this.scrollDirection = event.deltaY > 0 ? 1 : -1;
        const newScrollDirection = event.deltaY > 0 ? 1 : -1;
        if (newScrollDirection === this.scrollDirection) {
            if (this.scrollActive) {
                if (this.settings.enableLimitDuration) {
                    if (this.growingDuration < this.settings.limitDuration) this.growingDuration = Math.round(this.growingDuration * this.settings.durationIncreaseFactor);
                    else this.growingDuration = this.settings.limitDuration;
                }
                else this.growingDuration = Math.round(this.growingDuration * this.settings.durationIncreaseFactor);
            } else {
                this.currentTime = 0;
                this.growingDuration = this.settings.scrollDuration;
                this.cumulativeScrollQuantity = 0;
            }
        } else {
            this.growingDuration = Math.round(this.settings.scrollDuration * this.settings.durationIncreaseFactor);
            this.cumulativeScrollQuantity = 0;
        }
        this.scrollDirection = newScrollDirection;
        this.stepTime = Math.round(1000 / this.frameRate);
        if (!this.scrollActive) window.requestAnimationFrame(this.performSmoothScrolling);
    }

    /**
     * Prevents the default scroll behavior to allow for the custom smooth scroll implementation.
     * @param {Event} event - The event object associated with the scroll action.
     */
    preventDefaultScroll(event) { event.preventDefault(); }

    /**
     * Wrapper function to handle the wheel event and pass it to the smooth scrolling handler.
     * @param {Event} event - The wheel event triggered by the user's scroll action.
     */
    handleWheel(event) { this.handleWheelEvent(event); }

    /**
     * Toggles the smooth scroll mode by adding or removing event listeners based on the action specified.
     * @param {string} action - Specifies whether to 'enable' or 'disable' the smooth scroll mode.
     */
    scrollModeToggle(action) {
        if (action === 'enable') {
            window.addEventListener('wheel', this.preventDefaultScroll, { passive: false });
            window.addEventListener('wheel', this.handleWheel);
        } else if (action === 'disable') {
            window.removeEventListener('wheel', this.preventDefaultScroll, { passive: false });
            window.removeEventListener('wheel', this.handleWheel);
        }
    }

    /**
     * Measures the frame rate of the current environment by counting the number of frames rendered within a specified duration.
     * @param {number} time - The duration in milliseconds for which to measure the frame rate.
     */
    measureFrameRate(time) {
        if (!this.isTabActive) return;
        let count = 0,
            run = true;
        const countFrames = () => {
            if (!this.isTabActive) return;
            count++;
            if (run) window.requestAnimationFrame(countFrames);
            else {
                this.frameRate = Math.round(count * 1000 / time);
                if (time === 3000) this.frameRateValues.push(this.frameRate);
            }
        }
        const setCountPeriod = () => {
            setTimeout(() => { run = false; }, time);
            countFrames();
        }
        setCountPeriod();
        setTimeout(() => {
            if (time < 2000) time *= 2;
            else time = 3000;
            if (this.frameRateValues.length < 3) this.measureFrameRate(time);
            else this.finalFrameRate = Math.round(this.frameRateValues.reduce((a, b) => a + b) / this.frameRateValues.length);
        }, time + 100);
    }

    /**
     * Handles the visibility change of the document to pause frame rate measurement when the tab is not active.
     */
    handleTabVisibilityChange() {
        if (document.hidden) this.isTabActive = false;
        else {
            this.isTabActive = true;
            if (this.finalFrameRate === null) this.measureFrameRate(500);
        }
    }

    /**
     * Initializes the SmoothScroll instance by setting up necessary event listeners and observers.
     */
    initialize() {
        if (!/Android|iPhone|iPad/i.test(navigator.userAgent)) {
            window.addEventListener('load', this.handleTabVisibilityChange());
            document.addEventListener('visibilitychange', this.handleTabVisibilityChange);
            window.addEventListener('load', this.scrollModeToggle('enable'));
            this.buttonObserver.observe(this.toggleButtonEl, { attributes: true });
        }
        else this.toggleButtonEl.style.display = 'none';
    }
};

// Instantiate SmoothScroll with custom settings
const smoothScroll = new SmoothScroll({});
