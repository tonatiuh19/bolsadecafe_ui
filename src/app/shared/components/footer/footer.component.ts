import { Component, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  standalone: false,
})
export class FooterComponent {
  faHeart = faHeart;

  constructor(private router: Router, private renderer: Renderer2) {}

  goToTermsAndConditions() {
    /*window.open(
      this.router.serializeUrl(
        this.router.createUrlTree(['terminosycondiciones'])
      ),
      '_blank'
    );*/
  }

  goToPrivacyTerms() {
    /*window.open(
      this.router.serializeUrl(
        this.router.createUrlTree(['avisodeprivacidad'])
      ),
      '_blank'
    );*/
  }

  goToNeedHelp() {
    //this.router.navigate(['necesitoayuda']);
  }
}
