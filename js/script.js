class TopBar {
	constructor() {
		this.topBarElements = document.querySelectorAll(".top-bar li a");
		this.topBarElemSet = false;
		this.setTopBarPage();
	}

	activateTopBarElem(topBarElem) {
		topBarElem.classList.add("active");
		topBarElem.classList.remove("inactive");
	}

	deactivateTopBarElem(topBarElem) {
		topBarElem.classList.add("inactive");
		topBarElem.classList.remove("active");
	}

	setTopBarPage() {
		var pageId = document.querySelector("html").id;

		this.topBarElements.forEach((topBarElem) => {
			var topBarPageId = topBarElem.id;
			if (pageId == topBarPageId && !this.topBarElemSet) {
				this.activateTopBarElem(topBarElem);
				this.topBarElemSet = true;
				return;
			}
			this.deactivateTopBarElem(topBarElem);
		});
	}
}

class Sidebar {
	constructor() {
		this.topMargin = 0.1;
		this.bottomMargin = 0.2;
		this.curPathStart = undefined;
		this.curPathEnd = undefined;
		this.pathLength = undefined;

		this.tocItems = this.getTocItems();
		this.markerElem = document.querySelector(".toc-marker path");
		this.sidebarElem = document.querySelector(".sidebar");
		this.sidebarContentElem = document.querySelector(".sidebar-content");

		this.addListeners();
	}

	addListeners() {
		document.addEventListener("DOMContentLoaded", () => this.updateHeight());
		document.addEventListener("DOMContentLoaded", () => this.drawMarker());
		document.addEventListener("DOMContentLoaded", () => this.updateMarker());

		window.addEventListener("resize", () => this.updateHeight());
		window.addEventListener("scroll", () => this.updateMarker());

		new OnTransitionEndEvent(this.sidebarElem, this.redrawMarker.bind(this));
	}

	getTocItems() {
		var tocItems = document.querySelectorAll(".table-of-contents li");
		tocItems = [].slice.call(tocItems);

		tocItems = tocItems.map(function (item) {
			var anchor = item.querySelector("a");
			var target = document.getElementById(
				anchor.getAttribute("href").slice(1)
			);

			return {
				listItem: item,
				anchor: anchor,
				target: target,
			};
		});

		tocItems = tocItems.filter(function (item) {
			return !!item.target;
		});
		return tocItems;
	}

	getUnixTimeMs() {
		var currentTime = new Date();
		var currentUnixMs = currentTime.getTime();
		return currentUnixMs;
	}

	updateHeight() {
		if (this.sidebarElem && this.sidebarContentElem) {
			var sidebarStyle = getComputedStyle(this.sidebarElem);

			var sidebarHeight = parseFloat(sidebarStyle.height);
			var paddingTop = parseFloat(sidebarStyle.paddingTop);
			var paddingBottom = parseFloat(sidebarStyle.paddingBottom);
			var borderTop = parseFloat(sidebarStyle.borderTopWidth);
			var borderBottom = parseFloat(sidebarStyle.borderBottomWidth);

			var padLength = paddingTop + paddingBottom;
			var borderLength = borderTop + borderBottom;
			var availableHeight = sidebarHeight - padLength - borderLength;

			this.sidebarContentElem.style.maxHeight = availableHeight + "px";
		}
	}

	redrawMarker() {
		this.drawMarker();
		this.updateMarker();
	}

	drawMarker() {
		var path = [];
		var pathIndent;

		this.tocItems.forEach((item, i) => {
			var x = item.anchor.offsetLeft - 5,
				y = item.anchor.offsetTop,
				height = item.anchor.offsetHeight;

			if (i === 0) {
				path.push("M", x, y, "L", x, y + height);
				item.pathStart = 0;
			} else {
				if (pathIndent !== x) path.push("L", pathIndent, y);
				path.push("L", x, y);
				this.markerElem.setAttribute("d", path.join(" "));
				item.pathStart = this.markerElem.getTotalLength() || 0;

				path.push("L", x, y + height);
			}
			pathIndent = x;
			this.markerElem.setAttribute("d", path.join(" "));
			item.pathEnd = this.markerElem.getTotalLength();
		});
		this.pathLength = this.markerElem.getTotalLength();
	}

	getMarkerPath() {
		var windowHeight = window.innerHeight;
		var pathStart = this.pathLength;
		var pathEnd = 0;
		var visibleItems = 0;

		this.tocItems.forEach((item) => {
			var targetBounds = item.target.getBoundingClientRect();

			if (
				targetBounds.bottom > windowHeight * this.topMargin &&
				targetBounds.top < windowHeight * (1 - this.bottomMargin)
			) {
				pathStart = Math.min(item.pathStart, pathStart);
				pathEnd = Math.max(item.pathEnd, pathEnd);

				visibleItems += 1;

				item.listItem.classList.add("visible");
			} else {
				item.listItem.classList.remove("visible");
			}
		});

		return [pathStart, pathEnd, visibleItems];
	}

	updateMarker() {
		var [pathStart, pathEnd, visibleItems] = this.getMarkerPath();

		if (visibleItems > 0 && pathStart < pathEnd) {
			if (pathStart !== this.curPathStart || pathEnd !== this.curPathEnd) {
				var dashArrayVal = this.getDashArrayValue(pathStart, pathEnd);

				this.markerElem.setAttribute("stroke-dashoffset", "1");
				this.markerElem.setAttribute("stroke-dasharray", dashArrayVal);
				this.markerElem.setAttribute("opacity", 1);
			}
		} else {
			this.markerElem.setAttribute("opacity", 0);
		}
	}

	getDashArrayValue(pathStart, pathEnd) {
		var dashArrayVal = "1, ";
		dashArrayVal += pathStart + ", ";
		dashArrayVal += pathEnd - pathStart + ", ";
		dashArrayVal += this.pathLength;
		return dashArrayVal;
	}
}

class OnTransitionEndEvent {
	constructor(element, functionCall, intervalDuration = 50, timeoutDuration = 200) {
		this.element = element;
		this.functionCall = functionCall;
		this.intervalDuration = intervalDuration;
		this.timeoutDuration = timeoutDuration;
		this.startEventUnixMs = undefined;
		this.timeoutId = undefined;
		this.transitionEndEvents = this.getTransitionEndEvents();
		this.addListener();
	}

	addListener() {
		window.addEventListener("resize", () => this.addTransitionListener());
	}

	getTransitionEndEvents() {
		var transitionEndEvents = [
			"transitionend",
			"webkitTransitionEnd",
			"oTransitionEnd",
			"otransitionend",
			"MSTransitionEnd",
		];
		return transitionEndEvents;
	}

	getUnixTimeMs() {
		var currentTime = new Date();
		var currentUnixMs = currentTime.getTime();
		return currentUnixMs;
	}

	setTimeout() {
		var timeoutId = setTimeout(() => {
			this.transitionEndEvents.forEach((transitionEndEvent) => {
				this.element.removeEventListener(transitionEndEvent, () =>
					this.transitionEndHandler(timeoutId)
				);
			});

			this.resetState();
			this.functionCall();
		}, this.timeoutDuration);
		return timeoutId;
	}

	resetState() {
		clearTimeout(this.timeoutId);
		this.startEventUnixMs = undefined;
		this.timeoutId = undefined;
	}

	transitionEndHandler() {
		if (this.timeoutId == undefined) {
			this.timeoutId = this.setTimeout();
		}

		if (this.timeoutId) {
			if (this.startEventUnixMs == undefined) {
				this.startEventUnixMs = this.getUnixTimeMs();
			}
			var currentUnixMs = this.getUnixTimeMs();
			var elapsedMs = currentUnixMs - this.startEventUnixMs;

			if (elapsedMs >= this.intervalDuration) {
				this.functionCall();
				this.resetState();
			}
		}
	}

	addTransitionListener() {
		this.transitionEndEvents.forEach((transitionEndEvent) => {
			this.element.addEventListener(transitionEndEvent, () => {
				this.transitionEndHandler();
			});
		});
	}
}

class TouchBehavior {
	constructor() {
		this.selProjectElem = undefined;
		this.selGridElem = undefined;
		this.selSectionElem = undefined;
		this.addListeners();
	}

	addListeners() {
		this.addSidebarTouchListener();
		this.addSidebarItemTouchListener();
		this.addSectionTouchListener();
		this.addGridTouchListener();
		this.addProjectTouchListener();
	}

	activateElement(element) {
		element.classList.add("active");
		element.classList.remove("inactive");
	}

	deactivateElement(element) {
		element.classList.add("inactive");
		element.classList.remove("active");
	}

	deactivateGridElement() {
		if (this.selGridElem != undefined) {
			this.deactivateElement(this.selGridElem);
			this.selGridElem = undefined;
		}
	}

	deactivateProjectElement() {
		if (this.selProjectElem != undefined) {
			this.deactivateElement(this.selProjectElem);
			this.selProjectElem = undefined;
		}
	}

	getElementName(element) {
		var className = element.className;
		var elementName = className.split(" ")[0];
		return elementName;
	}

	handleSectionElement(section, element) {
		if (section == element) {
			if (this.selSectionElem != undefined) {
				if (section != this.selSectionElem) {
					this.deactivateGridElement();
					this.deactivateProjectElement();
				}
			}
		}

		this.updateSectionState(section, element);
	}

	handleProjectElement(element) {
		this.updateProjectState(element);
		this.deactivateGridElement();
	}

	handleGridElement(element) {
		this.updateGridState(element);
		this.deactivateProjectElement();
	}

	updateStates(element) {
		var section = element.closest("section");
		var elementName = this.getElementName(element);

		if (elementName == "project") {
			this.handleProjectElement(element);
		} else if (elementName == "grid-item") {
			this.handleGridElement(element);
		}

		if (section) {
			this.handleSectionElement(section, element);
		}
	}

	updateSectionState(section, element) {
		if (this.selSectionElem != undefined) {
			this.deactivateElement(this.selSectionElem);
		}

		this.activateElement(section);
		this.selSectionElem = section;
	}

	updateProjectState(element) {
		if (this.selProjectElem != undefined) {
			this.deactivateElement(this.selProjectElem);
			if (element == this.selProjectElem) {
				this.selProjectElem = undefined;
				return;
			}
		}
		this.activateElement(element);
		this.selProjectElem = element;
	}

	updateGridState(element) {
		if (this.selGridElem != undefined) {
			this.deactivateElement(this.selGridElem);
			if (element == this.selGridElem) {
				this.selGridElem = undefined;
				return;
			}
		}
		this.activateElement(element);
		this.selGridElem = element;
	}

	updateGridElem(gridElem) {
		if (this.selGridElem !== undefined && this.selGridElem != gridElem) {
			this.selGridElem.classList.remove("active");
			this.selGridElem.classList.add("inactive");
		}

		gridElem.classList.toggle("active");
		gridElem.classList.toggle("inactive");

		this.selGridElem = gridElem;
	}

	addSidebarTouchListener() {
		var sidebarElem = document.querySelector(".sidebar");
		sidebarElem.addEventListener("touchstart", (event) => {
			event.preventDefault();
			sidebarElem.classList.toggle("active");
			sidebarElem.classList.toggle("inactive");
		});
	}

	addSidebarItemTouchListener() {
		var tocElem = document.querySelector(".table-of-contents");
		var tocList = tocElem.querySelectorAll("li");

		tocList.forEach((item) => {
			item.addEventListener("touchstart", (event) => {
				event.preventDefault();
				var targetId = item.querySelector("a").getAttribute("href");
				var targetElement = document.querySelector(targetId);
				this.updateStates(targetElement);
				if (targetElement) {
					targetElement.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
				}
			});
		});
	}

	addGridTouchListener() {
		var gridItems = document.querySelectorAll(".grid-item");

		gridItems.forEach((gridElem) => {
			gridElem.addEventListener("touchstart", () => {
				this.updateStates(gridElem);
			});
		});
	}

	addSectionTouchListener() {
		var aboutMe = document.querySelector(".about-me");
		var languagesTools = document.querySelector(".languages-tools");
		var projects = document.querySelector(".projects");

		var sectionItems = [projects, aboutMe, languagesTools];

		sectionItems.forEach((sectionElem) => {
			if (sectionElem) {
				sectionElem.addEventListener("touchstart", () => {
					this.updateStates(sectionElem);
				});
			}
		});
	}

	addProjectTouchListener() {
		var projectItems = document.querySelectorAll(".project");

		projectItems.forEach((projectElem) => {
			projectElem.addEventListener("touchstart", () => {
				this.updateStates(projectElem);
			});
		});
	}
}

function main() {
	new TopBar();
	new Sidebar();
	new TouchBehavior();
}

main();
