console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let navLinks = $$("nav a");

// Step 2.2: Find the link to the current page
let currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname,
);

if (currentLink) {
  // or if (currentLink !== undefined)
  currentLink.classList.add('current');
}