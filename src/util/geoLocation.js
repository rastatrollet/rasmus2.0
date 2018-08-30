let positionPromise;

function transformPosition({ coords }) {
  return {
    lat: coords.latitude,
    lng: coords.longitude
  };
}

export function getPositionPromise() {
  if (positionPromise) return positionPromise;
  positionPromise = getPosition();
  return positionPromise;
}

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject();
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    }
  })
    .then((pos) => {
      console.log('got position', pos);
      return pos;
    })
    .then(transformPosition);
}
