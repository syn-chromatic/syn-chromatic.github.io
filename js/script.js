var TOC = document.querySelector(".table-of-contents");
var TOC_PATH = document.querySelector(".toc-marker path");
var TOC_LIST = TOC.querySelectorAll("li");
var TOC_ITEMS = [].slice.call(TOC_LIST);
var SIDEBAR = document.querySelector(".sidebar");
var SIDEBAR_CONTENT = document.querySelector(".sidebar-content");

var PATH_LENGTH = undefined;
var PREV_PATH_START = undefined;
var PREV_PATH_END = undefined;

var PREV_PROJECT_ITEM = undefined;
var PREV_GRID_ITEM = undefined;
var PREV_SECTION_ITEM = undefined;

var TOP_MARGIN = 0.1;
var BOTTOM_MARGIN = 0.2;

setListeners();

// class Sidebar {
// 	constructor() {
// 		this.topMargin = 0.1;
// 		this.bottomMargin = 0.2;
// 		this.toc = document.querySelector(".table-of-contents");
// 		this.tocList = this.toc.querySelectorAll("li");
// 		this.tocItems = [].slice.call(this.tocList);
// 		this.markerPath = document.querySelector(".toc-marker path");
// 		this.pathLength = undefined;
// 		this.prevPathStart = undefined;
// 		this.prevPathEnd = undefined;
// 		this.sidebar = document.querySelector(".sidebar");
// 		this.sidebarContent = document.querySelector(".sidebar-content");
// 	}

// 	updateSidebarHeight() {
// 		if (SIDEBAR && SIDEBAR_CONTENT) {
// 			var sidebarHeight = parseFloat(getComputedStyle(this.sidebar).height);
// 			var paddingTop = parseFloat(getComputedStyle(this.sidebar).paddingTop);
// 			var paddingBottom = parseFloat(
// 				getComputedStyle(this.sidebar).paddingBottom
// 			);
// 			var borderTop = parseFloat(
// 				getComputedStyle(this.sidebar).borderTopWidth
// 			);
// 			var borderBottom = parseFloat(
// 				getComputedStyle(this.sidebar).borderBottomWidth
// 			);

// 			var padLength = paddingTop + paddingBottom;
// 			var borderLength = borderTop + borderBottom;
// 			var availableHeight = sidebarHeight - padLength - borderLength;

// 			this.sidebarContent.style.maxHeight = availableHeight + "px";
// 		}
// 	}

// 	syncMarker() {
// 		var windowHeight = window.innerHeight;
// 		var pathStart = this.pathLength;
// 		var pathEnd = 0;
// 		var visibleItems = 0;

// 		TOC_ITEMS.forEach(function (item) {
// 			var targetBounds = item.target.getBoundingClientRect();

// 			if (
// 				targetBounds.bottom > windowHeight * this.topMargin &&
// 				targetBounds.top < windowHeight * (1 - this.bottomMargin)
// 			) {
// 				pathStart = Math.min(item.pathStart, pathStart);
// 				pathEnd = Math.max(item.pathEnd, pathEnd);

// 				visibleItems += 1;

// 				item.listItem.classList.add("visible");
// 			} else {
// 				item.listItem.classList.remove("visible");
// 			}
// 		});

// 		// Specify the visible path or hide the path altogether
// 		// if there are no visible items
// 		if (visibleItems > 0 && pathStart < pathEnd) {
// 			if (pathStart !== this.prevPathStart || pathEnd !== this.prevPathEnd) {
// 				var dashArrayVal = this.getDashArrayValue(pathStart, pathEnd);

// 				this.markerPath.setAttribute("stroke-dashoffset", "1");
// 				this.markerPath.setAttribute("stroke-dasharray", dashArrayVal);
// 				TOC_PATH.setAttribute("opacity", 1);
// 			}
// 		} else {
// 			this.markerPath.setAttribute("opacity", 0);
// 		}
// 	}

// 	drawMarker() {
// 		this.tocItems = [].slice.call(this.tocList);

// 		// Cache element references and measurements
// 		this.tocItems = this.tocItems.map(function (item) {
// 			var anchor = item.querySelector("a");
// 			var target = document.getElementById(
// 				anchor.getAttribute("href").slice(1)
// 			);

// 			return {
// 				listItem: item,
// 				anchor: anchor,
// 				target: target,
// 			};
// 		});

// 		// Remove missing targets
// 		this.tocItems = this.tocItems.filter(function (item) {
// 			return !!item.target;
// 		});

// 		var path = [];
// 		var pathIndent;

// 		this.tocItems.forEach(function (item, i) {
// 			var x = item.anchor.offsetLeft - 5,
// 				y = item.anchor.offsetTop,
// 				height = item.anchor.offsetHeight;

// 			if (i === 0) {
// 				path.push("M", x, y, "L", x, y + height);
// 				item.pathStart = 0;
// 			} else {
// 				// Draw an additional line when there's a change in
// 				// indent levels
// 				if (pathIndent !== x) path.push("L", pathIndent, y);

// 				path.push("L", x, y);

// 				// Set the current path so that we can measure it
// 				this.markerPath.setAttribute("d", path.join(" "));
// 				item.pathStart = this.markerPath.getTotalLength() || 0;

// 				path.push("L", x, y + height);
// 			}
// 			pathIndent = x;
// 			this.markerPath.setAttribute("d", path.join(" "));
// 			item.pathEnd = this.markerPath.getTotalLength();
// 		});
// 		this.pathLength = this.markerPath.getTotalLength();
// 	}

// 	getDashArrayValue(pathStart, pathEnd) {
// 		var dashArrayVal = "1, ";
// 		dashArrayVal += pathStart + ", ";
// 		dashArrayVal += pathEnd - pathStart + ", ";
// 		dashArrayVal += PATH_LENGTH;
// 		return dashArrayVal;
// 	}
// }

function setListeners() {
	document.addEventListener("DOMContentLoaded", adjustSidebarContentHeight);
	document.addEventListener("DOMContentLoaded", drawPath);
	document.addEventListener("DOMContentLoaded", sync);

	window.addEventListener("resize", adjustSidebarContentHeight, false);
	window.addEventListener("resize", drawPathEvent, false);
	window.addEventListener("scroll", sync, false);

	setSidebarTouchListener();
	setSidebarTabTouchListener();
	setSidebarScrollListener();
	setGridItemTouchListener();
	setProjectItemTouchListener();
	setSectionItemTouchListener();
}

function setSidebarTouchListener() {
	TOC_LIST.forEach(function (item) {
		item.addEventListener("touchstart", function (event) {
			event.preventDefault();
			var targetId = item.querySelector("a").getAttribute("href");
			var targetElement = document.querySelector(targetId);
			handleSidebarSelection(targetElement);
			if (targetElement) {
				targetElement.scrollIntoView({
					behavior: "smooth",
				});
			}
		});
	});
}

function setSidebarTabTouchListener() {
	SIDEBAR.addEventListener("touchstart", function (event) {
		event.preventDefault();
		SIDEBAR.classList.toggle("opened");
		SIDEBAR.classList.toggle("closed");
	});
}

function setGridItemTouchListener() {
	var gridItems = document.querySelectorAll(".grid-item");

	gridItems.forEach(function (gridItem) {
		gridItem.addEventListener("touchstart", function (_) {
			toggleSectionItemFromElement(gridItem);
			toggleGridItem(gridItem);
		});
	});
}

function setSectionItemTouchListener() {
	var projects = document.querySelector(".projects");
	var aboutMe = document.querySelector(".about-me");
	var languagesTools = document.querySelector(".languages-tools");

	var sectionItems = [projects, aboutMe, languagesTools];

	sectionItems.forEach(function (sectionItem) {
		sectionItem.addEventListener("touchstart", function (_) {
			toggleSectionItemFromElement(sectionItem);
		});
	});
}

function setProjectItemTouchListener() {
	var projectItems = document.querySelectorAll(".project");

	projectItems.forEach(function (projectItem) {
		projectItem.addEventListener("touchstart", function (_) {
			toggleSectionItemFromElement(projectItem);
			toggleProjectItem(projectItem);
		});
	});
}

function setSidebarScrollListener() {
	SIDEBAR_CONTENT.addEventListener("scroll", function () {
		var yDistance = -this.scrollTop + 12;
		var tocMarker = document.querySelector(".toc-marker path");
		var tocMarkerTransition = tocMarker.style.transition;

		tocMarker.style.transition = "none";
		tocMarker.style.transform = "translateY(" + yDistance + "px)";

		var transitionEndEvents = [
			"transitionend",
			"webkitTransitionEnd",
			"oTransitionEnd",
			"otransitionend",
			"MSTransitionEnd",
		];

		var transitionRevert = function () {
			tocMarker.style.transition = tocMarkerTransition;
		};

		for (var i = 0; i < transitionEndEvents.length; i++) {
			tocMarker.addEventListener(transitionEndEvents[i], transitionRevert);
		}
	});
}

function handleSidebarSelection(element) {
	var elementName = element.className;
	if (elementName.startsWith("project") && !elementName.startsWith("projects")) {
		toggleProjectItem(element);
		toggleSectionItemFromElement(element);
	} else {
		if (PREV_PROJECT_ITEM != undefined) {
			toggleProjectItem(PREV_PROJECT_ITEM);
		}

		if (
			PREV_GRID_ITEM != undefined &&
			!PREV_GRID_ITEM.className.includes("inactive")
		) {
			console.log(PREV_GRID_ITEM);
			toggleGridItem(PREV_GRID_ITEM);
		}

		toggleSectionItemFromElement(element);
	}
}

function toggleProjectItem(projectItem) {
	if (PREV_PROJECT_ITEM !== undefined && PREV_PROJECT_ITEM != projectItem) {
		PREV_PROJECT_ITEM.classList.remove("active");
		PREV_PROJECT_ITEM.classList.add("inactive");
	}

	projectItem.classList.toggle("active");
	projectItem.classList.toggle("inactive");

	PREV_PROJECT_ITEM = projectItem;
}

function toggleGridItem(gridItem) {
	if (PREV_GRID_ITEM !== undefined && PREV_GRID_ITEM != gridItem) {
		PREV_GRID_ITEM.classList.remove("active");
		PREV_GRID_ITEM.classList.add("inactive");
	}

	gridItem.classList.toggle("active");
	gridItem.classList.toggle("inactive");

	PREV_GRID_ITEM = gridItem;
}

function toggleSectionItemFromElement(element) {
	var closestSection = element.closest("section");
	if (closestSection != PREV_SECTION_ITEM) {
		toggleSectionItem(closestSection);
	}
}

function toggleSectionItem(sectionItem) {
	if (PREV_SECTION_ITEM !== undefined && PREV_SECTION_ITEM != sectionItem) {
		PREV_SECTION_ITEM.classList.remove("active");
		PREV_SECTION_ITEM.classList.add("inactive");
	}

	sectionItem.classList.toggle("active");
	sectionItem.classList.toggle("inactive");

	PREV_SECTION_ITEM = sectionItem;
}

function adjustSidebarContentHeight() {
	if (SIDEBAR && SIDEBAR_CONTENT) {
		var sidebarHeight = parseFloat(getComputedStyle(SIDEBAR).height);
		var paddingTop = parseFloat(getComputedStyle(SIDEBAR).paddingTop);
		var paddingBottom = parseFloat(getComputedStyle(SIDEBAR).paddingBottom);
		var borderTop = parseFloat(getComputedStyle(SIDEBAR).borderTopWidth);
		var borderBottom = parseFloat(getComputedStyle(SIDEBAR).borderBottomWidth);

		var padLength = paddingTop + paddingBottom;
		var borderLength = borderTop + borderBottom;
		var availableHeight = sidebarHeight - padLength - borderLength;

		SIDEBAR_CONTENT.style.maxHeight = availableHeight + "px";
	}
}

function drawPathEvent() {
	var transitionEndEvents = [
		"transitionend",
		"webkitTransitionEnd",
		"oTransitionEnd",
		"otransitionend",
		"MSTransitionEnd",
	];

	for (var i = 0; i < transitionEndEvents.length; i++) {
		SIDEBAR.addEventListener(transitionEndEvents[i], drawPath);
	}
}

function drawPath() {
	TOC_ITEMS = [].slice.call(TOC_LIST);

	// Cache element references and measurements
	TOC_ITEMS = TOC_ITEMS.map(function (item) {
		var anchor = item.querySelector("a");
		var target = document.getElementById(anchor.getAttribute("href").slice(1));

		return {
			listItem: item,
			anchor: anchor,
			target: target,
		};
	});

	// Remove missing targets
	TOC_ITEMS = TOC_ITEMS.filter(function (item) {
		return !!item.target;
	});

	var path = [];
	var pathIndent;

	TOC_ITEMS.forEach(function (item, i) {
		var x = item.anchor.offsetLeft - 5,
			y = item.anchor.offsetTop,
			height = item.anchor.offsetHeight;

		if (i === 0) {
			path.push("M", x, y, "L", x, y + height);
			item.pathStart = 0;
		} else {
			// Draw an additional line when there's a change in
			// indent levels
			if (pathIndent !== x) path.push("L", pathIndent, y);

			path.push("L", x, y);

			// Set the current path so that we can measure it
			TOC_PATH.setAttribute("d", path.join(" "));
			item.pathStart = TOC_PATH.getTotalLength() || 0;

			path.push("L", x, y + height);
		}
		pathIndent = x;
		TOC_PATH.setAttribute("d", path.join(" "));
		item.pathEnd = TOC_PATH.getTotalLength();
	});
	PATH_LENGTH = TOC_PATH.getTotalLength();
}

function getDashArrayValue(pathStart, pathEnd) {
	var dashArrayVal = "1, ";
	dashArrayVal += pathStart + ", ";
	dashArrayVal += pathEnd - pathStart + ", ";
	dashArrayVal += PATH_LENGTH;
	return dashArrayVal;
}

function sync() {
	var windowHeight = window.innerHeight;
	var pathStart = PATH_LENGTH;
	var pathEnd = 0;
	var visibleItems = 0;

	TOC_ITEMS.forEach(function (item) {
		var targetBounds = item.target.getBoundingClientRect();

		if (
			targetBounds.bottom > windowHeight * TOP_MARGIN &&
			targetBounds.top < windowHeight * (1 - BOTTOM_MARGIN)
		) {
			pathStart = Math.min(item.pathStart, pathStart);
			pathEnd = Math.max(item.pathEnd, pathEnd);

			visibleItems += 1;

			item.listItem.classList.add("visible");
		} else {
			item.listItem.classList.remove("visible");
		}
	});

	// Specify the visible path or hide the path altogether
	// if there are no visible items
	if (visibleItems > 0 && pathStart < pathEnd) {
		if (pathStart !== PREV_PATH_START || pathEnd !== PREV_PATH_END) {
			var dashArrayVal = getDashArrayValue(pathStart, pathEnd);

			TOC_PATH.setAttribute("stroke-dashoffset", "1");
			TOC_PATH.setAttribute("stroke-dasharray", dashArrayVal);
			TOC_PATH.setAttribute("opacity", 1);
		}
	} else {
		TOC_PATH.setAttribute("opacity", 0);
	}
}
