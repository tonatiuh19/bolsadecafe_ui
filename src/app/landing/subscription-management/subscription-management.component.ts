import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { fromLanding } from '../../shared/store/selectors';
import { Subject, take, takeUntil } from 'rxjs';
import {
  SubscriptionInfo,
  UserModel,
} from '../../shared/store/states/landing.models';
import { LandingActions } from '../../shared/store/actions';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-subscription-management',
  templateUrl: './subscription-management.component.html',
  styleUrls: ['./subscription-management.component.css'],
  standalone: false,
})
export class SubscriptionManagementComponent implements OnInit, OnDestroy {
  public selectSubscription$ = this.store.select(
    fromLanding.selectSubscription
  );

  //TODO: Remove this when ux is ready
  public selectUser$ = this.store.select(fromLanding.selectUser);
  user!: UserModel;

  subscription = {
    plan: '500gr de café',
    price: 299,
    status: 'Activa',
    nextDelivery: '2025-06-15',
    recipient: 'Tonatiuh Gomez',
    address: 'Ignacio Lopez Rayon 817, Lagos de Moreno, JA, 47470',
    email: 'usuario@ejemplo.com',
    paymentMethod: '**** **** **** 4242',
  };

  cancelPhrase = '';
  cancelInput = '';

  private unsubscribe$ = new Subject<void>();

  constructor(
    private renderer: Renderer2,
    private store: Store,
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.generateCancelPhrase();
    this.store.dispatch(
      LandingActions.insertVisitor({
        section: 'subscription-management',
      })
    );
    this.selectSubscription$
      .pipe(take(1)) // Only take the first value after refresh
      .subscribe((subscribtion: SubscriptionInfo | null) => {
        console.log('Subscription data:', subscribtion);
        if (subscribtion && subscribtion.bdec_subscription_stripe_id) {
          this.store.dispatch(
            LandingActions.retrieveSubscription({
              stripe_subscription_id: subscribtion.bdec_subscription_stripe_id,
            })
          );
        }
      });

    //TODO: Remove this when ux is ready
    this.selectUser$.pipe(take(1)).subscribe((user: UserModel) => {
      if (user) {
        this.user = user;
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updatePaymentMethod() {
    alert('Funcionalidad para actualizar método de pago');
  }

  openCancelModal() {
    this.generateCancelPhrase();
    this.cancelInput = '';
    // Open Bootstrap modal programmatically
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('cancelModal')
    );
    modal.show();
  }

  updateSubscription() {
    alert('Funcionalidad para actualizar suscripción');
  }

  generateCancelPhrase() {
    // Example random phrases
    /*const phrases = [
      '¡Hoy decido pausar mi suscripción de café! ☕️',
      'Prefiero esperar para recibir más café, ¡gracias! 😊',
      'Cancélame la suscripción, pero volveré pronto. #Café',
      'Por ahora, no deseo recibir más café especial…',
      'He decidido tomar un descanso del café, ¿será posible? 🤔',
      '¡Gracias por el café, pero quiero cancelar mi suscripción! 💔',
      'No más café por el momento, muchas gracias. ✋',
      'Quiero cancelar mi suscripción, pero seguiré soñando con café. 🌙',
      'Por favor, cancela mi suscripción a Bolsa de Café. @cancelar',
      'Hoy es un buen día para pausar mi café mensual. —El suscriptor',
      '¡Cancela mi suscripción ahora! %Café%',
      '¿Seguro que quiero cancelar? Sí, ¡café adiós! 😢',
      'Cancela mi suscripción: ¡es mi decisión final! *FIN*',
      '¡Hasta pronto, café delicioso! Cancela mi suscripción. ç',
      '“Café, adiós por ahora.” ü',
    ];*/
    const phrases = [
      '¡Hoy decido pausar mi suscripción de café!',
      'Prefiero esperar para recibir más café, ¡gracias!',
      'Cancélame la suscripción, pero volveré pronto.',
      'Por ahora, no deseo recibir más café especial.',
      'He decidido tomar un descanso del café, ¿será posible?',
      '¡Gracias por el café, pero quiero cancelar mi suscripción!',
      'No más café por el momento, muchas gracias.',
      'Quiero cancelar mi suscripción, pero seguiré soñando con café.',
      'Por favor, cancela mi suscripción a Bolsa de Café.',
      'Hoy es un buen día para pausar mi café mensual.',
      '¿Estás seguro? Sí, quiero cancelar mi suscripción.',
      '¡Café, te extrañaré! Pero debo cancelar.',
      'Cancela mi suscripción: ¡es mi decisión final!',
      '¡Hasta pronto, café delicioso! Cancela mi suscripción.',
      '“Café, adiós por ahora.”',
      '¡No más café… por ahora!',
      'Cancélame la suscripción, ¡pero deja el aroma!',
      'Quiero decir “adiós” a mi café mensual.',
      '¡Cancela mi suscripción, por favor! ☕️',
      'Hoy, mi suscripción de café llega a su fin.',
    ];
    this.cancelPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  }

  confirmCancel() {
    //TODO: Remove this when ux is ready
    this.store.dispatch(
      LandingActions.deleteUserAndSubscription({
        user_id: this.user.id_user,
      })
    );
    alert(
      'Suscripción y usuario eliminados correctamente. -Solo para pruebas-'
    );
    this.auth.logout();
    this.router.navigate(['']);
    // Optionally close modal
    (window as any).bootstrap.Modal.getInstance(
      document.getElementById('cancelModal')
    ).hide();
  }
}
