import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faUserCircle, faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { AuthService } from '@auth0/auth0-angular';
import { Store } from '@ngrx/store';
import { fromLanding } from '../../store/selectors';
import { UserModel } from '../../store/states/landing.models';
import { LandingActions } from '../../store/actions';

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

  public user: UserModel = {} as UserModel;

  faUserCircle = faUserCircle;
  faNewspaper = faNewspaper;

  isLogged = false;
  hasSubscription = false;

  titlePage = '';

  private unsubscribe$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private titleService: Title,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.selectLandingState$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((state) => {
        this.user = state.user ?? ({} as UserModel);
        this.hasSubscription = this.user.has_subscription ?? false;
        this.isLogged = !!this.user.isLoggedIn;
      });

    this.auth.user$.subscribe((profile) => {
      if (profile) {
        this.store.dispatch(
          LandingActions.authenticateUser({
            user: {
              ...profile,
            },
          })
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  goToSubscriptions() {
    this.router.navigate(['suscribete']);
  }

  goToMySubscription() {
    this.router.navigate(['mi-suscripcion']);
  }

  login(): void {
    const urlSegment = this.router.url.split('/').slice(1).join('/');
    this.auth.loginWithRedirect({
      appState: { target: urlSegment },
    });
  }

  logout(): void {
    this.isLogged = false;
    this.router.navigate(['']);
    this.store.dispatch(LandingActions.logoutUser());
    this.auth.logout();
  }

  setDefaultPic(event: Event) {
    (event.target as HTMLImageElement).src =
      'https://garbrix.com/regalame/assets/images/user_default.png';
  }
}
