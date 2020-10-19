import TV from './trafikverket';
import VT from './vasttrafik';
import SL from './sl';

export const apiDict = {
  TV: {
    track: 'Spår',
    sname: 'Linje',
  },
  VT: {
    track: 'Läge',
    sname: 'Linje',
  },
  SL: {
    track: 'Läge',
    sname: 'Linje',
  },
};

export default {
  VT,
  TV,
  SL,
};
