import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const routingAnimation = trigger('routing', [
  transition('* <=> *', [
    style({ transform: 'translateX(100%)' }),
    animate('0.2s ease-in-out', style({ transform: 'translateX(0%)' })),
  ]),
]);
