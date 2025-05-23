import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faUserCircle, faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { AuthService } from '@auth0/auth0-angular';
import { Store } from '@ngrx/store';
import { fromLanding } from '../../store/selectors';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: false,
})
export class HeaderComponent implements OnInit {
  @Input() isMain = true;
  @Input() isNeutral = false;

  public selectLandingState$ = this.store.select(
    fromLanding.selectLandingState
  );

  faUserCircle = faUserCircle;
  faNewspaper = faNewspaper;

  isLogged = false;

  titlePage = '';

  private unsubscribe$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private titleService: Title,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.isLogged = false;
    this.selectLandingState$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((state) => {
        console.log('state', state);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  login(): void {
    this.router.navigate(['iniciarsesion']);
  }

  logout(): void {}

  goToMyDashboard(): void {
    this.router.navigate(['dashboard']);
  }
}
