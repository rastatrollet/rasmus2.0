export default function isVisibleInDOM(el) {
  return window.getComputedStyle(el).display !== "none";
}
