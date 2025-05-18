import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faUserCircle, faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: false,
})
export class HeaderComponent implements OnInit {
  @Input() isMain = true;
  @Input() isNeutral = false;

  faUserCircle = faUserCircle;
  faNewspaper = faNewspaper;

  isLogged = false;

  titlePage = '';

  private unsubscribe$ = new Subject<void>();

  constructor(private router: Router, private titleService: Title) {}

  ngOnInit(): void {
    this.isLogged = false;
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
