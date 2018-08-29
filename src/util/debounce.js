export default function debounce(fn, delay, context) {
  let timeoutId;
  context = context || this;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(context, args), delay);
  };
}
