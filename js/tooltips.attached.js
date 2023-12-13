class Tooltip {
	/**
	 * Creates a new instance of the Tooltip
	 * @param {*} attach the id or the element to attach the tooltip to
	 * @param {*} id the id or the element
	 * @param {*} options
	 */
	constructor(attach, which, options, warnings = true) {
		this.defaultOptions = {
			placement: "top center",
			margin: 30,
			offset: [5, 5],
			trigger: "hover", // "hover" | "click",
			threshold: 20,
		};

		this.isVisible = false;
		this.parent = typeof attach === "string" ? document.getElementById(attach) : attach;
		this.element = typeof which === "string" ? document.getElementById(which) : which;
		if (!this.element.classList.contains("tooltip")) console.warn(which, "doesn't seem to be intended to be a tooltip, it doesn't have the class 'tooltip' by default.");
		this.element.classList.add("tooltip", "tooltip-init");

		this.options = { ...this.defaultOptions, ...options };

		if (this.options.followCursor) {
			document.addEventListener("mousemove", (e) => {
				if (this.isVisible)
					this.move(e.clientX, e.clientY, this.options.forcedMovements, {
						animation: {
							enabled: false,
						},
					});
			});
		}

		this.element.addEventListener("click", (e) => {
			// Stop propagation
			e.preventDefault();
			e.stopPropagation();
		});

		// Add close button
		const close = document.createElement("div");
		close.classList.add("tooltip-close");
		close.addEventListener("click", () => {
			this.#hide();
		});

		this.element.prepend(close);

		if (this.options.trigger === "hover") {
			document.addEventListener("mousemove", (e) => {
				const rect = this.parent.getBoundingClientRect();
				const ttRect = this.element.getBoundingClientRect();

				// Berechne die Distanzen zu jedem Rand
				let distTop = Math.abs(e.clientY - ttRect.top);
				let distBottom = Math.abs(e.clientY - ttRect.bottom);
				let distLeft = Math.abs(e.clientX - ttRect.left);
				let distRight = Math.abs(e.clientX - ttRect.right);

				// Finde die kleinste Distanz
				let minDist = Math.min(distTop, distBottom, distLeft, distRight);

				// if mouse is outside (considering threshold)
				if (!(e.clientX < rect.left - this.options.threshold || e.clientX > rect.right + this.options.threshold || e.clientY < rect.top - this.options.threshold || e.clientY > rect.bottom + this.options.threshold)) {
					this.#show();
				} else if (minDist > Math.max(30, this.options.threshold) && !(this.element.contains(e.target) || this.element.isEqualNode(e.target))) {
					this.#hide();
				}
			});
		}

		if (warnings) {
			if (this.options.placement === "center center") console.warn("A tooltip with placement 'center center' is not recommended, since it overlaps the parent element.");
		}

		console.log(this.parent, this.parent.getBoundingClientRect());
	}

	#show() {
        if(this.isVisible) return;
		let { x, y } = this.#calculatePosition();
		this.element.style.left = `${x}px`;
		this.element.style.top = `${y}px`;

		this.isVisible = true;
		this.element.classList.add("show");

        console.log("Showing", this.element, this.element.getBoundingClientRect(), "for", this.parent, this.parent.getBoundingClientRect());
	}

	#hide() {
        if (!this.isVisible) return;
		this.isVisible = false;
		this.element.classList.remove("show");
	}

	#calculatePosition() {
        const rect = this.parent.getBoundingClientRect();
        const selfRect = this.element.getBoundingClientRect();
        let x = rect.left + this.options.offset[0];
        let y = rect.top + this.options.offset[1];
    
        // Helper function to adjust X position
        const adjustXPosition = (condition, adjustment) => {
            if (condition) {
                x += adjustment;
            }
        };
    
        // Helper function to adjust Y position
        const adjustYPosition = (condition, adjustment) => {
            if (condition) {
                y += adjustment;
            }
        };
    
        // Adjusting X position
        adjustXPosition(this.options.placement.endsWith("left"), -(rect.width + selfRect.width + this.options.margin));
        adjustXPosition(this.options.placement.endsWith("right"), rect.width + this.options.margin);
        adjustXPosition(this.options.placement.endsWith("center"), (rect.width / 2) - (selfRect.width / 2));
    
        // Adjusting Y position
        adjustYPosition(this.options.placement.startsWith("top"), -(rect.height + selfRect.height + this.options.margin));
        adjustYPosition(this.options.placement.startsWith("bottom"), rect.height + this.options.margin);
        adjustYPosition(this.options.placement.startsWith("center"), (rect.height / 2) - (selfRect.height / 2));
    
        // Ensure tooltip doesn't go off-screen
        x = Math.max(this.options.margin, Math.min(x, window.innerWidth - selfRect.width - this.options.margin));
        y = Math.max(this.options.margin, Math.min(y, window.innerHeight - selfRect.height - this.options.margin));
    
        return { x, y };
    }
    
}
