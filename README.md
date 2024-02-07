# Smooth Scroll 🌟

> Status : **work in progress**

## Try the effect

Experience **Smooth Scroll** before installation: [Smooth Scroll](https://willowy-kashata-5d56b8.netlify.app).

## How to use

- Import `smooth-scroll.js` into your code base
- Link at the end of the body, like any other JS file
- Instantiate the class as follows:

``` JS
const smoothScroll = new SmoothScroll({
    // Default settings
    durationIncreaseFactor: 1.1,
    scrollSpeedMultiplier: 12,
    scrollDuration: 700,
    limitDuration: 2500,
    enableLimitDuration: true,

    // Toggle button class name
    toggleButtonSelector: '.scroll-mode',
    activeStateClassName: 'scroll-enabled',
});
```

## Issues

- [ ] Sometimes fails after a scroll animation
- [ ] Add an `enableToggleButton: false` setting
- [ ] Refine the logic, refactor code

See you later.
