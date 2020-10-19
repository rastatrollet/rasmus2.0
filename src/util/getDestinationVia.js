const viaRegExp = /\s*via\s*/;

export default function getDestinationVia(departure) {
  if (viaRegExp.test(departure.direction)) {
    const [direction, via] = departure.direction.split(viaRegExp);
    return Object.assign({}, departure, {
      direction,
      via,
    });
  }
  return departure;
}
