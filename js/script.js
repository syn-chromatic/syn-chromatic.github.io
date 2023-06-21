var toc = document.querySelector ('.table-of-contents');
var tocPath = document.querySelector ('.toc-marker path');
var tocItems;

// Factor of screen size that the element must cross
// before it's considered visible
var TOP_MARGIN = 0.1;
var BOTTOM_MARGIN = 0.2;
var pathLength;
var lastPathStart, lastPathEnd;

document.addEventListener ('DOMContentLoaded', drawPath);
document.addEventListener ('DOMContentLoaded', sync);
window.addEventListener ('resize', drawPathEvent, false);
window.addEventListener ('scroll', sync, false);

document.addEventListener ('DOMContentLoaded', adjustSidebarContentHeight);
window.addEventListener ('resize', adjustSidebarContentHeight, false);

document.addEventListener ('touchstart', touchHandler, true);
document.addEventListener ('touchmove', touchHandler, true);
document.addEventListener ('touchend', touchHandler, true);
document.addEventListener ('touchcancel', touchHandler, true);

function touchHandler (event) {
  console.log (event);
  var touches = event.changedTouches, first = touches[0], type = '';
  switch (event.type) {
    case 'touchstart':
      type = 'mousedown';
      break;
    case 'touchmove':
      type = 'mousemove';
      break;
    case 'touchend':
      type = 'mouseup';
      break;
    default:
      return;
  }

  var simulatedEvent = document.createEvent ('MouseEvent');
  simulatedEvent.initMouseEvent (
    type,
    true,
    true,
    window,
    1,
    first.screenX,
    first.screenY,
    first.clientX,
    first.clientY,
    false,
    false,
    false,
    false,
    0 /*left*/,
    null
  );

  first.target.dispatchEvent (simulatedEvent);
  event.preventDefault ();
}

document
  .querySelector ('.sidebar-content')
  .addEventListener ('scroll', function () {
    var yDistance = -this.scrollTop + 12;
    var tocMarker = document.querySelector ('.toc-marker path');
    var tocMarkerTransition = tocMarker.style.transition;

    tocMarker.style.transition = 'none';
    tocMarker.style.transform = 'translateY(' + yDistance + 'px)';

    var transitionEndEvents = [
      'transitionend',
      'webkitTransitionEnd',
      'oTransitionEnd',
      'otransitionend',
      'MSTransitionEnd',
    ];

    var transitionRevert = function () {
      tocMarker.style.transition = tocMarkerTransition;
    };

    for (var i = 0; i < transitionEndEvents.length; i++) {
      tocMarker.addEventListener (transitionEndEvents[i], transitionRevert);
    }
  });

function adjustSidebarContentHeight () {
  var sidebar = document.querySelector ('.sidebar');
  var sidebarContent = document.querySelector ('.sidebar-content');

  if (sidebar && sidebarContent) {
    // Get the height, padding, and border
    var sidebarHeight = parseFloat (getComputedStyle (sidebar).height);
    var paddingTop = parseFloat (getComputedStyle (sidebar).paddingTop);
    var paddingBottom = parseFloat (getComputedStyle (sidebar).paddingBottom);
    var borderTop = parseFloat (getComputedStyle (sidebar).borderTopWidth);
    var borderBottom = parseFloat (
      getComputedStyle (sidebar).borderBottomWidth
    );

    // Calculate the available height within the sidebar
    var availableHeight =
      sidebarHeight - paddingTop - paddingBottom - borderTop - borderBottom;

    // Set the max-height of the sidebar-content
    sidebarContent.style.maxHeight = availableHeight + 'px';
  }
}

function drawPathEvent () {
  var sidebar = document.querySelector ('.sidebar');
  var transitionEndEvents = [
    'transitionend',
    'webkitTransitionEnd',
    'oTransitionEnd',
    'otransitionend',
    'MSTransitionEnd',
  ];

  for (var i = 0; i < transitionEndEvents.length; i++) {
    sidebar.addEventListener (transitionEndEvents[i], drawPath);
  }
}

function drawPath () {
  tocItems = [].slice.call (toc.querySelectorAll ('li'));

  // Cache element references and measurements
  tocItems = tocItems.map (function (item) {
    var anchor = item.querySelector ('a');
    var target = document.getElementById (
      anchor.getAttribute ('href').slice (1)
    );

    return {
      listItem: item,
      anchor: anchor,
      target: target,
    };
  });

  // Remove missing targets
  tocItems = tocItems.filter (function (item) {
    return !!item.target;
  });

  var path = [];
  var pathIndent;

  tocItems.forEach (function (item, i) {
    var x = item.anchor.offsetLeft - 5,
      y = item.anchor.offsetTop,
      height = item.anchor.offsetHeight;

    if (i === 0) {
      path.push ('M', x, y, 'L', x, y + height);
      item.pathStart = 0;
    } else {
      // Draw an additional line when there's a change in
      // indent levels
      if (pathIndent !== x) path.push ('L', pathIndent, y);

      path.push ('L', x, y);

      // Set the current path so that we can measure it
      tocPath.setAttribute ('d', path.join (' '));
      item.pathStart = tocPath.getTotalLength () || 0;

      path.push ('L', x, y + height);
    }
    pathIndent = x;
    tocPath.setAttribute ('d', path.join (' '));
    item.pathEnd = tocPath.getTotalLength ();
  });
  pathLength = tocPath.getTotalLength ();
}

function sync () {
  var windowHeight = window.innerHeight;
  var pathStart = pathLength, pathEnd = 0;
  var visibleItems = 0;

  tocItems.forEach (function (item) {
    var targetBounds = item.target.getBoundingClientRect ();

    if (
      targetBounds.bottom > windowHeight * TOP_MARGIN &&
      targetBounds.top < windowHeight * (1 - BOTTOM_MARGIN)
    ) {
      pathStart = Math.min (item.pathStart, pathStart);
      pathEnd = Math.max (item.pathEnd, pathEnd);

      visibleItems += 1;

      item.listItem.classList.add ('visible');
    } else {
      item.listItem.classList.remove ('visible');
    }
  });

  // Specify the visible path or hide the path altogether
  // if there are no visible items
  if (visibleItems > 0 && pathStart < pathEnd) {
    if (pathStart !== lastPathStart || pathEnd !== lastPathEnd) {
      tocPath.setAttribute ('stroke-dashoffset', '1');
      tocPath.setAttribute (
        'stroke-dasharray',
        '1, ' + pathStart + ', ' + (pathEnd - pathStart) + ', ' + pathLength
      );
      tocPath.setAttribute ('opacity', 1);
    }
  } else {
    tocPath.setAttribute ('opacity', 0);
  }
}
