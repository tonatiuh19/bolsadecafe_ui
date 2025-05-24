import { Component } from '@angular/core';
import { fromLanding } from '../../store/selectors';
import { Store } from '@ngrx/store';
import { faMugHot } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-loading-mask',
  standalone: false,
  templateUrl: './loading-mask.component.html',
  styleUrl: './loading-mask.component.css',
})
export class LoadingMaskComponent {
  public selecIsloading$ = this.store.select(fromLanding.selecIsloading);

  faMugHot = faMugHot;

  constructor(private store: Store) {}
}
