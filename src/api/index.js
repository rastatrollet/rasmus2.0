import TV from './trafikverket';
import VT from './vasttrafik';
import SL from './sl';
import RR from './resrobot';

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
  RR: {
    track: 'Läge',
    sname: 'Linje',
  },
};

export default {
  VT,
  TV,
  SL,
  RR,
};
