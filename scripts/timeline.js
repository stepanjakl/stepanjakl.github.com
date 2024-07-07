class timeline extends HTMLElement {
    constructor() {
        super()
        this.labels = []
    }

    static get observedAttributes() {
        return ['labels']
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) return
        this[property] = stringToArray(newValue)
    }

    /* TODO add variables, use --segment where possible */
    connectedCallback() {
        this.innerHTML = `
            <style>
                horizontal-timeline {
                    display: flex;
                    transition: margin var(--animate-out-segment) var(--ease-in-quad) var(--animate-in-segment-2\\/3);
                    margin: 0 8rem;

                    --var-name: 1;
                }

                horizontal-timeline:hover {
                    transition: margin var(--animate-in-segment) var(--ease-out-quad);
                    margin: 0 4rem;
                }

                #timeline_wrapper {
                    transition: border-radius var(--animate-out-segment) var(--ease-in-quad) var(--animate-in-segment-2\\/3), transform var(--animate-out-segment) var(--ease-in-quad) var(--animate-in-segment-2\\/3);
                    position: relative;
                    border-radius: 0.75rem;
                    background-color: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(0.375rem);
                    -webkit-backdrop-filter: blur(0.375rem);
                    overflow: clip;
                    width: 100%;
                }

                horizontal-timeline:hover #timeline_wrapper {
                    transition: border-radius var(--animate-in-segment) var(--ease-out-quad), transform var(--animate-in-segment) var(--ease-out-quad);
                    border-radius: 1.125rem;
                    transform: translateY(calc((0.375rem + 0.375rem + 0.375rem) / 2)); // derived from #timeline_content padding values
                }

                #timeline_content {
                    transition: padding var(--animate-out-segment) var(--ease-in-quad) var(--animate-in-segment-2\\/3);
                    overflow-x: scroll;
                    overflow-y: hidden;
                    scroll-behavior: auto;
                    white-space: nowrap;
                    scrollbar-width: none;
                    -webkit-overflow-scrolling: touch;
                    -ms-overflow-style: none;
                    padding: 0.5rem 1.5rem 0.25rem 1.5rem;
                    mask-image: linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) var(--segment), rgba(0, 0, 0, 1) calc(100% - var(--segment)), rgba(0, 0, 0, 0) 100%);
                }

                #timeline_content::-webkit-scrollbar {
                    display: none;
                }

                horizontal-timeline:hover #timeline_content {
                    transition: padding var(--animate-in-segment) var(--ease-out-quad);
                    padding: calc(0.5rem + 0.375rem) calc(1.5rem + 4rem) calc(0.25rem + 0.375rem) calc(1.5rem + 4rem);
                }

                #timeline_content > div {
                    transition: row-gap var(--animate-out-segment) var(--ease-in-quad) var(--animate-in-segment-2\\/3);
                    row-gap: 0.5rem;
                }

                horizontal-timeline:hover #timeline_content > div {
                    transition: row-gap var(--animate-in-segment) var(--ease-out-quad);
                    row-gap: calc(0.5rem + 0.375rem);
                }

                #timeline {
                    height: 1.125rem;
                }

                #timeline div {
                    display: flex;
                    align-items: end;
                    padding: 0 0.5rem;
                }

                #timeline div[data-value] {
                    cursor: pointer;
                }

                #timeline div span {
                    transition: background var(--animate-out-segment-2\\/3) linear, height var(--animate-out-segment-2\\/3) var(--ease-in-quad);
                    background-color: rgba(255, 255, 255, 0.45);
                    width: max(1.5px, 0.09375rem);
                    height: calc((6/18) * 100%);
                    border-radius: max(0.5px, 0.09375rem);
                }

                #timeline div:hover span,
                #timeline div.highlight span {
                    transition: background var(--animate-in-segment-2\\/3) linear, height var(--animate-in-segment-2\\/3) var(--ease-out-quad) !important;
                    height: 100% !important;
                }

                #timeline div:has(+ div:hover) span,
                #timeline div:hover + div span,
                #timeline div:has(+ div.highlight) span,
                #timeline div.highlight + div span {
                    height: calc((14/18) * 100%) !important;
                }

                #timeline div:has(+ div + div:hover) span,
                #timeline div:hover + div + div span,
                #timeline div:has(+ div + div.highlight) span,
                #timeline div.highlight + div + div span {
                    height: calc((10/18) * 100%) !important;
                }

                #timeline div:nth-child(6n + 4) span {
                    height: calc((12/18) * 100%);
                }

                #timeline div:nth-child(6n + 3) span, #timeline div:nth-child(6n + 5) span {
                    height: calc((8/18) * 100%);
                }

                #timeline div:nth-child(2) span, #timeline div:nth-last-child(2) span {
                    background-color: rgba(255, 255, 255, 0.35);
                }

                #timeline div:first-child span, #timeline div:last-child span {
                    background-color: rgba(255, 255, 255, 0.25);
                }

                /* #timeline div.active,
                #timeline div.active + div span,
                #timeline div.active + div + div span,
                #timeline div.active + div + div + div span,
                #timeline div.active + div + div + div + div span,
                #timeline div.active + div + div + div + div + div span {
                    transition: background var(--animate-in-segment-2\\/3) linear, height var(--animate-in-segment-2\\/3) var(--ease-out-quad);
                } */

                #timeline div.active span {
                    background-color: rgba(255, 255, 255, 0.75);
                    height: 100%;
                }

                #timeline div.active + div span {
                    transition: background var(--animate-in-segment-2\\/3) linear calc(var(--delay-segment-1\\/3)), height var(--animate-in-segment-2\\/3) var(--ease-out-quad));
                    background-color: rgba(255, 255, 255, 0.7);
                    height: calc((14/18) * 100%);
                }

                #timeline div.active + div + div span {
                    transition: background var(--animate-in-segment-2\\/3) linear calc(2 * var(--delay-segment-1\\/3)), height var(--animate-in-segment-2\\/3) var(--ease-out-quad);
                    background-color: rgba(255, 255, 255, 0.65);
                    height: calc((10/18) * 100%);
                }

                #timeline div.active + div + div + div span {
                    transition: background var(--animate-in-segment-2\\/3) linear calc(3 * var(--delay-segment-1\\/3)), height var(--animate-in-segment-2\\/3) var(--ease-out-quad);
                    background-color: rgba(255, 255, 255, 0.6);
                }

                #timeline div.active + div + div + div + div span {
                    transition: background var(--animate-in-segment-2\\/3) linear calc(4 * var(--delay-segment-1\\/3)), height var(--animate-in-segment-2\\/3) var(--ease-out-quad);
                    background-color: rgba(255, 255, 255, 0.55);
                }

                #timeline div.active + div + div + div + div + div span {
                    transition: background var(--animate-in-segment-2\\/3) linear calc(5 * var(--delay-segment-1\\/3)), height var(--animate-in-segment-2\\/3) var(--ease-out-quad);
                    background-color: rgba(255, 255, 255, 0.5);
                }

                #timeline_labels {
                    display: grid;
                    grid-auto-flow: column;
                    grid-auto-columns: 1fr;
                    padding: 0 0.5rem;
                }

                #timeline_labels button {
                    position: relative;
                    display: inline-flex;
                    justify-self: center;
                    cursor: pointer;
                }

                #timeline_labels button span {
                    transition: color var(--animate-out-segment-2\\/3) linear;
                    text-align: center;
                    color: var(--text-2);
                    padding: 0.25rem 0.3125rem 0.25rem 0.4375rem;
                    font-family: 'Chakra Petch', monospace;
                    font-weight: 600;
                    font-size: 0.80356875rem;
                    line-height: 0.875rem;
                    letter-spacing: 0.125rem;
                }

                #timeline_labels button span::before {
                    content: "";
                    margin-bottom: -0.1864em;
                    display: table;
                }

                #timeline_labels button span::after {
                    content: "";
                    margin-top: -0.2024em;
                    display: table;
                }

                #timeline_labels button.active span {
                    transition: color var(--animate-in-segment-2\\/3) linear;
                    color: var(--text-1);
                }

                #timeline_labels button::before {
                    transition: opacity var(--animate-out-segment-2\\/3) linear, inset var(--animate-out-segment-2\\/3) var(--ease-in-quad);
                    content: '';
                    position: absolute;
                    inset: 0.09375rem 0.1875rem;
                    opacity: 0;
                    background-color: rgba(255, 255, 255, 0.15);
                    border-radius: 999rem;
                }

                #timeline_labels button.active::before {
                    transition: opacity var(--animate-in-segment-2\\/3) linear, inset var(--animate-in-segment-2\\/3) var(--ease-out-quad);
                    opacity: 1;
                    inset: 0;
                }

                #timeline_labels button.highlight::before,
                #timeline_labels button:hover::before, #timeline_labels button:focus::before {
                    transition: opacity var(--animate-in-segment-2\\/3) linear, inset var(--animate-in-segment-2\\/3) var(--ease-out-quad);
                    opacity: 1;
                    inset: 0;
                }
            </style>

            <noscript>
                <style>
                    #timeline_labels button::after {
                        content: '';
                        position: absolute;
                        inset: -1.875rem -0.3125rem -0.3125rem -0.3125rem;
                    }
                </style>
            </noscript>

            <div id="timeline_wrapper">
                <div id="timeline_content">
                    <div class="inline-flex flex-col">
                        <div id="timeline" class="flex">
                            ${this.labels.map((label, index) => `
                                ${index === 0 ? `<div><span></span></div>` : ''}
                                <div><span></span></div>
                                <div data-value="${label}"><span></span></div>
                                <div data-value="${label}"><span></span></div>
                                <div data-value="${label}"><span></span></div>
                                <div data-value="${label}"><span></span></div>
                                <div data-value="${label}"><span></span></div>
                            `).join('')}
                        </div>
                        <div id="timeline_labels">
                            ${this.labels.map(label => `<button type="button" data-label-for="${label}"><span>${label}</span></button>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `

        let firstLoad = true

        const scrollParentToChildCenterHorizontal = (parent, child) => {
            return new Promise((resolve) => {
                var parentRect = parent.getBoundingClientRect()
                var childRect = child.getBoundingClientRect()
                var scrollAmount = childRect.left - parentRect.left - (parentRect.width - childRect.width) / 2
                var initialScrollLeft = parent.scrollLeft

                const isScrollEndSupported = 'onscrollend' in window

                if (isScrollEndSupported) {
                    const handleScrollEnd = (event) => {
                        parent.removeEventListener('scrollend', handleScrollEnd)
                        resolve()
                    }
                    parent.addEventListener('scrollend', handleScrollEnd)
                }

                parent.scroll({
                    left: initialScrollLeft + scrollAmount,
                    behavior: 'smooth'
                })

                if (!isScrollEndSupported) {
                    resolve()
                }
            })
        }

        const scrollParentToChildVertical = (parent, child) => {
            const parentRect = parent.getBoundingClientRect()
            const childRect = child.getBoundingClientRect()
            const scrollAmount = childRect.top - parentRect.top - 24
            parent.scrollTop += scrollAmount
        }

        const handleLabelClick = (modalArchiveEl, labelEl) => () => {
            const section = labelEl.getAttribute('data-label-for')
            const targetElement = document.querySelector(`[data-timeline-section="${section}"]`)
            if (targetElement) {
                scrollParentToChildVertical(modalArchiveEl, targetElement)
            }
        }

        const handleIntersection = (timelineContentEl, labelEls) => (entries) => {
            entries.forEach(async (entry) => {
                const targetSection = entry.target.getAttribute('data-timeline-section')
                const targetLabelEl = document.querySelector(`[data-label-for="${targetSection}"]`)
                const timelineEls = Array.from(document.querySelectorAll('#timeline div'))

                if (entry.isIntersecting) {
                    targetLabelEl.focus()

                    if(!firstLoad) {
                        await scrollParentToChildCenterHorizontal(timelineContentEl, targetLabelEl)
                    }
                    else {
                        firstLoad = false
                    }

                    labelEls.forEach((labelEl) => labelEl.classList.remove('active'))
                    targetLabelEl.classList.add('active')

                    const index = labelEls.findIndex((labelEl) => labelEl.getAttribute('data-label-for') === targetSection)
                    timelineEls.forEach((timelineEl) => timelineEl.classList.remove('active'))
                    timelineEls[3 + (index === 0 ? 0 : index * 6)].classList.add('active')
                }
            })
        }

        const setupIntersectionObserver = (timelineContentEl, labelEls) => {
            const intersectionObserver = new IntersectionObserver(handleIntersection(timelineContentEl, labelEls), { threshold: 0.75 })
            document.querySelectorAll('[data-timeline-section]').forEach(async (element) => await intersectionObserver.observe(element))
        }

        const initializeTimeline = () => {
            const modalArchiveEl = document.querySelector('#modal_archive')
            const timelineContentEl = document.querySelector('#timeline_content')
            const labelEls = Array.from(document.querySelectorAll('[data-label-for]'))

            labelEls.forEach((labelEl) => {
                labelEl.addEventListener('click', handleLabelClick(modalArchiveEl, labelEl))
            })

            setupIntersectionObserver(timelineContentEl, labelEls)
        }

        initializeTimeline()


        /* function handleMouseMove(event) {
            const rect = timelineContent.getBoundingClientRect();
            const edgeWidth = 3 * parseFloat(getComputedStyle(document.documentElement).fontSize)

            if (event.clientX < rect.left + edgeWidth) {
                startScroll('left', calculateSpeed(event.clientX - rect.left, edgeWidth))
            } else if (event.clientX > rect.right - edgeWidth) {
                startScroll('right', calculateSpeed(rect.right - event.clientX, edgeWidth))
            } else {
                stopScroll()
            }
        }

        function startScroll(direction, speed) {
            if (scrollInterval) clearInterval(scrollInterval)
            scrollInterval = setInterval(() => {
                timelineContent.scrollBy({
                    left: direction === 'left' ? -speed : speed,
                    behavior: 'smooth'
                })
            }, 50)
        }

        function stopScroll() {
            if (scrollInterval) clearInterval(scrollInterval)
        }

        function calculateSpeed(distance, edgeWidth) {
            const maxSpeed = 20
            return Math.min(maxSpeed, (maxSpeed * (edgeWidth - distance)) / edgeWidth)
        }

        const timelineContent = document.getElementById('timeline_content')
        let scrollInterval

        timelineContent.addEventListener('mousemove', handleMouseMove)
        timelineContent.addEventListener('mouseleave', stopScroll) */


        const timelineContent = document.getElementById('timeline_content')
        let lastTimestamp = null
        let scrollSpeed = 0
        const maxSpeed = 0.5
        let isScrolling = false

        timelineContent.addEventListener('mousemove', handleMouseMove)
        timelineContent.addEventListener('mouseleave', stopScroll)

        function handleMouseMove(event) {
            const rect = timelineContent.getBoundingClientRect()
            const edgeWidth = 3 * parseFloat(getComputedStyle(document.documentElement).fontSize)

            if (event.clientX < rect.left + edgeWidth) {
                scrollSpeed = calculateSpeed(event.clientX - rect.left, edgeWidth, 'left')
                startScroll()
            } else if (event.clientX > rect.right - edgeWidth) {
                scrollSpeed = calculateSpeed(rect.right - event.clientX, edgeWidth, 'right')
                startScroll()
            } else {
                stopScroll()
            }
        }

        function startScroll() {
            if (!isScrolling) {
                isScrolling = true
                requestAnimationFrame(scrollStep)
            }
        }

        function scrollStep(timestamp) {
            if (lastTimestamp === null) {
                lastTimestamp = timestamp
            }
            const elapsed = timestamp - lastTimestamp
            lastTimestamp = timestamp

            const maxScrollLeft = timelineContent.scrollWidth - timelineContent.clientWidth
            const minScrollLeft = 0

            timelineContent.scrollLeft += scrollSpeed * elapsed

            if (scrollSpeed > 0 && timelineContent.scrollLeft >= maxScrollLeft) {
                timelineContent.scrollLeft = maxScrollLeft
                stopScroll()
            } else if (scrollSpeed < 0 && timelineContent.scrollLeft <= minScrollLeft) {
                timelineContent.scrollLeft = minScrollLeft
                stopScroll()
            }

            if (scrollSpeed !== 0) {
                requestAnimationFrame(scrollStep)
            } else {
                isScrolling = false
                lastTimestamp = null
            }
        }


        function stopScroll() {
            scrollSpeed = 0
        }

        function calculateSpeed(distance, edgeWidth, direction) {
            const speed = (maxSpeed * (edgeWidth - distance)) / edgeWidth
            return direction === 'left' ? -speed : speed
        }


        const highlightLabelEls = (() => {
            const timelineEls = document.querySelectorAll('#timeline [data-value]')

            timelineEls.forEach(timelineEl => {
                const value = timelineEl.getAttribute('data-value')
                const labelEl = document.querySelector(`#timeline_labels [data-label-for="${value}"]`)

                if (labelEl) {
                    timelineEl.addEventListener('mouseenter', () => {
                        labelEl.classList.add('highlight')
                    })

                    timelineEl.addEventListener('mouseleave', () => {
                        labelEl.classList.remove('highlight')
                    })

                    timelineEl.addEventListener('click', () => {
                        labelEl.click()
                    })
                }
            })
        })()

        const highlightTimelineEls = (() => {
            const labelEls = document.querySelectorAll('#timeline_labels button')

            labelEls.forEach(labelEl => {
                const value = labelEl.getAttribute('data-label-for')
                const timelineEl = document.querySelector(`#timeline div:nth-child(6n + 4)[data-value="${value}"]`)

                if (labelEl) {
                    labelEl.addEventListener('mouseenter', () => {
                        timelineEl.classList.add('highlight')
                    })

                    labelEl.addEventListener('mouseleave', () => {
                        timelineEl.classList.remove('highlight')
                    })
                }
            })
        })()
    }
}

const stringToArray = (inputString) => {
    const match = inputString.match(/\[(.*?)\]/)
    if (match && match[1]) {
        return match[1].split(',').map(item => item.trim())
    }
    return []
}

customElements.define('horizontal-timeline', timeline)
