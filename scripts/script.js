class TextHighlighter {
    constructor() {
        this.originalText = ''
    }

    highlightAndCopyText(event, textElement, highlightElement, temporaryText) {
        if (this.isCopying(event.target)) {
            this.setTemporaryText(textElement, temporaryText)
            this.activateHighlight(highlightElement)
            this.scheduleDeactivation(event, textElement, highlightElement)
        }
    }

    isCopying(target) {
        return target.getAttribute('data-copying') !== ''
    }

    setTemporaryText(textElement, temporaryText) {
        this.originalText = textElement.innerText
        if (temporaryText) {
            textElement.innerText = temporaryText
        }
    }

    restoreOriginalText(event, textElement) {
        if (this.isCopying(event.target)) {
            event.target.removeAttribute('data-copying')
            textElement.innerText = this.originalText
        }
    }

    activateHighlight(highlightElement) {
        highlightElement.classList.add('highlight-text--active')
    }

    deactivateHighlight(highlightElement) {
        highlightElement.classList.remove('highlight-text--active')
    }

    scheduleDeactivation(event, textElement, highlightElement) {
        setTimeout(() => {
            this.restoreOriginalText(event, textElement)
            this.deactivateHighlight(highlightElement)
            setTimeout(() => {
                document.activeElement.blur()
            }, 200)
        }, 1000)
    }
}


class KeyHandler {
    constructor() {
        this.tooltipSelectors = '#menu_links>a[href="#profile"], #menu_links>a[href="#archive"], #menu_button_wrapper'
        this.menuElementSelector = '.animate-fade-in-cta-2'
        this.menuDropdownSelector = '#menu_dropdown'
        this.menuButtonOpenSelector = '#menu_button-open'
        this.menuButtonCloseSelector = '#menu_button-close'

        document.addEventListener('keydown', this.handleKeydown.bind(this))
        document.addEventListener('keyup', this.handleKeyup.bind(this))
    }

    handleKeydown(event) {
        switch (event.keyCode) {
            case 27: // Escape key
                this.clearHash()
                break
            case 80: // P key
                this.toggleProfile(event)
                break
            case 65: // A key
                this.toggleArchive(event)
                break
            case 77: // M key
                this.toggleMenu(event)
                break
            default:
                break
        }

        this.handleTooltipActiveClass(event)
    }

    handleKeyup(event) {
        this.toggleTooltipActiveClass('remove')
    }

    toggleTooltipActiveClass(action) {
        document.querySelectorAll(this.tooltipSelectors).forEach(element => {
            element.classList[action]('tooltip-key--active')
        })
    }

    clearHash() {
        document.location.hash = ''
    }

    toggleProfile(event) {
        event.preventDefault()
        document.location.hash = document.location.hash === '#profile' ? '' : '#profile'
    }

    toggleArchive(event) {
        event.preventDefault()
        document.location.hash = document.location.hash === '#archive' ? '' : '#archive'
    }

    toggleMenu(event) {
        event.preventDefault()
        const menuElement = document.querySelector(this.menuElementSelector)

        if (this.isAnimationFinished(menuElement)) {
            if (document.location.hash === '#menu') {
                this.closeMenu()
            } else {
                this.openMenu()
            }
        }
    }

    isAnimationFinished(element) {
        const animations = element.getAnimations()
        return animations.length === 0 || animations[0].playState === 'finished'
    }

    closeMenu() {
        document.location.hash = ''
        document.querySelector(this.menuDropdownSelector).close()
        document.querySelector(this.menuButtonOpenSelector).focus()
    }

    openMenu() {
        document.location.hash = '#menu'
        document.querySelector(this.menuDropdownSelector).show()
        document.querySelector(this.menuButtonCloseSelector).focus()
    }

    handleTooltipActiveClass(event) {
        if (document.location.hash !== '') {
            this.toggleTooltipActiveClass('remove')
        } else if (event.ctrlKey || event.metaKey) {
            if (document.location.hash === '') {
                this.toggleTooltipActiveClass('add')
            }
        }
    }
}


class WheelHandler {
    constructor() {
        window.addEventListener('wheel', this.handleWheelEvent.bind(this))
    }

    handleWheelEvent(event) {
        const deltaX = Math.abs(event.deltaX)
        const deltaY = Math.abs(event.deltaY)

        if (deltaY > deltaX && deltaY > 5) {
            this.handleVerticalScroll(event.deltaY)
        } else if (deltaX > deltaY && deltaX > 5) {
            this.handleHorizontalScroll(event.deltaX)
        }
    }

    handleVerticalScroll(deltaY) {
        const verticalScrollDirection = deltaY > 0 ? 'down' : 'up'
        const currentHash = window.location.hash

        if (currentHash === '#profile' || currentHash === '#archive') {
            this.handleModalVerticalScroll(verticalScrollDirection, currentHash)
        } else {
            this.handlePageVerticalScroll(verticalScrollDirection)
        }
    }

    handleModalVerticalScroll(verticalScrollDirection, currentHash) {
        const modalElement = document.querySelector(
            currentHash === '#profile' ? '#modal_profile' : '#modal_archive'
        )
        const scrollPositionTop = modalElement.scrollTop

        if (verticalScrollDirection === 'up' && scrollPositionTop === 0) {
            window.location.hash = '#'
        }
    }

    handlePageVerticalScroll(verticalScrollDirection) {
        const scrollPositionY = window.scrollY || window.pageYOffset
        const totalHeight = document.documentElement.scrollHeight

        if (verticalScrollDirection === 'down' && scrollPositionY + window.innerHeight >= totalHeight) {
            if (window.location.hash === '') {
                window.location.hash = '#profile'
            }
        }
    }

    handleHorizontalScroll(deltaX) {
        const horizontalScrollDirection = deltaX > 0 ? 'right' : 'left'
        const scrollPositionX = window.scrollX || window.pageXOffset
        const totalWidth = document.documentElement.scrollWidth

        if (this.isAnimationFinished('.animate-fade-in-cta-2')) {
            if (horizontalScrollDirection === 'right' && scrollPositionX + window.innerWidth >= totalWidth) {
                if (window.location.hash === '') {
                    window.location.hash = '#menu'
                }
            } else if (horizontalScrollDirection === 'left' && scrollPositionX === 0) {
                if (window.location.hash === '#menu') {
                    window.location.hash = '#'
                }
            }
        }
    }

    isAnimationFinished(selector) {
        const animations = document.querySelector(selector).getAnimations()
        return animations.length === 0 || animations[0].playState === 'finished'
    }
}


class TouchHandler {
    constructor() {
        this.touchStartX = 0
        this.touchStartY = 0
        this.init()
    }

    init() {
        window.addEventListener('touchstart', this.handleTouchStart.bind(this))
        window.addEventListener('touchmove', this.handleTouchMove.bind(this))
    }

    handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX
        this.touchStartY = event.touches[0].clientY
    }

    handleTouchMove(event) {
        const touchEndX = event.touches[0].clientX
        const touchEndY = event.touches[0].clientY
        const deltaX = Math.abs(touchEndX - this.touchStartX)
        const deltaY = Math.abs(touchEndY - this.touchStartY)

        if (deltaY > deltaX && deltaY > 5) {
            this.handleVerticalScroll(touchEndY)
        } else if (deltaX > deltaY && deltaX > 5) {
            this.handleHorizontalScroll(touchEndX)
        }
    }

    handleVerticalScroll(touchEndY) {
        const verticalScrollDirection = touchEndY < this.touchStartY ? 'down' : 'up'
        const currentHash = window.location.hash

        if (currentHash === '#profile' || currentHash === '#archive') {
            this.handleModalScroll(verticalScrollDirection, currentHash)
        } else {
            this.handlePageVerticalScroll(verticalScrollDirection)
        }
    }

    handleModalScroll(verticalScrollDirection, currentHash) {
        const modalElement = document.querySelector(currentHash === '#profile' ? '#modal_profile' : '#modal_archive')
        const scrollPositionTop = modalElement.scrollTop

        if (verticalScrollDirection === 'up' && scrollPositionTop === 0) {
            window.location.hash = '#'
        }
    }

    handlePageVerticalScroll(verticalScrollDirection) {
        const scrollPositionY = window.scrollY || window.pageYOffset
        const totalHeight = document.documentElement.scrollHeight

        if (verticalScrollDirection === 'down' && scrollPositionY + window.innerHeight >= totalHeight) {
            if (window.location.hash === '') {
                window.location.hash = '#profile'
            }
        }
    }

    handleHorizontalScroll(touchEndX) {
        const horizontalScrollDirection = touchEndX > this.touchStartX ? 'right' : 'left'
        const scrollPositionX = window.scrollX
        const totalWidth = document.documentElement.scrollWidth

        if (this.isAnimationFinished('.animate-fade-in-cta-2')) {
            if (horizontalScrollDirection === 'right' && scrollPositionX + window.innerWidth >= totalWidth) {
                if (window.location.hash === '#menu') {
                    window.location.hash = '#'
                }
            } else if (horizontalScrollDirection === 'left' && scrollPositionX === 0) {
                if (window.location.hash === '') {
                    window.location.hash = '#menu'
                }
            }
        }
    }

    isAnimationFinished(selector) {
        const animations = document.querySelector(selector).getAnimations()
        return animations.length === 0 || animations[0].playState === 'finished'
    }
}


class HorizontalDragScroll {
    constructor(element, options) {
        this.element = element
        this.options = options
        this.isPointerDown = false
        this.startX = 0
        this.scrollLeft = 0
        this.init()
    }

    init() {
        this.element.addEventListener('pointerdown', this.onPointerDown.bind(this))
        this.element.addEventListener('pointermove', this.onPointerMove.bind(this))
        this.element.addEventListener('pointerup', this.completeDrag.bind(this))
        this.element.addEventListener('pointercancel', this.completeDrag.bind(this))
    }

    onPointerDown(event) {
        this.isPointerDown = true
        this.startX = event.clientX
        this.scrollLeft = this.element.scrollLeft
        this.element.classList.add('pointer-down')
    }

    onPointerMove(event) {
        if (!this.isPointerDown) return

        event.preventDefault()
        this.element.setPointerCapture(event.pointerId)
        this.element.classList.add('dragging')
        const moveX = event.clientX - this.startX
        this.element.scrollLeft = this.scrollLeft - moveX
    }

    completeDrag(event) {
        this.isPointerDown = false
        this.element.scrollTo({
            left: this.options.activeSlide.get().offsetLeft,
            behavior: 'smooth',
        })

        setTimeout(() => {
            this.element.classList.remove('dragging', 'pointer-down')
            this.element.releasePointerCapture(event.pointerId)
        }, 250)
    }
}


class Popup {
    constructor() {
        this.widthRatio = 0.8
        this.heightRatio = 0.8
    }

    open(element, event) {
        event.preventDefault()

        const { href } = element

        const width = screen.availWidth * this.widthRatio
        const height = screen.availHeight * this.heightRatio
        const left = (screen.availWidth - width) / 2
        const top = (screen.availHeight - height) / 2

        const popup = window.open(href, '_blank', `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`)

        if (popup === null) {
            return true
        }
        return false
    }
}


class Carousel {
    constructor(carouselEl) {
        this.carouselEl = carouselEl
        this.slidesWrapperEl = carouselEl.querySelector('[data-carousel-slides]')
        this.slideEls = Array.from(carouselEl.querySelectorAll('[data-carousel-slides] figure'))
        this.navEl = carouselEl.querySelector('[data-carousel-nav]')
        this.dotEls = []
        this.prevButtonEl = carouselEl.querySelector('[data-carousel-arrows] li:first-child button')
        this.nextButtonEl = carouselEl.querySelector('[data-carousel-arrows] li:last-child button')
        this.activeSlide = {
            element: null,
            get: () => this.activeSlide.element,
            set: (el) => this.activeSlide.element = el
        }

        this.init()
    }

    init() {
        this.createNavigationDots()
        this.setupIntersectionObserver()
        this.enableHorizontalDragScroll()
        this.setupDotEventListeners()
        this.setupButtonEventListeners()
    }

    createNavigationDots() {
        this.navEl.innerHTML = this.slideEls.map((_, index) => `<button data-label-for="${this.slideEls[index].getAttribute('data-value')}"><span class="sr-only">Slide ${index + 1}</span></button>`).join('')
        this.dotEls = Array.from(this.navEl.querySelectorAll('button'))
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const target = entry.target
                if (entry.isIntersecting) {
                    this.activeSlide.set(target)
                    target.classList.add('active')
                    this.dotEls.forEach((dotEl, i) => {
                        const isCurrent = i === this.slideEls.indexOf(entry.target)
                        dotEl.toggleAttribute('aria-current', isCurrent)

                        if (isCurrent) {
                            dotEl.focus()
                        }
                    })
                } else {
                    target.classList.remove('active')
                }
            })
        }, {
            root: this.carouselEl,
            rootMargin: `0% -50% 0% -${window.getComputedStyle(this.slidesWrapperEl).getPropertyValue('column-gap')}`,
            threshold: 0.5
        })

        this.slideEls.forEach(itemEl => observer.observe(itemEl))
    }

    setupDotEventListeners() {
        this.dotEls.forEach(dotEl => {
            dotEl.addEventListener('click', event => {
                event.preventDefault()
                const targetValue = event.target.getAttribute('data-label-for')
                this.carouselEl.querySelector(`figure[data-value="${targetValue}"]`).scrollIntoView({
                    behavior: 'smooth', block: 'nearest', inline: 'start'
                })
            })
        })
    }

    enableHorizontalDragScroll() {
        new HorizontalDragScroll(this.slidesWrapperEl, { activeSlide: this.activeSlide })
    }

    setupButtonEventListeners() {
        this.prevButtonEl.addEventListener('click', (event) => {
            event.preventDefault()
            this.activeSlide.get().previousElementSibling.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'start'
            })
        })

        this.nextButtonEl.addEventListener('click', (event) => {
            event.preventDefault()
            this.activeSlide.get().nextElementSibling.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'start'
            })
        })
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Initialize the UI elements based on the current hash
    if (window.location.hash) {
        document.querySelectorAll(
            '.animate-fade-in-name span, .animate-fade-in-title span, .animate-fade-in-cta-1, .animate-fade-in-cta-2, .animate-fade-in-logo'
        ).forEach(element => {
            element.classList.add('noanimation')
        })
        document.querySelector('#menu_dropdown').show()
    }

    // Initialize handlers
    new WheelHandler()
    new TouchHandler()
    new KeyHandler()

    // Initialize text highlighter
    window.textHighlighter = new TextHighlighter()

    // Initialize carousels
    document.querySelectorAll('[data-carousel]').forEach(carouselEl => new Carousel(carouselEl))

    // Initialize popups
    document.querySelectorAll('[data-carousel-slides] figure a').forEach(element => {
        element.addEventListener('click', event => new Popup().open(element, event))
    })
})
