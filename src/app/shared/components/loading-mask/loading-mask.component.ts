import { Component } from '@angular/core';
import { fromLanding } from '../../store/selectors';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-loading-mask',
  templateUrl: './loading-mask.component.html',
  styleUrl: './loading-mask.component.css',
})
export class LoadingMaskComponent {
  public selecIsloading$ = this.store.select(fromLanding.selecIsloading);

  constructor(private store: Store) {}
}
