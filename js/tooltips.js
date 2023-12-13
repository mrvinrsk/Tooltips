class Tooltip {
	/**
	 * Creates a new instance of the Tooltip
	 * @param {*} id the id or the element
	 * @param {*} options
	 */
	constructor(which, options) {
		this.defaultOptions = {
			placement: "bottom right",
			closable: true,
			followCursor: false,
			callbacks: {
				beforeShow: () => {},
				afterShow: () => {},
				beforeMove: () => {},
				afterMove: () => {},
				beforeHide: () => {},
				afterHide: () => {},
			},
			offset: {
				x: 15,
				y: 15,
			},
			margin: 10,
			forcedMovements: false,
		};

		this.defaultMoveOptions = {
			animation: {
				enabled: true,
				duration: "auto",
				boundary: [100, 700],
				easing: "ease-out",
			},
		};

		this.isVisible = false;
		this.element = typeof which === "string" ? document.getElementById(which) : which;
		if (!this.element.classList.contains("tooltip")) console.warn(which, "doesn't seem to be intended to be a tooltip, it doesn't have the class 'tooltip' by default.");
		this.element.classList.add("tooltip", "tooltip-init");

		this.options = Object.assign({}, this.defaultOptions, options);

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
			e.preventDefault();
			e.stopPropagation();
		});

		if (this.options.closable) {
			const close = document.createElement("div");
			close.classList.add("tooltip-close");
			close.addEventListener("click", () => {
				this.visible(false);
			});

			this.element.prepend(close);
			this.element.classList.add("closable");
		}
	}

	/**
	 * Sets/Removes the class "show" from the tooltips
	 * @param {boolean} enabled whether the tooltip should be shown or not
	 */
	visible(enabled, x = null, y = null) {
		if (enabled && this.isVisible) {
            console.warn(this.element, "is already visible, please use move() instead.");
			return;
		}

		this.isVisible = enabled;
		if (enabled) this.#show(x, y);
		else this.#hide();

		this.element.classList.toggle("show", enabled);

		if (enabled) this.options.callbacks.afterShow();
		else this.options.callbacks.afterHide();
	}

	#show(x, y) {
		this.options.callbacks.beforeShow();

		console.log("Show at", x, y);

		if (x != null && y != null) {
			this.move(x, y, this.options.forcedMovements, {
				animation: {
					enabled: false,
				},
			});
		}
	}

	#hide() {
		this.options.callbacks.beforeHide();
	}

	#calcPosition(x, y) {
		let rect = this.element.getBoundingClientRect();
		x += this.options.offset.x;
		y += this.options.offset.y;

		if (this.options.placement.startsWith("top")) {
			y -= rect.height + this.options.margin;
		} else if (this.options.placement.startsWith("center")) {
			y -= rect.height / 2;
		}

		if (this.options.placement.endsWith("left")) {
			x -= rect.width + this.options.margin;
		} else if (this.options.placement.endsWith("center")) {
			x -= rect.width / 2;
		}

		if (x > window.innerWidth - rect.width - this.options.margin) {
			x = window.innerWidth - rect.width - this.options.margin;
		} else if (x < this.options.margin) {
			x = this.options.margin;
		}

		if (y > window.innerHeight - rect.height - this.options.margin) {
			y = window.innerHeight - rect.height - this.options.margin;
		} else if (y < this.options.margin) {
			y = this.options.margin;
		}

		return { x, y };
	}

	/**
	 * Move the tooltip to the desired position
	 * @param {number} x
	 * @param {number} y
	 * @param {boolean} force
	 */
	move(x, y, force = false, options = this.defaultMoveOptions) {
		const calc = this.#calcPosition(x, y);
		const placeX = calc.x;
		const placeY = calc.y;

		this.options.callbacks.beforeMove();

		if (options.animation.enabled) {
			// calculate an auto duration based on the distance (min 100ms, max 700ms)
			const distance = Math.sqrt(Math.pow(placeX - this.element.offsetLeft, 2) + Math.pow(placeY - this.element.offsetTop, 2));
			const autoDuration = Math.max(this.defaultMoveOptions.animation.boundary[0], Math.min(this.defaultMoveOptions.animation.boundary[1], distance));
			const duration = options.animation.duration === "auto" ? autoDuration : `${options.animation.duration}ms`;

			this.element.style.transition = `top ${options.animation.duration} ${options.animation.easing}, left ${options.animation.duration} ${options.animation.easing}`;
		} else {
			this.element.style.transition = "none";
		}

		this.element.style.left = `${placeX}px`;
		this.element.style.top = `${placeY}px`;

		this.options.callbacks.afterMove();
	}
}
